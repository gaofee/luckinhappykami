#!/usr/bin/env node

/**
 * LuckinHappy卡密验证系统 - 完整系统测试脚本
 * 测试所有核心功能是否正常工作
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_BASE_URL = `${BASE_URL}/api`;

// 测试结果统计
const results = {
  total: 0,
  passed: 0,
  failed: 0
};

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };

  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

async function testHealthCheck() {
  try {
    results.total++;
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (response.data.code === 0) {
      results.passed++;
      log('✅ 健康检查通过', 'success');
      return true;
    } else {
      results.failed++;
      log('❌ 健康检查失败', 'error');
      return false;
    }
  } catch (error) {
    results.failed++;
    log(`❌ 健康检查异常: ${error.message}`, 'error');
    return false;
  }
}

async function testLogin() {
  try {
    results.total++;
    const response = await axios.post(`${API_BASE_URL}/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (response.data.code === 0 && response.data.data.token) {
      results.passed++;
      log('✅ 管理员登录成功', 'success');
      return response.data.data.token;
    } else {
      results.failed++;
      log('❌ 管理员登录失败', 'error');
      return null;
    }
  } catch (error) {
    results.failed++;
    log(`❌ 登录异常: ${error.message}`, 'error');
    return null;
  }
}

async function testGetCards(token) {
  try {
    results.total++;
    const response = await axios.get(`${API_BASE_URL}/admin/cards`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.code === 0) {
      results.passed++;
      log(`✅ 获取卡密列表成功 (${response.data.data.cards.length} 个卡密)`, 'success');
      return response.data.data.cards;
    } else {
      results.failed++;
      log('❌ 获取卡密列表失败', 'error');
      return [];
    }
  } catch (error) {
    results.failed++;
    log(`❌ 获取卡密列表异常: ${error.message}`, 'error');
    return [];
  }
}

async function testGenerateCards(token) {
  try {
    results.total++;
    const response = await axios.post(`${API_BASE_URL}/admin/cards/generate`, {
      count: 5,
      card_type: 'time',
      duration: 30,
      allow_reverify: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.code === 0) {
      results.passed++;
      log(`✅ 生成卡密成功 (${response.data.data.count} 个)`, 'success');
      return response.data.data.cards;
    } else {
      results.failed++;
      log('❌ 生成卡密失败', 'error');
      return [];
    }
  } catch (error) {
    results.failed++;
    log(`❌ 生成卡密异常: ${error.message}`, 'error');
    return [];
  }
}

async function testCardVerification(cardKey) {
  try {
    results.total++;
    const response = await axios.post(`${API_BASE_URL}/verify`, {
      card_key: cardKey,
      device_id: 'test-device-' + Date.now()
    }, {
      headers: { 'X-API-Key': 'FDRLQMHKYBG2YREVOBVPTNXNQUT46ISL' }
    });

    if (response.data.code === 0) {
      results.passed++;
      log('✅ 卡密验证成功', 'success');
      return true;
    } else {
      results.failed++;
      log(`❌ 卡密验证失败: ${response.data.message}`, 'error');
      return false;
    }
  } catch (error) {
    results.failed++;
    log(`❌ 卡密验证异常: ${error.message}`, 'error');
    return false;
  }
}

async function testSettings(token) {
  try {
    results.total++;
    const response = await axios.get(`${API_BASE_URL}/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.code === 0) {
      results.passed++;
      log('✅ 获取系统设置成功', 'success');
      return true;
    } else {
      results.failed++;
      log('❌ 获取系统设置失败', 'error');
      return false;
    }
  } catch (error) {
    results.failed++;
    log(`❌ 获取系统设置异常: ${error.message}`, 'error');
    return false;
  }
}

async function testStats(token) {
  try {
    results.total++;
    const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.code === 0) {
      results.passed++;
      log('✅ 获取统计数据成功', 'success');
      return true;
    } else {
      results.failed++;
      log('❌ 获取统计数据失败', 'error');
      return false;
    }
  } catch (error) {
    results.failed++;
    log(`❌ 获取统计数据异常: ${error.message}`, 'error');
    return false;
  }
}

async function runTests() {
  log('🚀 开始LuckinHappy卡密验证系统完整测试', 'info');
  log('=' .repeat(60), 'info');

  // 1. 健康检查
  await testHealthCheck();

  // 2. 管理员登录
  const token = await testLogin();
  if (!token) {
    log('❌ 无法继续测试，因为登录失败', 'error');
    return;
  }

  // 3. 获取卡密列表
  const cards = await testGetCards(token);

  // 4. 生成新卡密
  const newCards = await testGenerateCards(token);
  if (newCards.length > 0) {
    // 5. 验证新生成的卡密
    await testCardVerification(newCards[0].card_key);
  }

  // 6. 系统设置
  await testSettings(token);

  // 7. 统计数据
  await testStats(token);

  // 输出测试结果
  log('=' .repeat(60), 'info');
  log(`📊 测试完成: 总计 ${results.total} 个测试`, 'info');
  log(`✅ 通过: ${results.passed} 个`, 'success');
  log(`❌ 失败: ${results.failed} 个`, results.failed > 0 ? 'error' : 'info');

  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  if (results.failed === 0) {
    log(`🎉 所有测试通过！成功率: ${successRate}%`, 'success');
  } else {
    log(`⚠️ 部分测试失败，成功率: ${successRate}%`, 'warning');
  }
}

// 检查服务器是否运行
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
    log('✅ 服务器正在运行', 'success');
    return true;
  } catch (error) {
    log('❌ 服务器未运行，请先启动服务器: npm run dev', 'error');
    log('测试终止', 'error');
    process.exit(1);
  }
}

// 主函数
async function main() {
  log('🔍 检查服务器状态...', 'info');
  await checkServer();

  log('⏳ 等待服务器完全启动...', 'info');
  await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒

  await runTests();
}

if (require.main === module) {
  main().catch(error => {
    log(`💥 测试脚本异常: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runTests };
