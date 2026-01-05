// 简单的API测试脚本
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 测试健康检查
async function testHealth() {
  console.log('🔍 测试健康检查...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 健康检查通过:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message);
    return false;
  }
}

// 测试管理员登录
async function testLogin() {
  console.log('🔐 测试管理员登录...');
  try {
    const response = await axios.post(`${BASE_URL}/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ 登录成功:', response.data);
    return response.data.data.token;
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试生成卡密
async function testGenerateCards(token) {
  console.log('🎫 测试生成卡密...');
  try {
    const response = await axios.post(`${BASE_URL}/admin/cards/generate`, {
      count: 3,
      card_type: 'time',
      duration: 30,
      allow_reverify: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 生成卡密成功:', response.data);
    return response.data.data.cards;
  } catch (error) {
    console.error('❌ 生成卡密失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试卡密验证
async function testVerifyCard(cardKey) {
  console.log('✅ 测试卡密验证...');
  try {
    const response = await axios.post(`${BASE_URL}/verify`, {
      card_key: cardKey,
      device_id: 'test-device-123'
    }, {
      headers: { 'X-API-Key': 'FDRLQMHKYBG2YREVOBVPTNXNQUT46ISL' }
    });
    console.log('✅ 卡密验证成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 卡密验证失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试获取统计数据
async function testGetStats(token) {
  console.log('📊 测试获取统计数据...');
  try {
    const response = await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 获取统计成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 获取统计失败:', error.response?.data || error.message);
    return false;
  }
}

// 主测试流程
async function runTests() {
  console.log('🚀 开始API功能测试...\n');

  // 1. 健康检查
  if (!await testHealth()) return;

  // 2. 管理员登录
  const token = await testLogin();
  if (!token) return;

  // 3. 生成卡密
  const cards = await testGenerateCards(token);
  if (!cards || cards.length === 0) return;

  // 4. 验证生成的卡密
  const testCard = cards[0];
  await testVerifyCard(testCard.card_key);

  // 5. 获取统计数据
  await testGetStats(token);

  console.log('\n🎉 所有API测试完成！');
}

// 运行测试
runTests().catch(console.error);
