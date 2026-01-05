<template>
  <div class="verify">
    <el-card class="verify-card" shadow="never">
      <template #header>
        <div class="card-header">
          <i-ep-check-circle />
          <span>卡密验证中心</span>
        </div>
      </template>

      <!-- 验证表单 -->
      <el-form
        ref="verifyFormRef"
        :model="verifyForm"
        :rules="verifyRules"
        label-width="80px"
        class="verify-form"
      >
        <el-form-item label="卡密" prop="card_key">
          <el-input
            v-model="verifyForm.card_key"
            placeholder="请输入您的卡密"
            :prefix-icon="Key"
            clearable
            @keyup.enter="handleVerify"
          />
        </el-form-item>

        <el-form-item label="设备ID" prop="device_id">
          <el-input
            v-model="verifyForm.device_id"
            placeholder="请输入设备唯一标识"
            :prefix-icon="Monitor"
            clearable
            @keyup.enter="handleVerify"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="verifying"
            @click="handleVerify"
            class="verify-btn"
          >
            <i-ep-check />
            立即验证
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 验证结果 -->
      <div v-if="verifyResult" class="verify-result">
        <el-alert
          :type="verifyResult.code === 0 ? 'success' : 'error'"
          :title="verifyResult.message"
          show-icon
          :closable="false"
        />

        <!-- 成功时显示详细信息 -->
        <div v-if="verifyResult.code === 0 && verifyResult.data" class="result-details">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="卡密">
              {{ verifyResult.data.card_key }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="verifyResult.data.status === 1 ? 'success' : 'info'">
                {{ verifyResult.data.status === 1 ? '已激活' : '未激活' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="使用时间">
              {{ formatDate(verifyResult.data.use_time) }}
            </el-descriptions-item>
            <el-descriptions-item label="到期时间">
              {{ formatDate(verifyResult.data.expire_time) }}
            </el-descriptions-item>
            <el-descriptions-item label="卡密类型">
              {{ verifyResult.data.card_type === 'time' ? '时间卡密' : '次数卡密' }}
            </el-descriptions-item>
            <el-descriptions-item label="设备ID">
              <el-tag size="small">{{ verifyResult.data.device_id }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="verifyResult.data.card_type === 'count'" label="剩余次数">
              {{ verifyResult.data.remaining_count }} / {{ verifyResult.data.total_count }}
            </el-descriptions-item>
            <el-descriptions-item label="允许重复验证">
              <el-tag :type="verifyResult.data.allow_reverify ? 'success' : 'warning'">
                {{ verifyResult.data.allow_reverify ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- 使用说明 -->
      <el-card class="usage-guide" shadow="never">
        <template #header>
          <div class="guide-header">
            <i-ep-info-filled />
            <span>使用说明</span>
          </div>
        </template>

        <div class="guide-content">
          <el-steps direction="vertical" :active="1">
            <el-step title="输入卡密" description="在卡密输入框中输入您获得的卡密密钥" />
            <el-step title="输入设备ID" description="输入设备的唯一标识符，用于设备绑定" />
            <el-step title="点击验证" description="点击立即验证按钮进行卡密验证" />
            <el-step title="查看结果" description="验证成功后会显示卡密详细信息" />
          </el-steps>

          <el-divider />

          <div class="tips">
            <h4><i-ep-lightbulb /> 温馨提示：</h4>
            <ul>
              <li>每个卡密只能绑定一个设备使用</li>
              <li>设备ID应该是设备的唯一标识，建议使用硬件信息生成</li>
              <li>卡密类型分为时间卡密和次数卡密两种</li>
              <li>时间卡密验证后会计算到期时间</li>
              <li>次数卡密验证后会消耗一次使用次数</li>
            </ul>
          </div>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Key, Monitor } from '@element-plus/icons-vue'
import { cardAPI } from '@/services/api'
import type { FormInstance } from 'element-plus'

interface VerifyResponse {
  code: number
  message: string
  data?: {
    card_key: string
    status: number
    use_time: string
    expire_time?: string
    card_type: string
    duration?: number
    remaining_count?: number
    total_count?: number
    device_id: string
    allow_reverify: boolean
  }
}

const verifyFormRef = ref<FormInstance>()
const verifying = ref(false)
const verifyResult = ref<VerifyResponse | null>(null)

const verifyForm = reactive({
  card_key: '',
  device_id: ''
})

const verifyRules = {
  card_key: [
    { required: true, message: '请输入卡密', trigger: 'blur' }
  ],
  device_id: [
    { required: true, message: '请输入设备ID', trigger: 'blur' }
  ]
}

const handleVerify = async () => {
  if (!verifyFormRef.value) return

  try {
    await verifyFormRef.value.validate()

    verifying.value = true
    verifyResult.value = null

    const response = await cardAPI.verify(verifyForm.card_key, verifyForm.device_id)

    if (response.data.code === 0) {
      verifyResult.value = response.data
      ElMessage.success('卡密验证成功')
    } else {
      verifyResult.value = {
        code: response.data.code,
        message: response.data.message
      }
      ElMessage.error(response.data.message || '卡密验证失败')
    }

  } catch (error: any) {
    console.error('验证失败:', error)
    verifyResult.value = {
      code: 500,
      message: error.response?.data?.message || '验证失败，请重试'
    }
    ElMessage.error(error.response?.data?.message || '验证失败，请重试')
  } finally {
    verifying.value = false
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.verify {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.verify-card {
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

.verify-form {
  margin-bottom: 30px;
}

.verify-btn {
  width: 100%;
}

.verify-result {
  margin-top: 20px;
}

.result-details {
  margin-top: 20px;
}

.usage-guide {
  margin-top: 30px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
}

.guide-content {
  color: #666;
}

.tips {
  margin-top: 20px;
}

.tips h4 {
  margin: 0 0 15px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tips ul {
  margin: 0;
  padding-left: 20px;
}

.tips li {
  margin-bottom: 8px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .verify {
    padding: 10px;
  }

  .card-header {
    font-size: 16px;
  }
}
</style>
