import express from 'express';
import {
  verifyCard,
  generateCards,
  getCards,
  deleteCard,
  batchDeleteCards,
  disableCard,
  enableCard,
  extendCard,
  addCardCount,
  unbindDevice,
  updateDevice
} from '../controllers/cardController';
import {
  getApiKeys,
  createApiKey,
  updateApiKeyStatus,
  deleteApiKey,
  resetApiKey,
  verifyApiKey,
  getApiStats
} from '../controllers/apiController';
import {
  getSettings,
  updateSettings,
  getSetting,
  updateSetting,
  deleteSetting
} from '../controllers/settingsController';
import { getStats, getUsageTrends } from '../controllers/statsController';
import { login, changePassword } from '../middleware/auth';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    code: 0,
    message: '服务正常',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

// 管理员登录
router.post('/admin/login', login);

// 需要认证的路由
router.use('/admin', authenticate);

// 管理员密码管理
router.post('/admin/change-password', changePassword);

// 卡密相关路由
router.route('/verify').get(verifyCard).post(verifyCard); // 卡密验证（公开）
router.post('/admin/cards/generate', generateCards); // 生成卡密
router.get('/admin/cards', getCards); // 获取卡密列表
router.delete('/admin/cards/:id', deleteCard); // 删除卡密
router.post('/admin/cards/batch-delete', batchDeleteCards); // 批量删除卡密
router.post('/admin/cards/:id/disable', disableCard); // 停用卡密
router.post('/admin/cards/:id/enable', enableCard); // 启用卡密
router.post('/admin/cards/:id/extend', extendCard); // 续期卡密
router.post('/admin/cards/:id/add-count', addCardCount); // 增加卡密次数
router.post('/admin/cards/:id/unbind', unbindDevice); // 解绑设备
router.post('/admin/cards/:id/update-device', updateDevice); // 更新设备ID

// API密钥管理路由
router.get('/admin/apis', getApiKeys); // 获取API密钥列表
router.post('/admin/apis', createApiKey); // 创建API密钥
router.post('/admin/apis/:id/status', updateApiKeyStatus); // 更新API密钥状态
router.delete('/admin/apis/:id', deleteApiKey); // 删除API密钥
router.post('/admin/apis/:id/reset', resetApiKey); // 重置API密钥
router.post('/verify-api-key', verifyApiKey); // 验证API密钥（公开）
router.get('/admin/apis/stats', getApiStats); // 获取API统计

// 系统设置路由
router.get('/admin/settings', getSettings); // 获取所有系统设置
router.post('/admin/settings', updateSettings); // 更新系统设置
router.get('/admin/settings/:name', getSetting); // 获取单个设置
router.put('/admin/settings/:name', updateSetting); // 更新单个设置
router.delete('/admin/settings/:name', deleteSetting); // 删除设置

// 统计相关路由
router.get('/admin/stats', getStats); // 获取统计数据
router.get('/admin/stats/trends', getUsageTrends); // 获取使用趋势

export default router;
