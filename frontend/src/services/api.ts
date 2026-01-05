// API服务层
import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除本地token
      localStorage.removeItem('admin_token');
      // 跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API接口定义

export const cardAPI = {
  verify: (cardKey: string, deviceId: string) =>
    api.post('/verify', { card_key: cardKey, device_id: deviceId }),

  generate: (data: {
    count: number;
    card_type: 'time' | 'count';
    duration?: number;
    total_count?: number;
    allow_reverify?: boolean;
  }) => api.post('/admin/cards/generate', data),

  getCards: (params: {
    page?: number;
    limit?: number;
    status?: number;
    card_type?: string;
    search?: string;
  }) => api.get('/admin/cards', { params }),

  deleteCard: (id: number) =>
    api.delete(`/admin/cards/${id}`),

  batchDelete: (ids: number[]) =>
    api.post('/admin/cards/batch-delete', { ids }),

  disableCard: (id: number) =>
    api.post(`/admin/cards/${id}/disable`),

  enableCard: (id: number) =>
    api.post(`/admin/cards/${id}/enable`),

  extendCard: (id: number, days: number) =>
    api.post(`/admin/cards/${id}/extend`, { days }),

  addCardCount: (id: number, count: number) =>
    api.post(`/admin/cards/${id}/add-count`, { count }),

  unbindDevice: (id: number) =>
    api.post(`/admin/cards/${id}/unbind`),
};

export const apiKeyAPI = {
  getApiKeys: (params: {
    page?: number;
    limit?: number;
    status?: number;
  }) => api.get('/admin/apis', { params }),

  createApiKey: (data: {
    key_name: string;
    description?: string;
  }) => api.post('/admin/apis', data),

  updateApiKeyStatus: (id: number, status: 0 | 1) =>
    api.post(`/admin/apis/${id}/status`, { status }),

  deleteApiKey: (id: number) =>
    api.delete(`/admin/apis/${id}`),

  resetApiKey: (id: number) =>
    api.post(`/admin/apis/${id}/reset`),

  verifyApiKey: (apiKey: string) =>
    api.post('/verify-api-key', {}, { headers: { 'X-API-Key': apiKey } }),

  getApiStats: () => api.get('/admin/apis/stats'),
};

export const settingsAPI = {
  getSettings: () => api.get('/admin/settings'),

  updateSettings: (settings: Record<string, string>) =>
    api.post('/admin/settings', settings),

  getSetting: (name: string) =>
    api.get(`/admin/settings/${name}`),

  updateSetting: (name: string, value: string) =>
    api.put(`/admin/settings/${name}`, { value }),

  deleteSetting: (name: string) =>
    api.delete(`/admin/settings/${name}`),
};

export const statsAPI = {
  getStats: () => api.get('/admin/stats'),

  getTrends: (days: number = 7) =>
    api.get('/admin/stats/trends', { params: { days } }),
};

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/admin/login', { username, password }),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/admin/change-password', { old_password: oldPassword, new_password: newPassword }),

  logout: () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  },
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
