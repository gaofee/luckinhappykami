import { Request, Response } from 'express';
import { dbGet, dbAll, dbRun } from '../utils/database';

// 获取所有系统设置
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await dbAll('SELECT name, value FROM settings ORDER BY name');

    // 转换为对象格式
    const settingsObj: Record<string, string> = {};
    settings.forEach((setting: any) => {
      settingsObj[setting.name] = setting.value;
    });

    res.json({
      code: 0,
      message: '获取设置成功',
      data: settingsObj,
    });

  } catch (error) {
    console.error('获取系统设置失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 更新系统设置
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settings = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        code: 400,
        message: '设置数据格式不正确',
      });
    }

    // 批量更新设置
    const updates = Object.entries(settings);

    for (const [name, value] of updates) {
      if (typeof name !== 'string' || typeof value !== 'string') {
        return res.status(400).json({
          code: 400,
          message: '设置项名称和值必须为字符串',
        });
      }

      // 使用INSERT OR REPLACE来更新或插入设置
      await dbRun(
        'INSERT OR REPLACE INTO settings (name, value, update_time) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [name, value]
      );
    }

    res.json({
      code: 0,
      message: `成功更新 ${updates.length} 个设置项`,
    });

  } catch (error) {
    console.error('更新系统设置失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 获取单个设置
export const getSetting = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const setting = await dbGet('SELECT name, value FROM settings WHERE name = ?', [name]);

    if (!setting) {
      return res.status(404).json({
        code: 404,
        message: '设置项不存在',
      });
    }

    res.json({
      code: 0,
      message: '获取设置成功',
      data: {
        name: setting.name,
        value: setting.value,
      },
    });

  } catch (error) {
    console.error('获取设置失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 更新单个设置
export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { value } = req.body;

    if (typeof value !== 'string') {
      return res.status(400).json({
        code: 400,
        message: '设置值必须为字符串',
      });
    }

    await dbRun(
      'INSERT OR REPLACE INTO settings (name, value, update_time) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [name, value]
    );

    res.json({
      code: 0,
      message: '设置更新成功',
    });

  } catch (error) {
    console.error('更新设置失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 删除设置
export const deleteSetting = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const result = await dbRun('DELETE FROM settings WHERE name = ?', [name]);

    if (result.changes === 0) {
      return res.status(404).json({
        code: 404,
        message: '设置项不存在',
      });
    }

    res.json({
      code: 0,
      message: '设置删除成功',
    });

  } catch (error) {
    console.error('删除设置失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};
