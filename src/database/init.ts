import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

// 确保数据目录存在
const dataDir = path.dirname(config.database.path);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 确保上传目录存在
if (!fs.existsSync(config.upload.path)) {
  fs.mkdirSync(config.upload.path, { recursive: true });
}

const db = new sqlite3.Database(config.database.path);

// 转换为Promise版本
const dbGet = promisify(db.get.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
const dbAll = promisify(db.all.bind(db)) as (sql: string, params?: any[]) => Promise<any[]>;
const dbRun = promisify(db.run.bind(db)) as (sql: string, params?: any[]) => Promise<{ lastID: number; changes: number }>;

async function initializeDatabase() {
  try {
    console.log('开始初始化数据库...');

    // 创建管理员表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `);

    // 创建卡密表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_key TEXT UNIQUE NOT NULL,
        encrypted_key TEXT UNIQUE NOT NULL,
        status INTEGER DEFAULT 0,
        card_type TEXT DEFAULT 'time',
        duration INTEGER,
        total_count INTEGER,
        remaining_count INTEGER,
        allow_reverify BOOLEAN DEFAULT 1,
        device_id TEXT,
        verify_method TEXT,
        use_time DATETIME,
        expire_time DATETIME,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        remark TEXT
      )
    `);

    // 创建API密钥表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_name TEXT NOT NULL,
        api_key TEXT UNIQUE NOT NULL,
        status INTEGER DEFAULT 1,
        use_count INTEGER DEFAULT 0,
        last_use_time DATETIME,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT
      )
    `);

    // 创建系统设置表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        value TEXT,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建轮播图表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS slides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        sort_order INTEGER DEFAULT 0,
        status INTEGER DEFAULT 1,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建系统特点表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        icon TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        status INTEGER DEFAULT 1,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 检查是否已有管理员账号
    const adminCount = await dbGet('SELECT COUNT(*) as count FROM admins') as { count: number };
    if (adminCount.count === 0) {
      console.log('创建默认管理员账号...');
      // 这里应该提示用户设置密码，但为了演示，我们创建一个默认账号
      // 实际部署时应该通过命令行参数或环境变量设置
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', config.security.bcryptRounds);

      await dbRun(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('默认管理员账号创建成功！');
      console.log('用户名: admin');
      console.log('密码: admin123');
      console.log('⚠️  请立即修改默认密码！');
    }

    // 插入默认系统设置
    const defaultSettings = [
      ['site_title', 'LuckinHappy卡密验证系统'],
      ['site_subtitle', '专业的卡密验证解决方案'],
      ['copyright_text', 'LuckinHappy卡密系统 - All Rights Reserved'],
      ['welcome_text', '欢迎，'],
      ['contact_qq_group', '123456789'],
      ['contact_wechat_qr', 'assets/images/wechat-qr.jpg'],
      ['contact_email', 'support@example.com'],
      ['api_enabled', '0']
    ];

    for (const [name, value] of defaultSettings) {
      await dbRun(
        'INSERT OR IGNORE INTO settings (name, value) VALUES (?, ?)',
        [name, value]
      );
    }

    // 创建数据库索引以提升性能
    console.log('创建数据库索引...');

    // 卡密表索引
    await dbRun('CREATE INDEX IF NOT EXISTS idx_cards_encrypted_key ON cards(encrypted_key)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_cards_use_time ON cards(use_time)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_cards_device_id ON cards(device_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_cards_create_time ON cards(create_time)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_cards_status_type ON cards(status, card_type)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_cards_device_status ON cards(device_id, status)');

    // API密钥表索引
    await dbRun('CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_api_keys_create_time ON api_keys(create_time)');

    // 系统设置表索引
    await dbRun('CREATE INDEX IF NOT EXISTS idx_settings_name ON settings(name)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_settings_update_time ON settings(update_time)');

    console.log('✅ 数据库初始化完成！');

    // 显示数据库信息
    const dbStats = await dbGet('SELECT COUNT(*) as cards FROM cards');
    const apiStats = await dbGet('SELECT COUNT(*) as apis FROM api_keys WHERE status = 1');

    console.log(`📊 当前统计:`);
    console.log(`   卡密数量: ${dbStats.cards}`);
    console.log(`   API密钥: ${apiStats.apis}`);

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  initializeDatabase();
}

export default initializeDatabase;
