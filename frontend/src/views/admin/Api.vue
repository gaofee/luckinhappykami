<template>
  <div class="api-admin">
    <!-- API统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <i-ep-key class="stat-icon" />
            <div>
              <div class="stat-value">{{ apiStats.overview.total_keys }}</div>
              <div class="stat-label">总密钥数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <i-ep-check class="stat-icon success" />
            <div>
              <div class="stat-value">{{ apiStats.overview.active_keys }}</div>
              <div class="stat-label">活跃密钥</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <i-ep-trend-charts class="stat-icon info" />
            <div>
              <div class="stat-value">{{ apiStats.overview.total_calls }}</div>
              <div class="stat-label">总调用次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <i-ep-time class="stat-icon warning" />
            <div>
              <div class="stat-value">{{ apiStats.overview.recent_active }}</div>
              <div class="stat-label">24h活跃</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- API密钥管理 -->
    <el-card class="main-card" shadow="never">
      <template #header>
        <div class="card-header">
          <i-ep-connection />
          <span>API密钥管理</span>
          <el-button type="primary" @click="showCreateDialog = true">
            <i-ep-plus />
            创建API密钥
          </el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filters">
        <el-form :inline="true" :model="filters">
          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="选择状态" clearable>
              <el-option label="禁用" :value="0" />
              <el-option label="启用" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadApiKeys">
              <i-ep-search />
              搜索
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- API密钥表格 -->
      <el-table
        :data="apiKeys"
        v-loading="loading"
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="key_name" label="密钥名称" min-width="150" />
        <el-table-column prop="api_key" label="API密钥" min-width="300">
          <template #default="scope">
            <div class="api-key-cell">
              <span class="masked-key">{{ maskApiKey(scope.row.api_key) }}</span>
              <el-button
                size="small"
                type="text"
                @click="copyApiKey(scope.row.api_key)"
                title="复制完整密钥"
              >
                <i-ep-copy-document />
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="use_count" label="使用次数" width="100" />
        <el-table-column prop="last_use_time" label="最后使用" min-width="160">
          <template #default="scope">
            {{ scope.row.last_use_time ? formatDate(scope.row.last_use_time) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" min-width="160">
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <!-- 状态切换按钮 -->
              <el-button
                v-if="scope.row.status === 1"
                size="small"
                type="warning"
                @click="updateApiKeyStatus(scope.row, 0)"
              >
                禁用
              </el-button>
              <el-button
                v-else
                size="small"
                type="success"
                @click="updateApiKeyStatus(scope.row, 1)"
              >
                启用
              </el-button>

              <!-- 重置密钥按钮 -->
              <el-button
                size="small"
                type="primary"
                @click="resetApiKey(scope.row)"
              >
                重置
              </el-button>

              <!-- 删除按钮 -->
              <el-button
                size="small"
                type="danger"
                @click="deleteApiKey(scope.row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建API密钥对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建API密钥"
      width="500px"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="密钥名称" prop="key_name">
          <el-input
            v-model="createForm.key_name"
            placeholder="输入密钥名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            placeholder="输入描述信息（可选）"
            :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createApiKey" :loading="creating">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 显示新创建/重置的API密钥对话框 -->
    <el-dialog
      v-model="showNewKeyDialog"
      :title="newApiKey?.use_count === 0 ? 'API密钥重置成功' : 'API密钥创建成功'"
      width="600px"
    >
      <div class="new-key-content">
        <el-alert
          title="请保存好您的API密钥"
          :description="newApiKey?.use_count === 0 ? '新重置的API密钥已生成，原密钥已失效。' : 'API密钥只在创建时显示一次，丢失后需要重置密钥。'"
          type="warning"
          show-icon
          :closable="false"
        />

        <div class="key-info">
          <div class="key-item">
            <strong>密钥名称：</strong>{{ newApiKey.key_name }}
          </div>
          <div class="key-item">
            <strong>API密钥：</strong>
            <div class="key-value">
              <span>{{ newApiKey.api_key }}</span>
              <el-button size="small" @click="copyApiKey(newApiKey.api_key)">
                <i-ep-copy-document />
                复制
              </el-button>
            </div>
          </div>
          <div class="key-item">
            <strong>使用说明：</strong>
          </div>
          <div class="usage-instructions">
            <p>在API请求中添加请求头：</p>
            <code>X-API-Key: {{ newApiKey.api_key }}</code>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="showNewKeyDialog = false">
          我已保存密钥
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiKeyAPI } from '@/services/api'
import type { FormInstance } from 'element-plus'

interface ApiKey {
  id: number
  key_name: string
  api_key: string
  status: number
  use_count: number
  last_use_time: string | null
  create_time: string
  description: string
}

interface ApiStats {
  overview: {
    total_keys: number
    total_calls: number
    active_keys: number
    recent_active: number
  }
  dailyStats: Array<{
    date: string
    calls: number
  }>
}

// 响应式数据
const loading = ref(false)
const creating = ref(false)
const showCreateDialog = ref(false)
const showNewKeyDialog = ref(false)
const newApiKey = ref<ApiKey | null>(null)

const apiKeys = ref<ApiKey[]>([])
const apiStats = reactive<ApiStats>({
  overview: {
    total_keys: 0,
    total_calls: 0,
    active_keys: 0,
    recent_active: 0,
  },
  dailyStats: [],
})

const filters = reactive({
  status: undefined,
})

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
})

const createForm = reactive({
  key_name: '',
  description: '',
})

const createRules = {
  key_name: [
    { required: true, message: '请输入密钥名称', trigger: 'blur' },
    { min: 2, max: 50, message: '密钥名称长度应在2-50个字符', trigger: 'blur' }
  ],
}

// 表单引用
const createFormRef = ref<FormInstance>()

// 方法
const loadApiKeys = async () => {
  loading.value = true
  try {
    const response = await apiKeyAPI.getApiKeys({
      page: pagination.page,
      limit: pagination.limit,
      status: filters.status,
    })

    if (response.data.code === 0) {
      apiKeys.value = response.data.data.apiKeys
      pagination.total = response.data.data.pagination.total
    } else {
      ElMessage.error(response.data.message || '加载API密钥列表失败')
    }
  } catch (error: any) {
    console.error('加载API密钥列表失败:', error)
    ElMessage.error(error.response?.data?.message || '加载API密钥列表失败')
  } finally {
    loading.value = false
  }
}

const loadApiStats = async () => {
  try {
    const response = await apiKeyAPI.getApiStats()

    if (response.data.code === 0) {
      Object.assign(apiStats, response.data.data)
    }
  } catch (error: any) {
    console.error('加载API统计失败:', error)
  }
}

const createApiKey = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()

    creating.value = true

    const response = await apiKeyAPI.createApiKey({
      key_name: createForm.key_name,
      description: createForm.description,
    })

    if (response.data.code === 0) {
      ElMessage.success('API密钥创建成功')
      showCreateDialog.value = false

      // 显示新创建的密钥
      newApiKey.value = response.data.data
      showNewKeyDialog.value = true

      // 重置表单
      createForm.key_name = ''
      createForm.description = ''

      // 重新加载数据
      loadApiKeys()
      loadApiStats()
    } else {
      ElMessage.error(response.data.message || '创建失败')
    }
  } catch (error: any) {
    console.error('创建API密钥失败:', error)
    ElMessage.error(error.response?.data?.message || '创建失败')
  } finally {
    creating.value = false
  }
}

const updateApiKeyStatus = async (apiKey: ApiKey, status: 0 | 1) => {
  try {
    await ElMessageBox.confirm(
      `确定要${status === 1 ? '启用' : '禁用'}API密钥 "${apiKey.key_name}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: status === 1 ? '取消' : '取消',
        type: status === 1 ? 'success' : 'warning',
      }
    )

    await apiKeyAPI.updateApiKeyStatus(apiKey.id, status)
    ElMessage.success(status === 1 ? 'API密钥启用成功' : 'API密钥禁用成功')
    loadApiKeys()
    loadApiStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '操作失败')
    }
  }
}

const resetApiKey = async (apiKey: ApiKey) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置API密钥 "${apiKey.key_name}" 吗？重置后将生成新的密钥，原密钥将失效。`,
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await apiKeyAPI.resetApiKey(apiKey.id)

    if (response.data.code === 0) {
      ElMessage.success('API密钥重置成功')

      // 显示新重置的密钥
      newApiKey.value = {
        id: apiKey.id,
        key_name: apiKey.key_name,
        api_key: response.data.data.new_api_key,
        status: apiKey.status,
        use_count: 0, // 重置后使用次数归零
        last_use_time: null,
        create_time: apiKey.create_time,
        description: apiKey.description
      }
      showNewKeyDialog.value = true

      loadApiKeys()
      loadApiStats()
    } else {
      ElMessage.error(response.data.message || '重置失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '重置失败')
    }
  }
}

const deleteApiKey = async (apiKey: ApiKey) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除API密钥 "${apiKey.key_name}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await apiKeyAPI.deleteApiKey(apiKey.id)
    ElMessage.success('删除成功')
    loadApiKeys()
    loadApiStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

const copyApiKey = async (apiKey: string) => {
  try {
    await navigator.clipboard.writeText(apiKey)
    ElMessage.success('API密钥已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const maskApiKey = (apiKey: string) => {
  if (apiKey.length <= 8) return apiKey
  return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4)
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  loadApiKeys()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadApiKeys()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadApiKeys()
  loadApiStats()
})
</script>

<style scoped>
.api-admin {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  background: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 32px;
  color: #667eea;
}

.stat-icon.success {
  color: #67c23a;
}

.stat-icon.warning {
  color: #e6a23c;
}

.stat-icon.info {
  color: #909399;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.main-card {
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 600;
}

.filters {
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.api-key-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.masked-key {
  font-family: monospace;
  font-weight: 500;
}

.operation-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.new-key-content {
  max-height: 400px;
  overflow-y: auto;
}

.key-info {
  margin-top: 20px;
}

.key-item {
  margin-bottom: 15px;
  line-height: 1.5;
}

.key-value {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
}

.usage-instructions {
  margin-top: 10px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 4px;
}

.usage-instructions code {
  display: block;
  margin-top: 10px;
  padding: 8px;
  background: #e0f2fe;
  border-radius: 4px;
  font-family: monospace;
  color: #1976d2;
}
</style>
