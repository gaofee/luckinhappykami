import { Request, Response } from 'express';
import { dbGet, dbAll, dbRun, dbGetCached, dbAllCached } from '../utils/database';
import { createHash } from 'crypto';

// 生成卡密密钥
function generateCardKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 加密卡密密钥 - 完全匹配PHP版本
function encryptCardKey(key: string): string {
  const salt = 'xiaoxiaoguai_card_system_2024';
  return createHash('sha1').update(key + salt).digest('hex');
}

// 验证卡密 - 完全匹配PHP版本
export const verifyCard = async (req: Request, res: Response) => {
  try {
    // 检查API是否启用
    const apiEnabled = await dbGet("SELECT value FROM settings WHERE name = 'api_enabled'");
    if (apiEnabled?.value !== '1') {
      return res.status(403).json({
        code: 2,
        message: 'API接口未启用',
        data: {}
      });
    }

    // 验证API密钥（支持Header和GET参数）
    const headers = req.headers;
    let api_key = '';

    // 优先从Header获取API密钥
    if (headers['x-api-key']) {
      api_key = headers['x-api-key'] as string;
    }
    // 如果是GET请求且Header中没有API密钥，则从URL参数获取
    else if (req.method === 'GET' && req.query.api_key) {
      api_key = req.query.api_key as string;
    }

    // 验证API密钥
    const apiKeyData = await dbGet('SELECT id FROM api_keys WHERE api_key = ? AND status = 1', [api_key]);
    if (!apiKeyData) {
      return res.status(401).json({
        code: 4,
        message: 'API密钥无效或已禁用',
        data: {}
      });
    }

    // 更新使用次数和最后使用时间
    await dbRun('UPDATE api_keys SET use_count = use_count + 1, last_use_time = CURRENT_TIMESTAMP WHERE api_key = ?', [api_key]);

    // 获取请求数据（支持GET和POST）
    let card_key = '';
    let device_id = '';

    if (req.method === 'POST') {
      // 处理POST请求
      const input = req.body;
      if (input) {
        card_key = input.card_key ? input.card_key.trim() : '';
        device_id = input.device_id ? input.device_id.trim() : '';
      }
    } else if (req.method === 'GET') {
      // 处理GET请求
      card_key = req.query.card_key ? (req.query.card_key as string).trim() : '';
      device_id = req.query.device_id ? (req.query.device_id as string).trim() : '';
    }

    if (!card_key) {
      return res.status(400).json({
        code: 1,
        message: '卡密无效或已被其他设备使用',
        data: null
      });
    }

    if (!device_id) {
      return res.status(400).json({
        code: 1,
        message: '卡密无效或已被其他设备使用',
        data: null
      });
    }

    // 对输入的卡密进行加密
    const encrypted_key = encryptCardKey(card_key);

    // 首先检查卡密是否存在
    const card = await dbGet('SELECT * FROM cards WHERE encrypted_key = ?', [encrypted_key]);

    if (!card) {
      return res.status(400).json({
        code: 1,
        message: '卡密无效或已被其他设备使用',
        data: null
      });
    }

    // 检查卡密是否被禁用
    if (card.status == 2) {
      return res.status(403).json({
        code: 5,
        message: '此卡密已被管理员禁用',
        data: {}
      });
    }

    // 检查次数卡密的剩余次数
    if (card.card_type == 'count' && card.remaining_count <= 0) {
      return res.status(403).json({
        code: 7,
        message: '此卡密使用次数已用完',
        data: {}
      });
    }

    // 检查卡密状态和设备绑定
    if (card.status == 1) {
      // 已使用的卡密
      if (card.device_id === device_id) {
        // 同一设备重复验证
        // 检查是否允许重复验证
        if (card.allow_reverify) {
          // 次数卡密需要减少次数
          if (card.card_type == 'count' && card.remaining_count > 0) {
            // 计算新剩余次数
            const remaining = card.remaining_count - 1;
            // 更新剩余次数
            await dbRun('UPDATE cards SET remaining_count = ? WHERE id = ?', [remaining, card.id]);

            return res.json({
              code: 0,
              message: '验证成功，剩余次数：' + remaining,
              data: {
                card_key: card.card_key,
                status: 1,
                use_time: card.use_time,
                expire_time: card.expire_time,
                card_type: card.card_type,
                remaining_count: remaining,
                total_count: card.total_count,
                device_id: device_id,
                allow_reverify: card.allow_reverify
              }
            });
          } else {
            // 时间卡密正常返回
            return res.json({
              code: 0,
              message: '验证成功(重复验证)',
              data: {
                card_key: card.card_key,
                status: 1,
                use_time: card.use_time,
                expire_time: card.expire_time,
                card_type: card.card_type,
                duration: card.duration,
                device_id: device_id,
                allow_reverify: card.allow_reverify
              }
            });
          }
        } else {
          // 不允许重复验证
          return res.status(403).json({
            code: 6,
            message: '此卡密不允许重复验证',
            data: {}
          });
        }
      } else {
        // 其他设备尝试使用 或 卡密已被解绑，允许新设备绑定
        if (!card.device_id) {
          // 卡密已被解绑，允许当前设备重新绑定
          const expire_time = card.expire_time; // 保持原来的到期时间
          const use_time = card.use_time; // 保持原来的使用时间

          const verify_method = req.method === 'POST' ? 'post' : 'get';
          await dbRun('UPDATE cards SET device_id = ?, verify_method = ? WHERE id = ?', [device_id, verify_method, card.id]);

          const response_data: any = {
            code: 0,
            message: '验证成功 (重新绑定设备)',
            data: {
              card_key: card.card_key,
              status: 1,
              use_time: use_time,
              expire_time: expire_time,
              card_type: card.card_type,
              device_id: device_id,
              allow_reverify: card.allow_reverify
            }
          };

          // 根据卡密类型添加不同的数据
          if (card.card_type == 'time') {
            response_data.data.duration = card.duration;
          } else {
            response_data.data.remaining_count = card.remaining_count;
            response_data.data.total_count = card.total_count;
          }

          return res.json(response_data);
        } else {
          // 卡密已绑定到其他设备
          return res.status(400).json({
            code: 1,
            message: '此卡密已被其他设备使用',
            data: {}
          });
        }
      }
    } else if (card.status == 0) {
      // 新卡密激活
      const verify_method = req.method === 'POST' ? 'post' : 'get';

      if (card.card_type == 'time') {
        // 时间卡密处理
        let expire_time = null;
        if (card.duration > 0) {
          expire_time = new Date(Date.now() + card.duration * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        }

        await dbRun('UPDATE cards SET status = 1, use_time = CURRENT_TIMESTAMP, expire_time = ?, verify_method = ?, device_id = ? WHERE id = ?', [
          expire_time, verify_method, device_id, card.id
        ]);

        return res.json({
          code: 0,
          message: '验证成功',
          data: {
            card_key: card.card_key,
            status: 1,
            use_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
            expire_time: expire_time,
            card_type: 'time',
            duration: card.duration,
            device_id: device_id,
            allow_reverify: card.allow_reverify
          }
        });
      } else {
        // 次数卡密处理，首次验证也消耗一次
        const remaining = card.total_count - 1;

        await dbRun('UPDATE cards SET status = 1, use_time = CURRENT_TIMESTAMP, verify_method = ?, device_id = ?, remaining_count = ? WHERE id = ?', [
          verify_method, device_id, remaining, card.id
        ]);

        return res.json({
          code: 0,
          message: '验证成功，剩余次数：' + remaining,
          data: {
            card_key: card.card_key,
            status: 1,
            use_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
            card_type: 'count',
            total_count: card.total_count,
            remaining_count: remaining,
            device_id: device_id,
            allow_reverify: card.allow_reverify
          }
        });
      }
    }

  } catch (error) {
    console.error('卡密验证失败:', error);
    return res.status(500).json({
      code: 3,
      message: '系统错误',
      data: {}
    });
  }
};

// 生成卡密
export const generateCards = async (req: Request, res: Response) => {
  try {
    const { count, card_type, duration, total_count, allow_reverify } = req.body;

    if (!count || count < 1 || count > 1000) {
      return res.status(400).json({
        code: 400,
        message: '生成数量必须在1-1000之间',
      });
    }

    const cards: Array<{
      card_key: string;
      encrypted_key: string;
      card_type: string;
      duration: number | null;
      total_count: number | null;
      remaining_count: number | null;
      allow_reverify: boolean;
      create_time: string;
    }> = [];
    const cardKeys = new Set<string>();

    // 生成不重复的卡密
    for (let i = 0; i < count; i++) {
      let cardKey: string;
      let attempts = 0;

      do {
        cardKey = generateCardKey();
        attempts++;
        if (attempts > 1000) {
          return res.status(500).json({
            code: 500,
            message: '生成卡密失败，请重试',
          });
        }
      } while (cardKeys.has(cardKey));

      cardKeys.add(cardKey);

      // 创建加密密钥 - 使用和PHP版本相同的加密方式
      const encryptedKey = encryptCardKey(cardKey);

      cards.push({
        card_key: cardKey,
        encrypted_key: encryptedKey,
        card_type: card_type || 'time',
        duration: card_type === 'time' ? (duration || 30) : null,
        total_count: card_type === 'count' ? (total_count || 100) : null,
        remaining_count: card_type === 'count' ? (total_count || 100) : null,
        allow_reverify: allow_reverify !== false,
        create_time: new Date().toISOString(),
      });
    }

    // 批量插入数据库 - 使用事务优化性能
    const db = require('../utils/database').db;
    await new Promise<void>((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const stmt = db.prepare(`
          INSERT INTO cards (
            card_key, encrypted_key, card_type, duration, total_count,
            remaining_count, allow_reverify, create_time
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const card of cards) {
          stmt.run([
            card.card_key,
            card.encrypted_key,
            card.card_type,
            card.duration,
            card.total_count,
            card.remaining_count,
            card.allow_reverify ? 1 : 0,
            card.create_time,
          ]);
        }

        stmt.finalize();

        db.run('COMMIT', (err: any) => {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });

    res.json({
      code: 0,
      message: `成功生成 ${count} 个卡密`,
      data: {
        cards: cards.map(card => ({
          card_key: card.card_key,
          card_type: card.card_type,
          duration: card.duration,
          total_count: card.total_count,
        })),
        count,
      },
    });

  } catch (error) {
    console.error('生成卡密失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 获取卡密列表
export const getCards = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, card_type, search } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (status !== undefined && status !== '') {
      whereClause += ' AND status = ?';
      params.push(parseInt(status as string));
    }

    if (card_type) {
      whereClause += ' AND card_type = ?';
      params.push(card_type);
    }

    if (search) {
      whereClause += ' AND card_key LIKE ?';
      params.push(`%${search}%`);
    }

    // 获取总数
    const totalResult = await dbGet(
      `SELECT COUNT(*) as total FROM cards WHERE ${whereClause}`,
      params
    );

    // 获取分页数据
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const cards = await dbAll(
      `SELECT * FROM cards WHERE ${whereClause} ORDER BY create_time DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit as string), offset]
    );

    res.json({
      code: 0,
      message: '获取成功',
      data: {
        cards,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalResult.total,
          totalPages: Math.ceil(totalResult.total / parseInt(limit as string)),
        },
      },
    });

  } catch (error) {
    console.error('获取卡密列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 删除卡密
export const deleteCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await dbRun('DELETE FROM cards WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({
        code: 404,
        message: '卡密不存在',
      });
    }

    res.json({
      code: 0,
      message: '删除成功',
    });

  } catch (error) {
    console.error('删除卡密失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 批量删除卡密
export const batchDeleteCards = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的卡密ID列表',
      });
    }

    const placeholders = ids.map(() => '?').join(',');
    const result = await dbRun(
      `DELETE FROM cards WHERE id IN (${placeholders})`,
      ids
    );

    res.json({
      code: 0,
      message: `成功删除 ${result.changes} 个卡密`,
    });

  } catch (error) {
    console.error('批量删除卡密失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 停用卡密
export const disableCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const card = await dbGet('SELECT * FROM cards WHERE id = ?', [id]);

    if (!card) {
      return res.status(404).json({
        code: 404,
        message: '卡密不存在',
      });
    }

    if (card.status === 2) {
      return res.status(400).json({
        code: 400,
        message: '卡密已经被停用',
      });
    }

    await dbRun('UPDATE cards SET status = 2 WHERE id = ?', [id]);

    res.json({
      code: 0,
      message: '卡密停用成功',
    });

  } catch (error) {
    console.error('停用卡密失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 启用卡密
export const enableCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const card = await dbGet('SELECT * FROM cards WHERE id = ?', [id]);

    if (!card) {
      return res.status(404).json({
        code: 404,
        message: '卡密不存在',
      });
    }

    if (card.status !== 2) {
      return res.status(400).json({
        code: 400,
        message: '卡密未被停用',
      });
    }

    // 将卡密从停用状态恢复为已使用状态，保持原有的使用信息和设备绑定
    await dbRun('UPDATE cards SET status = 1 WHERE id = ?', [id]);

    res.json({
      code: 0,
      message: '卡密启用成功',
    });

  } catch (error) {
    console.error('启用卡密失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 续期卡密
export const extendCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { days } = req.body;

    if (!days || days < 1 || days > 365) {
      return res.status(400).json({
        code: 400,
        message: '续期天数必须在1-365天之间',
      });
    }

    const card = await dbGet('SELECT * FROM cards WHERE id = ?', [id]);

    if (!card) {
      return res.status(404).json({
        code: 404,
        message: '卡密不存在',
      });
    }

    if (card.card_type !== 'time') {
      return res.status(400).json({
        code: 400,
        message: '只有时间类型的卡密才能续期',
      });
    }

    // 计算新的到期时间
    let newExpireTime: string;
    if (card.expire_time) {
      // 如果已有到期时间，在现有时间基础上延长
      const currentExpireTime = new Date(card.expire_time);
      newExpireTime = new Date(currentExpireTime.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    } else {
      // 如果没有到期时间，从现在开始计算
      newExpireTime = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    await dbRun('UPDATE cards SET expire_time = ?, duration = duration + ? WHERE id = ?', [
      newExpireTime,
      days,
      id
    ]);

    res.json({
      code: 0,
      message: `卡密续期成功，延长了 ${days} 天`,
      data: {
        new_expire_time: newExpireTime
      }
    });

  } catch (error) {
    console.error('续期卡密失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 增加卡密次数
export const addCardCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { count } = req.body;

    if (!count || count < 1 || count > 10000) {
      return res.status(400).json({
        code: 400,
        message: '增加次数必须在1-10000之间',
      });
    }

    const card = await dbGet('SELECT * FROM cards WHERE id = ?', [id]);

    if (!card) {
      return res.status(404).json({
        code: 404,
        message: '卡密不存在',
      });
    }

    if (card.card_type !== 'count') {
      return res.status(400).json({
        code: 400,
        message: '只有次数类型的卡密才能增加次数',
      });
    }

    const newTotalCount = card.total_count + count;
    const newRemainingCount = card.remaining_count + count;

    await dbRun(
      'UPDATE cards SET total_count = ?, remaining_count = ? WHERE id = ?',
      [newTotalCount, newRemainingCount, id]
    );

    res.json({
      code: 0,
      message: `卡密次数增加成功，增加了 ${count} 次`,
      data: {
        new_total_count: newTotalCount,
        new_remaining_count: newRemainingCount
      }
    });

  } catch (error) {
    console.error('增加卡密次数失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 解绑设备
export const unbindDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const card = await dbGet('SELECT * FROM cards WHERE id = ?', [id]);

    if (!card) {
      return res.status(404).json({
        code: 404,
        message: '卡密不存在',
      });
    }

    if (!card.device_id) {
      return res.status(400).json({
        code: 400,
        message: '卡密未绑定设备',
      });
    }

    await dbRun('UPDATE cards SET device_id = NULL WHERE id = ?', [id]);

    res.json({
      code: 0,
      message: '设备解绑成功',
    });

  } catch (error) {
    console.error('解绑设备失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};
