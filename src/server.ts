import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// 创建Express应用
const app = express();

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.bootcdn.net"],
      scriptSrc: ["'self'", "https://cdn.sheetjs.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdn.bootcdn.net"],
    },
  },
}));

// 请求频率限制 - 已禁用
// const limiter = rateLimit({
//   windowMs: config.security.rateLimit.windowMs,
//   max: config.security.rateLimit.maxRequests,
//   message: {
//     code: 429,
//     message: '请求过于频繁，请稍后再试',
//   },
// });

// app.use(limiter);

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true,
}));

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use(express.static('dist/public'));

// 在开发环境中提供前端应用
if (config.server.nodeEnv === 'development') {
  // 代理前端开发服务器
  app.get('/', (req, res) => {
    res.redirect('http://localhost:5173');
  });
} else {
  // 生产环境提供构建后的前端文件
  app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'dist/public' });
  });

  // SPA路由处理
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'dist/public' });
  });
}

import apiRoutes from './routes';

// API路由
app.use('/api', apiRoutes);

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 ${config.app.name} v${config.app.version}`);
  console.log(`📡 服务器运行在 http://localhost:${PORT}`);
  console.log(`🌍 环境: ${config.server.nodeEnv}`);
  console.log(`📊 数据库: ${config.database.path}`);
});
