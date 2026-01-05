# LuckinHappy Card Verification System

> A powerful, secure, and reliable card verification system built with modern TypeScript + Node.js stack

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-orange.svg)](https://www.sqlite.org/)
[![License](https://img.shields.io/github/license/gaofee/luckinhappykami)](https://github.com/gaofee/luckinhappykami/blob/main/LICENSE)

## 📋 项目简介

**LuckinHappy卡密验证系统** 是一个功能强大、安全可靠的卡密验证解决方案，专为软件开发者、游戏开发者以及需要数字商品验证服务的企业打造。

### 🎯 核心功能
- **卡密生成与管理**：批量生成、导入导出、状态管理
- **实时验证**：支持多种验证方式（时间卡、次数卡）
- **设备绑定**：防止卡密被盗用和滥用
- **多API支持**：为不同应用提供独立的API密钥
- **统计分析**：详细的使用统计和数据分析
- **管理后台**：直观的Web管理界面

### 💡 应用场景
- 软件激活验证
- 游戏充值卡验证
- 会员服务验证
- 数字商品销售
- SaaS服务订阅验证
- 企业内部授权管理

### 🌟 核心优势
- **高安全性**：bcrypt加密 + JWT认证 + 设备绑定
- **高性能**：异步处理 + 数据库优化 + 缓存策略
- **易部署**：一键安装脚本 + 详细部署文档
- **易维护**：现代化技术栈 + 完整测试覆盖
- **易扩展**：模块化设计 + RESTful API

### ⚠️ 重要声明
**本项目仅用于学习、研究和合法商业用途。严禁用于任何违法违规活动，包括但不限于：**
- 盗版软件分发
- 非法数字商品销售
- 侵犯知识产权行为
- 任何违反法律法规的活动

**使用者需自行承担使用本项目的法律责任。**

---

## 🚀 快速开始

#### 选项1：自动化安装（推荐）

为了获得最简单的设置体验，请使用我们的自动化安装脚本：

```bash
# 1. 下载或克隆项目
git clone https://github.com/gaofee/luckinhappykami.git
cd luckinhappykami

# 2. 运行安装脚本
./install.sh
```

该脚本将自动执行：
- ✅ 检查系统要求
- ✅ 自动安装依赖
- ✅ 配置环境变量
- ✅ 初始化数据库
- ✅ 构建应用程序
- ✅ 设置PM2进程管理器（可选）
- ✅ 创建启动脚本

#### 选项2：手动安装

如果您偏好手动安装：

##### 环境要求
```bash
Node.js >= 18.0.0
npm >= 8.0.0
```

##### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/gaofee/luckinhappykami.git
cd luckinhappykami
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库路径和其他设置
```

4. 初始化数据库
```bash
npm run init-db
```

5. 启动开发服务器
```bash
npm run dev
```

6. 访问应用
```
http://localhost:3000
```



---

## English

### ✨ Features

#### 🛡️ Security & Reliability
- bcrypt password encryption storage
- JWT authentication
- Device binding mechanism
- Anti-brute force protection
- Multi-layer security verification
- SHA1 encrypted card key storage

#### 🔌 API Support
- RESTful API interface
- Multi-API key management
- API call statistics
- Detailed API documentation
- Support POST/GET verification
- Device ID binding mechanism

#### ⚡ High Performance & Stability
- TypeScript type safety
- High-performance SQLite database
- Fast response speed
- Stable operation performance
- Modern asynchronous processing

#### 📊 Data Statistics
- Real-time statistics
- Detailed data analysis
- Visual chart display
- API call statistics
- Complete usage records

### ⚠️ Important Disclaimer
**This project is intended for educational, research, and legitimate commercial purposes only. It is strictly prohibited for any illegal or unlawful activities, including but not limited to:**
- Pirated software distribution
- Illegal digital goods sales
- Intellectual property infringement
- Any activities that violate laws and regulations

**Users are solely responsible for the legal consequences of using this project.**

### 🚀 Quick Start

#### Option 1: Automated Installation (Recommended)

For the easiest setup experience, use our automated installation script:

```bash
# 1. Download or clone the project
git clone https://github.com/gaofee/luckinhappykami.git
cd luckinhappykami

# 2. Run the installation script
./install.sh
```

The script will:
- ✅ Check system requirements
- ✅ Install dependencies automatically
- ✅ Configure environment variables
- ✅ Initialize the database
- ✅ Build the application
- ✅ Set up PM2 process manager (optional)
- ✅ Create startup scripts

#### Option 2: Manual Installation

If you prefer manual installation:

##### Environment Requirements
```bash
Node.js >= 18.0.0
npm >= 8.0.0
```

##### Installation Steps

1. Clone the project
```bash
git clone https://github.com/gaofee/luckinhappykami.git
cd luckinhappykami
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env file to configure database path and other settings
```

4. Initialize database
```bash
npm run init-db
```

5. Start development server
```bash
npm run dev
```

6. Access the application
```
http://localhost:3000
```

### 📚 API Documentation

#### Card Verification API

##### POST /api/verify
Verify card key and perform device binding

**Request Parameters:**
```json
{
  "card_key": "card secret key",
  "device_id": "device unique identifier"
}
```

**Response Example:**
```json
{
  "code": 0,
  "message": "Verification successful",
  "data": {
    "card_key": "xxx",
    "status": 1,
    "use_time": "2024-01-01 12:00:00",
    "expire_time": "2024-01-31 12:00:00",
    "card_type": "time",
    "duration": 30,
    "device_id": "device123",
    "allow_reverify": true
  }
}
```

##### GET /api/verify (Alternative)
```
GET /api/verify?api_key=your-api-key&card_key=xxx&device_id=device123
```

#### Admin APIs

##### POST /admin/login
Admin login

##### GET /admin/cards
Get card list

##### POST /admin/cards/generate
Batch generate cards

###  Project Structure

```
luckinhappykami/
├── src/                          # Backend code
│   ├── config/                   # Configuration management
│   ├── controllers/              # API controllers
│   ├── database/                 # Database related
│   ├── middleware/               # Middleware
│   ├── routes/                   # Route definitions
│   ├── services/                 # Business logic services
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── public/                   # Static resources
│   ├── views/                    # Template files (dev use)
│   └── server.ts                 # Application entry
├── frontend/                     # Frontend Vue.js application
│   ├── src/
│   │   ├── components/           # Vue components
│   │   ├── views/                # Page components
│   │   ├── router/               # Route configuration
│   │   ├── stores/               # Pinia state management
│   │   ├── utils/                # Frontend utilities
│   │   └── types/                # Frontend type definitions
│   ├── public/                   # Frontend static resources
│   ├── index.html                # Frontend entry HTML
│   ├── vite.config.ts            # Vite configuration
│   └── package.json              # Frontend dependencies
├── data/                         # SQLite database files
├── uploads/                      # Upload file directory
├── dist/                         # Build output directory
├── .env                          # Environment configuration
├── package.json                  # Main project configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md
```

### 🛠️ Available Scripts

```bash
# Start in development mode
npm run dev

# Build production version
npm run build

# Start production version
npm start

# Initialize database
npm run init-db

# Run tests
npm test

# Code linting
npm run lint

# Code formatting
npm run format
```

### 📚 API Documentation

#### Card Verification API

##### POST /api/verify
Verify card key and perform device binding

**Request Parameters:**
```json
{
  "card_key": "card secret key",
  "device_id": "device unique identifier"
}
```

**Response Example:**
```json
{
  "code": 0,
  "message": "Verification successful",
  "data": {
    "card_key": "xxx",
    "status": 1,
    "use_time": "2024-01-01 12:00:00",
    "expire_time": "2024-01-31 12:00:00",
    "card_type": "time",
    "duration": 30,
    "device_id": "device123",
    "allow_reverify": true
  }
}
```

#### Admin APIs

##### POST /admin/login
Admin login

##### GET /admin/cards
Get card list

##### POST /admin/cards/generate
Batch generate cards

### 🔧 Tech Stack

- **Backend Framework**: Express.js
- **Programming Language**: TypeScript
- **Database**: SQLite3
- **Authentication**: JWT + bcrypt
- **Template Engine**: EJS
- **Frontend Styling**: Modern CSS
- **Build Tool**: TypeScript Compiler
- **Code Quality**: ESLint + Prettier

### 🔒 Security Features

- **Password Security**: bcrypt hashing algorithm
- **Authentication**: JWT token mechanism
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content escaping and CSP headers

### 📊 Performance Optimization

- **Database Optimization**: Smart query merging and index usage
- **Cache Strategy**: Static resource caching and preloading
- **Asynchronous Processing**: Full utilization of Node.js async features
- **Memory Management**: Efficient memory usage and garbage collection
- **Response Compression**: Gzip compression to reduce transmission size

### 🚀 Baota Deployment Guide

#### Prerequisites
- Server with Baota panel installed
- Domain name (optional)
- SSH access

#### Step 1: Server Preparation
1. Log into Baota panel
2. Go to "Software Store" → "Runtime Environment"
3. Install Node.js 18+ and PM2
4. Install Nginx (if not already installed)

#### Step 2: Code Deployment
1. Upload project files to server via FTP or git clone
```bash
cd /www/wwwroot
git clone https://github.com/gaofee/luckinhappykami.git
cd luckinhappykami
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. Initialize database
```bash
npm run init-db
```

5. Build the application
```bash
npm run build
```

#### Step 3: PM2 Process Management
1. Install PM2 (if not already done via Baota)
```bash
npm install -g pm2
```

2. Create PM2 configuration file `ecosystem.config.js`
```javascript
module.exports = {
  apps: [{
    name: 'luckinhappykami',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

3. Start the application with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 4: Nginx Configuration
1. In Baota panel, go to "Website" → "Settings"
2. Add website configuration or modify existing one
3. Configure reverse proxy:

```
# Nginx Configuration
server {
    listen 80;
    server_name your-domain.com;
    root /www/wwwroot/luckinhappykami/dist/public;
    index index.html;

    # Frontend routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. SSL certificate configuration (recommended)
   - In Baota panel, go to "SSL" → "Let's Encrypt"
   - Apply for free SSL certificate

#### Step 5: Database and File Permissions
1. Ensure SQLite database file has correct permissions
```bash
chmod 644 data/luckinhappykami.db
```

2. Ensure uploads directory has write permissions
```bash
chmod 755 uploads
```

#### Step 6: Firewall Configuration
1. In Baota panel, go to "Security" → "Firewall"
2. Open ports 80, 443 (HTTP/HTTPS)
3. Ensure port 3001 is only accessible locally

#### Step 7: Backup Configuration
1. Set up regular database backups
2. Configure log rotation
3. Set up monitoring alerts

#### Step 8: Testing
1. Access your domain: `http://your-domain.com`
2. Test API endpoints
3. Run the test scripts to verify functionality

#### Troubleshooting
- **Port conflicts**: Check if ports 80, 443, 3001 are available
- **Permission issues**: Ensure proper file permissions
- **Database errors**: Check database file path and permissions
- **Memory issues**: Monitor PM2 logs and adjust memory limits

### 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Submit Pull Request

### 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

### ⭐ Acknowledgments

Special thanks to the original project:
- **[xiaoxiaoguai-yyds/xxgkami](https://github.com/xiaoxiaoguai-yyds/xxgkami)** - Original PHP implementation that inspired this TypeScript rewrite

Thanks to all developers who contributed to this project!

---

**Note**: This project is a complete TypeScript rewrite of the original PHP version, providing better type safety, performance, and development experience.

---

## 中文

### ✨ 系统特点

#### 🛡️ 安全可靠
- bcrypt密码加密存储
- JWT身份验证
- 设备绑定机制
- 防暴力破解
- 多重安全验证
- SHA1加密卡密存储

#### 🔌 API支持
- RESTful API接口
- 多API密钥管理
- API调用统计
- 详细接口文档
- 支持POST/GET验证
- 设备ID绑定机制

#### ⚡ 高效稳定
- TypeScript类型安全
- 高性能SQLite数据库
- 快速响应速度
- 稳定运行性能
- 现代异步处理

#### 📊 数据统计
- 实时统计功能
- 详细数据分析
- 可视化图表展示
- API调用统计
- 完整使用记录

### 🚀 快速开始

#### 选项1：自动化安装（推荐）

为了获得最简单的设置体验，请使用我们的自动化安装脚本：

```bash
# 1. 下载或克隆项目
git clone https://github.com/gaofee/luckinhappykami.git
cd luckinhappykami

# 2. 运行安装脚本
./install.sh
```

该脚本将自动执行：
- ✅ 检查系统要求
- ✅ 自动安装依赖
- ✅ 配置环境变量
- ✅ 初始化数据库
- ✅ 构建应用程序
- ✅ 设置PM2进程管理器（可选）
- ✅ 创建启动脚本

#### 选项2：手动安装

如果您偏好手动安装：

##### 环境要求
```bash
Node.js >= 18.0.0
npm >= 8.0.0
```

##### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/gaofee/luckinhappykami.git
cd luckinhappykami
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库路径和其他设置
```

4. 初始化数据库
```bash
npm run init-db
```

5. 启动开发服务器
```bash
npm run dev
```

6. 访问应用
```
http://localhost:3000
```

### 📁 项目结构

```
luckinhappykami/
├── src/                          # 后端代码
│   ├── config/                   # 配置管理
│   ├── controllers/              # API控制器
│   ├── database/                 # 数据库相关
│   ├── middleware/               # 中间件
│   ├── routes/                   # 路由定义
│   ├── services/                 # 业务逻辑服务
│   ├── types/                    # TypeScript类型定义
│   ├── utils/                    # 工具函数
│   ├── public/                   # 静态资源
│   ├── views/                    # 模板文件（开发用）
│   └── server.ts                 # 应用入口
├── frontend/                     # 前端Vue.js应用
│   ├── src/
│   │   ├── components/           # Vue组件
│   │   ├── views/                # 页面组件
│   │   ├── router/               # 路由配置
│   │   ├── stores/               # Pinia状态管理
│   │   ├── utils/                # 前端工具函数
│   │   └── types/                # 前端类型定义
│   ├── public/                   # 前端静态资源
│   ├── index.html                # 前端入口HTML
│   ├── vite.config.ts            # Vite配置
│   └── package.json              # 前端依赖
├── data/                         # SQLite数据库文件
├── uploads/                      # 上传文件目录
├── dist/                         # 编译输出目录
├── .env                          # 环境变量配置
├── package.json                  # 主项目配置
├── tsconfig.json                 # TypeScript配置
└── README.md
```

### 🛠️ 可用脚本

```bash
# 开发模式启动
npm run dev

# 构建生产版本
npm run build

# 启动生产版本
npm start

# 初始化数据库
npm run init-db

# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 📚 API文档

#### 卡密验证接口

##### POST /api/verify
验证卡密并进行设备绑定

**请求参数：**
```json
{
  "card_key": "卡密密钥",
  "device_id": "设备唯一标识"
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "验证成功",
  "data": {
    "card_key": "xxx",
    "status": 1,
    "use_time": "2024-01-01 12:00:00",
    "expire_time": "2024-01-31 12:00:00",
    "card_type": "time",
    "duration": 30,
    "device_id": "device123",
    "allow_reverify": true
  }
}
```

#### 管理接口

##### POST /admin/login
管理员登录

##### GET /admin/cards
获取卡密列表

##### POST /admin/cards/generate
批量生成卡密

### 🔧 技术栈

- **后端框架**: Express.js
- **编程语言**: TypeScript
- **数据库**: SQLite3
- **身份验证**: JWT + bcrypt
- **模板引擎**: EJS
- **前端样式**: 现代化CSS
- **构建工具**: TypeScript Compiler
- **代码质量**: ESLint + Prettier

### 🔒 安全特性

- **密码安全**: bcrypt哈希算法
- **身份验证**: JWT令牌机制
- **输入验证**: 全面的输入 sanitization
- **SQL注入防护**: 参数化查询
- **XSS防护**: 内容转义和CSP头

### 📊 性能优化

- **数据库优化**: 智能查询合并和索引使用
- **缓存策略**: 静态资源缓存和预加载
- **异步处理**: 充分利用Node.js异步特性
- **内存管理**: 高效的内存使用和垃圾回收
- **响应压缩**: Gzip压缩减小传输大小

### 🚀 宝塔部署指南

#### 前置要求
- 已安装宝塔面板的服务器
- 域名（可选）
- SSH访问权限

#### 第一步：服务器准备
1. 登录宝塔面板
2. 进入"软件商店" → "运行环境"
3. 安装 Node.js 18+ 和 PM2
4. 安装 Nginx（如未安装）

#### 第二步：代码部署
1. 通过FTP上传项目文件或使用git克隆
```bash
cd /www/wwwroot
git clone https://github.com/gaofee/luckinhappykami.git
cd luckinhappykami
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件配置您的设置
```

4. 初始化数据库
```bash
npm run init-db
```

5. 构建应用
```bash
npm run build
```

#### 第三步：PM2进程管理
1. 安装PM2（如宝塔未安装）
```bash
npm install -g pm2
```

2. 创建PM2配置文件 `ecosystem.config.js`
```javascript
module.exports = {
  apps: [{
    name: 'luckinhappykami',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

3. 使用PM2启动应用
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 第四步：Nginx配置
1. 在宝塔面板进入"网站" → "设置"
2. 添加网站配置或修改现有配置
3. 配置反向代理：

```
# Nginx配置
server {
    listen 80;
    server_name your-domain.com;
    root /www/wwwroot/luckinhappykami/dist/public;
    index index.html;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态文件
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. SSL证书配置（推荐）
   - 在宝塔面板进入"SSL" → "Let's Encrypt"
   - 申请免费SSL证书

#### 第五步：数据库和文件权限
1. 确保SQLite数据库文件权限正确
```bash
chmod 644 data/luckinhappykami.db
```

2. 确保上传目录有写入权限
```bash
chmod 755 uploads
```

#### 第六步：防火墙配置
1. 在宝塔面板进入"安全" → "防火墙"
2. 开放80、443端口（HTTP/HTTPS）
3. 确保3001端口仅本地访问

#### 第七步：备份配置
1. 设置定期数据库备份
2. 配置日志轮转
3. 设置监控告警

#### 第八步：测试验证
1. 访问域名：`http://your-domain.com`
2. 测试API接口
3. 运行测试脚本验证功能

#### 故障排除
- **端口冲突**：检查80、443、3001端口是否可用
- **权限问题**：确保文件权限正确
- **数据库错误**：检查数据库文件路径和权限
- **内存问题**：监控PM2日志并调整内存限制

### 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 📄 开源协议

本项目采用 MIT 协议开源，详见 [LICENSE](LICENSE) 文件。

### ⭐ 致谢

特别感谢原始项目：
- **[xiaoxiaoguai-yyds/xxgkami](https://github.com/xiaoxiaoguai-yyds/xxgkami)** - 原始PHP实现版本，为本TypeScript重构提供了灵感

感谢所有为本项目做出贡献的开发者！

---

**注意**: 本项目是原PHP版本的完整TypeScript重构，提供了更好的类型安全、性能和开发体验。
