// 测试加密算法
const { createHash } = require('crypto');

// PHP版本的加密函数
function encryptCardKey(key) {
  const salt = 'xiaoxiaoguai_card_system_2024';
  return createHash('sha1').update(key + salt).digest('hex');
}

// 测试卡密
const testKey = 'FMM7R22HX0NF';
const encrypted = encryptCardKey(testKey);

console.log('卡密:', testKey);
console.log('加密后:', encrypted);

// 检查数据库中的值
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/luckinhappykami.db');

db.get('SELECT card_key, encrypted_key FROM cards WHERE card_key = ?', [testKey], (err, row) => {
  if (err) {
    console.error('查询错误:', err);
  } else if (row) {
    console.log('数据库中卡密:', row.card_key);
    console.log('数据库中加密:', row.encrypted_key);
    console.log('是否匹配:', encrypted === row.encrypted_key);
  } else {
    console.log('卡密不存在');
  }
  db.close();
});
