import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { config } from '../config';

// 创建数据库连接，启用WAL模式以提高并发性能
const db = new sqlite3.Database(config.database.path, (err) => {
  if (err) {
    console.error('数据库连接失败:', err);
  } else {
    // 启用WAL模式，提高并发读写性能
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA synchronous = NORMAL');
    db.run('PRAGMA cache_size = 1000');
    db.run('PRAGMA temp_store = memory');
    console.log('✅ 数据库连接成功，已启用性能优化');
  }
});

// 简单的查询缓存（内存缓存）
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

// 缓存查询结果
function getCachedQuery(key: string) {
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  queryCache.delete(key);
  return null;
}

function setCachedQuery(key: string, data: any) {
  queryCache.set(key, { data, timestamp: Date.now() });
}

// 转换为Promise版本
export const dbGet = promisify(db.get.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
export const dbAll = promisify(db.all.bind(db)) as (sql: string, params?: any[]) => Promise<any[]>;

// 带缓存的查询方法（用于频繁查询）
export const dbGetCached = async (sql: string, params?: any[]): Promise<any> => {
  const cacheKey = `${sql}:${JSON.stringify(params)}`;
  const cached = getCachedQuery(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const result = await dbGet(sql, params);
  setCachedQuery(cacheKey, result);
  return result;
};

export const dbAllCached = async (sql: string, params?: any[]): Promise<any[]> => {
  const cacheKey = `${sql}:${JSON.stringify(params)}`;
  const cached = getCachedQuery(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const result = await dbAll(sql, params);
  setCachedQuery(cacheKey, result);
  return result;
};

export const dbRun = (sql: string, params?: any[]): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          lastID: this.lastID,
          changes: this.changes
        });
      }
    });
  });
};

// 批量操作优化
export const dbRunBatch = (operations: Array<{ sql: string; params?: any[] }>): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      let completed = 0;
      const total = operations.length;

      if (total === 0) {
        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
        return;
      }

      operations.forEach(({ sql, params }) => {
        db.run(sql, params, (err) => {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }

          completed++;
          if (completed === total) {
            db.run('COMMIT', (err) => {
              if (err) reject(err);
              else resolve();
            });
          }
        });
      });
    });
  });
};

export { db };
