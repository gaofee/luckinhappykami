import { Request, Response } from 'express';
import { dbGet } from '../utils/database';
import { beijingAfter, nowBeijing } from '../utils/time';

// 获取统计数据
export const getStats = async (req: Request, res: Response) => {
  try {
    // 获取卡密统计
    const cardStats = await dbGet(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as used,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as unused,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as disabled
      FROM cards
    `);

    // 计算使用率
    const usageRate = cardStats.total > 0 ? ((cardStats.used / cardStats.total) * 100).toFixed(1) : '0';

    // 获取API密钥统计
    const apiStats = await dbGet(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
        SUM(use_count) as total_calls
      FROM api_keys
    `);

    // 获取最近7天的数据（北京时间基准）
    const sevenDaysAgo = beijingAfter(-7 * 24 * 60 * 60 * 1000);

    const recentStats = await dbGet(`
      SELECT
        COUNT(*) as new_cards,
        SUM(CASE WHEN use_time >= ? THEN 1 ELSE 0 END) as recent_used
      FROM cards
      WHERE create_time >= ?
    `, [sevenDaysAgo, sevenDaysAgo]) as { new_cards: number; recent_used: number };

    res.json({
      code: 0,
      message: '获取统计数据成功',
      data: {
        cards: {
          total: cardStats.total || 0,
          used: cardStats.used || 0,
          unused: cardStats.unused || 0,
          disabled: cardStats.disabled || 0,
          usage_rate: parseFloat(usageRate),
        },
        apis: {
          total: apiStats.total || 0,
          active: apiStats.active || 0,
          total_calls: apiStats.total_calls || 0,
        },
        recent: {
          new_cards: recentStats.new_cards || 0,
          recent_used: recentStats.recent_used || 0,
        },
      },
    });

  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 获取使用趋势数据
export const getUsageTrends = async (req: Request, res: Response) => {
  try {
    const { days = 7 } = req.query;
    const daysAgo = parseInt(days as string);

    const trends = [];

    // 生成日期数组（北京时间基准，与库中存储的北京时间对齐）
    // 仅生成日期标签，按纯日期做 UTC 算术即可，不涉及时刻转换
    const todayBeijing = nowBeijing().slice(0, 10); // 北京时间今天的日期 YYYY-MM-DD
    for (let i = daysAgo - 1; i >= 0; i--) {
      const d = new Date(todayBeijing + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // 查询当天数据
      const dayStats = await dbGet(`
        SELECT
          COUNT(CASE WHEN DATE(create_time) = ? THEN 1 END) as new_cards,
          COUNT(CASE WHEN DATE(use_time) = ? THEN 1 END) as used_cards
        FROM cards
      `, [dateStr, dateStr]);

      trends.push({
        date: dateStr,
        new_cards: dayStats.new_cards || 0,
        used_cards: dayStats.used_cards || 0,
      });
    }

    res.json({
      code: 0,
      message: '获取趋势数据成功',
      data: {
        trends,
        period: daysAgo,
      },
    });

  } catch (error) {
    console.error('获取趋势数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};
