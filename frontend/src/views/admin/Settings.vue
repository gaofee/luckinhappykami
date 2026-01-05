<template>
  <div class="settings-admin">
    <el-card class="main-card" shadow="never">
      <template #header>
        <div class="card-header">
          <i-ep-setting />
          <span>系统设置</span>
          <el-button type="primary" @click="saveAllSettings" :loading="saving">
            <i-ep-check />
            保存所有设置
          </el-button>
        </div>
      </template>

      <div class="settings-content">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本设置" name="basic">
            <el-form :model="settings" label-width="120px">
              <el-form-item label="网站标题">
                <el-input
                  v-model="settings.site_title"
                  placeholder="输入网站标题"
                  clearable
                />
              </el-form-item>
              <el-form-item label="网站副标题">
                <el-input
                  v-model="settings.site_subtitle"
                  placeholder="输入网站副标题"
                  clearable
                />
              </el-form-item>
              <el-form-item label="版权信息">
                <el-input
                  v-model="settings.copyright_text"
                  placeholder="输入版权信息"
                  clearable
                />
              </el-form-item>
              <el-form-item label="网站描述">
                <el-input
                  v-model="settings.site_description"
                  placeholder="输入网站描述"
                  type="textarea"
                  :rows="3"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="联系方式" name="contact">
            <el-form :model="settings" label-width="120px">
              <el-form-item label="QQ群">
                <el-input
                  v-model="settings.contact_qq_group"
                  placeholder="输入QQ群号"
                  clearable
                />
              </el-form-item>
              <el-form-item label="微信二维码">
                <el-input
                  v-model="settings.contact_wechat_qr"
                  placeholder="输入微信二维码图片路径"
                  clearable
                />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input
                  v-model="settings.contact_email"
                  placeholder="输入联系邮箱"
                  clearable
                />
              </el-form-item>
              <el-form-item label="客服电话">
                <el-input
                  v-model="settings.contact_phone"
                  placeholder="输入客服电话"
                  clearable
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="高级设置" name="advanced">
            <el-form :model="settings" label-width="120px">
              <el-form-item label="默认卡密时长">
                <el-select v-model="settings.default_card_duration" placeholder="选择默认时长">
                  <el-option label="1天" :value="'1'" />
                  <el-option label="7天" :value="'7'" />
                  <el-option label="30天" :value="'30'" />
                  <el-option label="90天" :value="'90'" />
                  <el-option label="365天" :value="'365'" />
                </el-select>
              </el-form-item>
              <el-form-item label="默认卡密次数">
                <el-input-number
                  v-model="settings.default_card_count"
                  :min="1"
                  :max="10000"
                  controls-position="right"
                />
              </el-form-item>
              <el-form-item label="默认生成数量">
                <el-select v-model="settings.default_generate_count" placeholder="选择默认生成数量">
                  <el-option label="1个" :value="'1'" />
                  <el-option label="10个" :value="'10'" />
                  <el-option label="20个" :value="'20'" />
                  <el-option label="50个" :value="'50'" />
                </el-select>
              </el-form-item>
              <el-form-item label="允许重复验证">
                <el-switch v-model="settings.allow_reverify" />
              </el-form-item>
              <el-form-item label="启用邮件通知">
                <el-switch v-model="settings.enable_email_notification" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="修改密码" name="password">
            <div class="password-section">
              <el-alert
                title="密码安全提示"
                description="密码长度至少6位，建议使用字母、数字和特殊字符的组合。"
                type="info"
                show-icon
                :closable="false"
                class="password-alert"
              />

              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="120px"
                class="password-form"
              >
                <el-form-item label="当前密码" prop="old_password">
                  <el-input
                    v-model="passwordForm.old_password"
                    type="password"
                    placeholder="请输入当前密码"
                    show-password
                    clearable
                  />
                </el-form-item>

                <el-form-item label="新密码" prop="new_password">
                  <el-input
                    v-model="passwordForm.new_password"
                    type="password"
                    placeholder="请输入新密码"
                    show-password
                    clearable
                  />
                </el-form-item>

                <el-form-item label="确认新密码" prop="confirm_password">
                  <el-input
                    v-model="passwordForm.confirm_password"
                    type="password"
                    placeholder="请再次输入新密码"
                    show-password
                    clearable
                  />
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    @click="changePassword"
                    :loading="changingPassword"
                    class="change-password-btn"
                  >
                    <i-ep-lock />
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { settingsAPI, authAPI } from '@/services/api'
import type { FormInstance } from 'element-plus'

const activeTab = ref('basic')
const loading = ref(false)
const saving = ref(false)
const changingPassword = ref(false)

// 密码表单
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const passwordRules = {
  old_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.new_password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 表单引用
const passwordFormRef = ref<FormInstance>()

// 系统设置
const settings = reactive({
  // 基本设置
  site_title: 'LuckinHappy卡密验证系统',
  site_subtitle: '专业的卡密验证解决方案',
  site_description: 'LuckinHappy卡密验证系统，为您提供安全、便捷的卡密验证服务',
  copyright_text: 'LuckinHappy卡密系统 - All Rights Reserved',

  // 联系方式
  contact_qq_group: '123456789',
  contact_wechat_qr: 'assets/images/wechat-qr.jpg',
  contact_email: 'support@example.com',
  contact_phone: '',

  // 高级设置
  default_card_duration: '30',
  default_card_count: 100,
  default_generate_count: '10',
  allow_reverify: true,
  enable_email_notification: false,
})

// 加载设置
const loadSettings = async () => {
  loading.value = true
  try {
    const response = await settingsAPI.getSettings()

    if (response.data.code === 0) {
      // 更新设置
      Object.assign(settings, response.data.data)
      ElMessage.success('设置加载成功')
    } else {
      ElMessage.error(response.data.message || '加载设置失败')
    }
  } catch (error: any) {
    console.error('加载设置失败:', error)
    ElMessage.error(error.response?.data?.message || '加载设置失败')
  } finally {
    loading.value = false
  }
}

// 保存所有设置
const saveAllSettings = async () => {
  saving.value = true
  try {
    // 将设置转换为字符串格式
    const settingsToSave: Record<string, string> = {}
    for (const [key, value] of Object.entries(settings)) {
      settingsToSave[key] = String(value)
    }

    const response = await settingsAPI.updateSettings(settingsToSave)

    if (response.data.code === 0) {
      ElMessage.success('设置保存成功')
    } else {
      ElMessage.error(response.data.message || '保存设置失败')
    }
  } catch (error: any) {
    console.error('保存设置失败:', error)
    ElMessage.error(error.response?.data?.message || '保存设置失败')
  } finally {
    saving.value = false
  }
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()

    changingPassword.value = true

    const response = await authAPI.changePassword(
      passwordForm.old_password,
      passwordForm.new_password
    )

    if (response.data.code === 0) {
      ElMessage.success('密码修改成功')

      // 清空表单
      passwordForm.old_password = ''
      passwordForm.new_password = ''
      passwordForm.confirm_password = ''

      // 重置表单验证状态
      passwordFormRef.value.clearValidate()
    } else {
      ElMessage.error(response.data.message || '密码修改失败')
    }
  } catch (error: any) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.response?.data?.message || '密码修改失败')
  } finally {
    changingPassword.value = false
  }
}

// 生命周期
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-admin {
  padding: 20px;
}

.main-card {
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

.settings-content {
  padding: 20px 0;
}

.password-section {
  max-width: 600px;
}

.password-alert {
  margin-bottom: 20px;
}

.password-form {
  margin-top: 20px;
}

.change-password-btn {
  width: 150px;
}
</style>
