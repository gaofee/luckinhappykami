import { Request, Response } from 'express';
import { dbGet, dbAll, dbRun } from '../utils/database';
import { createHash } from 'crypto';

// 生成API密钥
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 获取API密钥列表
export const getApiKeys = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (status !== undefined && status !== '') {
      whereClause += ' AND status = ?';
      params.push(parseInt(status as string));
    }

    // 获取总数
    const totalResult = await dbGet(
      `SELECT COUNT(*) as total FROM api_keys WHERE ${whereClause}`,
      params
    );

    // 获取分页数据
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const apiKeys = await dbAll(
      `SELECT * FROM api_keys WHERE ${whereClause} ORDER BY create_time DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit as string), offset]
    );

    res.json({
      code: 0,
      message: '获取成功',
      data: {
        apiKeys,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalResult.total,
          totalPages: Math.ceil(totalResult.total / parseInt(limit as string)),
        },
      },
    });

  } catch (error) {
    console.error('获取API密钥列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 创建API密钥
export const createApiKey = async (req: Request, res: Response) => {
  try {
    const { key_name, description } = req.body;

    if (!key_name || key_name.trim().length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'API密钥名称不能为空',
      });
    }

    // 检查名称是否已存在
    const existingKey = await dbGet(
      'SELECT id FROM api_keys WHERE key_name = ?',
      [key_name.trim()]
    );

    if (existingKey) {
      return res.status(400).json({
        code: 400,
        message: 'API密钥名称已存在',
      });
    }

    // 生成API密钥
    const apiKey = generateApiKey();

    // 插入数据库
    const result = await dbRun(
      'INSERT INTO api_keys (key_name, api_key, description) VALUES (?, ?, ?)',
      [key_name.trim(), apiKey, description || '']
    );

    res.json({
      code: 0,
      message: 'API密钥创建成功',
      data: {
        id: result.lastID,
        key_name: key_name.trim(),
        api_key: apiKey,
        description: description || '',
        status: 1,
        use_count: 0,
        create_time: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('创建API密钥失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 更新API密钥状态
export const updateApiKeyStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 0 && status !== 1) {
      return res.status(400).json({
        code: 400,
        message: '状态值必须为0或1',
      });
    }

    const apiKey = await dbGet('SELECT * FROM api_keys WHERE id = ?', [id]);

    if (!apiKey) {
      return res.status(404).json({
        code: 404,
        message: 'API密钥不存在',
      });
    }

    await dbRun('UPDATE api_keys SET status = ? WHERE id = ?', [status, id]);

    res.json({
      code: 0,
      message: status === 1 ? 'API密钥启用成功' : 'API密钥禁用成功',
    });

  } catch (error) {
    console.error('更新API密钥状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 删除API密钥
export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await dbRun('DELETE FROM api_keys WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({
        code: 404,
        message: 'API密钥不存在',
      });
    }

    res.json({
      code: 0,
      message: '删除成功',
    });

  } catch (error) {
    console.error('删除API密钥失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 重置API密钥
export const resetApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const apiKey = await dbGet('SELECT * FROM api_keys WHERE id = ?', [id]);

    if (!apiKey) {
      return res.status(404).json({
        code: 404,
        message: 'API密钥不存在',
      });
    }

    // 生成新密钥
    const newApiKey = generateApiKey();

    await dbRun(
      'UPDATE api_keys SET api_key = ?, use_count = 0, last_use_time = NULL WHERE id = ?',
      [newApiKey, id]
    );

    res.json({
      code: 0,
      message: 'API密钥重置成功',
      data: {
        new_api_key: newApiKey,
      },
    });

  } catch (error) {
    console.error('重置API密钥失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 验证API密钥 (公开接口)
export const verifyApiKey = async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({
        code: 401,
        message: 'API密钥不能为空',
      });
    }

    const keyData = await dbGet(
      'SELECT id, key_name, status, use_count FROM api_keys WHERE api_key = ?',
      [apiKey]
    );

    if (!keyData) {
      return res.status(401).json({
        code: 401,
        message: '无效的API密钥',
      });
    }

    if (keyData.status !== 1) {
      return res.status(403).json({
        code: 403,
        message: 'API密钥已被禁用',
      });
    }

    // 更新使用统计
    await dbRun(
      'UPDATE api_keys SET use_count = use_count + 1, last_use_time = CURRENT_TIMESTAMP WHERE id = ?',
      [keyData.id]
    );

    // 将API密钥信息添加到请求对象中
    (req as any).apiKeyData = keyData;

    // 继续处理请求
    res.locals.apiKeyVerified = true;
    res.json({
      code: 0,
      message: 'API密钥验证成功',
      data: {
        key_name: keyData.key_name,
        use_count: keyData.use_count + 1,
      },
    });

  } catch (error) {
    console.error('验证API密钥失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 获取API调用统计
export const getApiStats = async (req: Request, res: Response) => {
  try {
    // 获取总的API调用统计
    const totalStats = await dbGet(`
      SELECT
        COUNT(*) as total_keys,
        SUM(use_count) as total_calls,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_keys,
        SUM(CASE WHEN last_use_time >= datetime('now', '-24 hours') THEN 1 ELSE 0 END) as recent_active
      FROM api_keys
    `);

    // 获取最近7天的每日调用统计
    const dailyStats = await dbAll(`
      SELECT
        DATE(last_use_time) as date,
        COUNT(*) as calls
      FROM api_keys
      WHERE last_use_time >= datetime('now', '-7 days')
      GROUP BY DATE(last_use_time)
      ORDER BY date DESC
    `);

    res.json({
      code: 0,
      message: '获取API统计成功',
      data: {
        overview: {
          total_keys: totalStats.total_keys || 0,
          total_calls: totalStats.total_calls || 0,
          active_keys: totalStats.active_keys || 0,
          recent_active: totalStats.recent_active || 0,
        },
        dailyStats,
      },
    });

  } catch (error) {
    console.error('获取API统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};
