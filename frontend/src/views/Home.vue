<template>
  <div class="home">
    <!-- 英雄区域 -->
    <el-card class="hero-section" shadow="never">
      <div class="hero-content">
        <h1 class="hero-title">
          <i-ep-key style="margin-right: 10px;" />
          {{ siteTitle }}
        </h1>
        <p class="hero-subtitle">{{ siteSubtitle }}</p>
        <div class="hero-actions">
          <el-button
            type="primary"
            size="large"
            @click="$router.push('/verify')"
          >
            <i-ep-check />
            立即验证
          </el-button>
          <el-button
            type="default"
            size="large"
            @click="scrollToFeatures"
          >
            <i-ep-info-filled />
            了解更多
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <i-ep-shield-check class="stat-icon" />
          <div>
            <h3>安全可靠</h3>
            <div class="stat-value">99.9%</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <i-ep-lightning class="stat-icon" />
          <div>
            <h3>响应速度</h3>
            <div class="stat-value">< 100ms</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <i-ep-user class="stat-icon" />
          <div>
            <h3>用户满意</h3>
            <div class="stat-value">4.9/5</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <i-ep-lock class="stat-icon" />
          <div>
            <h3>数据安全</h3>
            <div class="stat-value">AES256</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 特性介绍 -->
    <div id="features" class="features-section">
      <h2 class="section-title">
        <i-ep-star />
        系统特点
      </h2>

      <div class="features-grid">
        <el-card class="feature-card" shadow="hover">
          <div class="feature-content">
            <div class="feature-icon">
              <i-ep-shield />
            </div>
            <div class="feature-text">
              <h3>安全可靠</h3>
              <p>采用bcrypt密码加密和JWT身份验证，确保数据安全</p>
              <ul class="feature-list">
                <li><i-ep-check /> bcrypt密码哈希</li>
                <li><i-ep-check /> JWT身份验证</li>
                <li><i-ep-check /> SHA1卡密加密</li>
                <li><i-ep-check /> 设备绑定保护</li>
              </ul>
            </div>
          </div>
        </el-card>

        <el-card class="feature-card" shadow="hover">
          <div class="feature-content">
            <div class="feature-icon">
              <i-ep-cpu />
            </div>
            <div class="feature-text">
              <h3>高性能</h3>
              <p>基于Node.js和SQLite的现代化架构，提供卓越性能</p>
              <ul class="feature-list">
                <li><i-ep-check /> TypeScript类型安全</li>
                <li><i-ep-check /> 异步处理优化</li>
                <li><i-ep-check /> 智能数据库索引</li>
                <li><i-ep-check /> 内存使用优化</li>
              </ul>
            </div>
          </div>
        </el-card>

        <el-card class="feature-card" shadow="hover">
          <div class="feature-content">
            <div class="feature-icon">
              <i-ep-connection />
            </div>
            <div class="feature-text">
              <h3>API友好</h3>
              <p>提供完整的RESTful API，支持多种验证方式</p>
              <ul class="feature-list">
                <li><i-ep-check /> RESTful API设计</li>
                <li><i-ep-check /> 多API密钥支持</li>
                <li><i-ep-check /> POST/GET双重支持</li>
                <li><i-ep-check /> 详细使用文档</li>
              </ul>
            </div>
          </div>
        </el-card>

        <el-card class="feature-card" shadow="hover">
          <div class="feature-content">
            <div class="feature-icon">
              <i-ep-trend-charts />
            </div>
            <div class="feature-text">
              <h3>数据统计</h3>
              <p>完整的数据统计和分析功能，直观展示使用情况</p>
              <ul class="feature-list">
                <li><i-ep-check /> 实时统计数据</li>
                <li><i-ep-check /> 可视化图表</li>
                <li><i-ep-check /> API调用统计</li>
                <li><i-ep-check /> 使用趋势分析</li>
              </ul>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- API调用指南 -->
    <div class="api-section">
      <h2 class="section-title">
        <i-ep-code />
        API调用文档
      </h2>

      <div class="api-content">
        <!-- 必要参数说明 -->
        <el-card class="api-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <i-ep-document-checked />
              <span>必要参数说明</span>
            </div>
          </template>
          <div class="params-table">
            <table>
              <thead>
                <tr>
                  <th>参数名</th>
                  <th>参数说明</th>
                  <th>是否必须</th>
                  <th>传递方式</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>api_key</code></td>
                  <td>API密钥，用于接口认证</td>
                  <td>是</td>
                  <td>GET参数或请求头(X-API-KEY)</td>
                </tr>
                <tr>
                  <td><code>card_key</code></td>
                  <td>要验证的卡密</td>
                  <td>是</td>
                  <td>GET参数或POST数据</td>
                </tr>
                <tr>
                  <td><code>device_id</code></td>
                  <td>设备唯一标识</td>
                  <td>是</td>
                  <td>GET参数或POST数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>

        <!-- 接口说明 -->
        <el-card class="api-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <i-ep-info-filled />
              <span>接口说明</span>
            </div>
          </template>
          <div class="interface-desc">
            <p>本系统提供卡密验证功能，支持 POST 和 GET 两种请求方式。每个卡密只能绑定一个设备使用。</p>
          </div>
        </el-card>

        <!-- 接口地址 -->
        <el-card class="api-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <i-ep-link />
              <span>接口地址</span>
            </div>
          </template>
          <div class="api-url">
            <p><strong>API接口地址：</strong> <code>https://your-domain.com/api/verify</code></p>
          </div>
        </el-card>

        <!-- POST方式调用 -->
        <el-card class="api-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <i-ep-upload />
              <span>POST 方式调用</span>
            </div>
          </template>
          <div class="api-example">
            <div class="code-block">
              <div class="code-header">POST /api/verify</div>
              <pre><code>Content-Type: application/json
X-API-KEY: your_api_key_here

{
    "card_key": "您的卡密",
    "device_id": "设备唯一标识"
}</code></pre>
            </div>
          </div>
        </el-card>

        <!-- GET方式调用 -->
        <el-card class="api-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <i-ep-download />
              <span>GET 方式调用</span>
            </div>
          </template>
          <div class="api-example">
            <div class="code-block">
              <div class="code-header">GET /api/verify</div>
              <pre><code>GET /api/verify?api_key=your_api_key_here&card_key=您的卡密&device_id=设备唯一标识</code></pre>
            </div>
          </div>
        </el-card>

        <!-- 返回示例 -->
        <el-card class="api-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <i-ep-document-copy />
              <span>返回示例</span>
            </div>
          </template>
          <div class="response-examples">
            <div class="response-item">
              <h4>// 验证成功 (时间卡密)</h4>
              <div class="code-block">
                <pre><code>{
    "code": 0,
    "message": "验证成功",
    "data": {
        "card_key": "xxx",
        "status": 1,
        "use_time": "2024-xx-xx xx:xx:xx",
        "expire_time": "2024-xx-xx xx:xx:xx",
        "card_type": "time",
        "duration": 30,
        "device_id": "xxx",
        "allow_reverify": 1
    }
}</code></pre>
              </div>
            </div>

            <div class="response-item">
              <h4>// 验证成功 (次数卡密)</h4>
              <div class="code-block">
                <pre><code>{
    "code": 0,
    "message": "验证成功，剩余次数：9",
    "data": {
        "card_key": "xxx",
        "status": 1,
        "use_time": "2024-xx-xx xx:xx:xx",
        "card_type": "count",
        "remaining_count": 9,
        "total_count": 10,
        "device_id": "xxx",
        "allow_reverify": 1
    }
}</code></pre>
              </div>
            </div>

            <div class="response-item">
              <h4>// 验证失败</h4>
              <div class="code-block">
                <pre><code>{
    "code": 1,
    "message": "卡密无效或已被其他设备使用",
    "data": null
}</code></pre>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 错误码说明 -->
        <el-card class="api-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <i-ep-warning />
              <span>错误码说明</span>
            </div>
          </template>
          <div class="error-codes-table">
            <table>
              <thead>
                <tr>
                  <th>错误码</th>
                  <th>说明</th>
                  <th>HTTP状态码</th>
                  <th>处理建议</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0</td>
                  <td>成功</td>
                  <td>200</td>
                  <td>请求成功，可以正常处理返回的数据</td>
                </tr>
                <tr>
                  <td>1</td>
                  <td>卡密相关错误</td>
                  <td>400</td>
                  <td>可能的错误原因：卡密不存在、卡密已被其他设备使用、未提供卡密或设备ID</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>API接口未启用</td>
                  <td>403</td>
                  <td>请联系管理员启用API接口</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>系统错误</td>
                  <td>500</td>
                  <td>服务器内部错误，请稍后重试或联系管理员</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>API密钥无效</td>
                  <td>401</td>
                  <td>请检查API密钥是否正确或是否已被禁用</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>卡密已被禁用</td>
                  <td>403</td>
                  <td>此卡密已被管理员手动禁用，请联系管理员处理</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>不允许重复验证</td>
                  <td>403</td>
                  <td>此卡密不允许重复验证，请联系管理员修改设置</td>
                </tr>
                <tr>
                  <td>7</td>
                  <td>次数已用完</td>
                  <td>403</td>
                  <td>此次数卡密的使用次数已用完，请联系管理员</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>

        <!-- 注意事项 -->
        <el-card class="api-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <i-ep-bell />
              <span>注意事项</span>
            </div>
          </template>
          <div class="notes">
            <ul>
              <li>每个卡密只能绑定一个设备使用</li>
              <li>同一设备可以重复验证已绑定的卡密（如果卡密允许）</li>
              <li><code>device_id</code> 应该是设备的唯一标识，建议使用硬件信息生成</li>
              <li>API密钥可以通过Header或GET参数传递，推荐使用Header方式</li>
              <li>卡密分为两种类型：时间卡密和次数卡密</li>
              <li>时间卡密验证后会计算到期时间，次数卡密验证后会消耗一次使用次数</li>
            </ul>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      <p>&copy; {{ currentYear }} {{ siteTitle }} - All Rights Reserved</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const siteTitle = ref('LuckinHappy卡密验证系统')
const siteSubtitle = ref('专业的卡密验证解决方案')
const currentYear = computed(() => new Date().getFullYear())

const scrollToFeatures = () => {
  const featuresElement = document.getElementById('features')
  if (featuresElement) {
    featuresElement.scrollIntoView({
      behavior: 'smooth'
    })
  }
}

const openTestPage = () => {
  window.open('/test-login.html', '_blank')
}

const runFullTest = () => {
  // 这里可以调用测试脚本或者打开测试页面
  const shouldRun = confirm('这将运行完整的API测试，确定要继续吗？')
  if (shouldRun) {
    openTestPage()
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
}

.hero-section {
  text-align: center;
  margin-bottom: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 20px;
}

.hero-title {
  font-size: 3.5rem;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 60px;
}

.stat-card {
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 48px;
  color: #667eea;
}

.stat-content h3 {
  margin: 0 0 10px;
  color: #666;
  font-size: 16px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
}

.features-section {
  margin-bottom: 60px;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 50px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.feature-card {
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.feature-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
}

.feature-text h3 {
  margin: 0 0 10px;
  color: #2c3e50;
  font-size: 20px;
}

.feature-text p {
  margin: 0 0 15px;
  color: #666;
  line-height: 1.5;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.footer {
  text-align: center;
  padding: 30px 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.footer p {
  margin: 0;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
    flex-direction: column;
    gap: 10px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-content {
    flex-direction: column;
    text-align: center;
  }

  .section-title {
    font-size: 2rem;
  }
}

/* API调用指南样式 */
.api-section {
  margin-bottom: 60px;
}

.api-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.api-card {
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.api-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

/* 表格样式 */
.params-table table,
.error-codes-table table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

.params-table th,
.params-table td,
.error-codes-table th,
.error-codes-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.params-table th,
.error-codes-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #667eea;
}

.params-table td:first-child,
.error-codes-table td:first-child {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  color: #667eea;
}

.params-table tr:hover,
.error-codes-table tr:hover {
  background: #f8f9fa;
}

.api-example h4 {
  margin: 20px 0 10px;
  color: #2c3e50;
  font-size: 16px;
}

.api-example p {
  margin: 0 0 15px;
  color: #666;
  line-height: 1.5;
}

.code-block {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin: 15px 0;
  overflow: hidden;
}

.code-header {
  background: #667eea;
  color: white;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.code-block pre {
  margin: 0;
  padding: 12px;
  background: #f8f9fa;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  color: #2c3e50;
  overflow-x: auto;
}

.code-block code {
  background: transparent;
  padding: 0;
  border: none;
}

.api-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.api-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.api-method {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 50px;
  text-align: center;
}

.method-get {
  background: #67c23a;
}

.method-post {
  background: #e6a23c;
}

.api-info {
  flex: 1;
}

.api-path {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.api-desc {
  font-size: 13px;
  color: #666;
}

.response-examples {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.response-item h4 {
  margin: 0 0 10px;
  color: #2c3e50;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-methods {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-item h4 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 16px;
}

.auth-item p {
  margin: 0 0 10px;
  color: #666;
  line-height: 1.5;
}

.auth-item ul {
  margin: 0;
  padding-left: 20px;
}

.auth-item li {
  margin-bottom: 5px;
  color: #666;
  font-size: 14px;
}

.test-tools p {
  margin: 0 0 15px;
  color: #666;
  line-height: 1.5;
}

.tool-links {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.test-info p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.test-info code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #2c3e50;
}

/* API响应式设计 */
@media (max-width: 768px) {
  .api-content {
    grid-template-columns: 1fr;
  }

  .api-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .tool-links {
    flex-direction: column;
  }

  .tool-links .el-button {
    width: 100%;
  }
}

/* 响应式设计 */
</style>
