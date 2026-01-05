<template>
  <div class="login">
    <el-card class="login-card" shadow="hover">
      <template #header>
        <div class="login-header">
          <i-ep-user />
          <span>管理员登录</span>
        </div>
      </template>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loggingIn"
            @click="handleLogin"
            class="login-btn"
          >
            <i-ep-key />
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { authAPI } from '@/services/api'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loggingIn = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()

    loggingIn.value = true

    const response = await authAPI.login(loginForm.username, loginForm.password)

    if (response.data.code === 0) {
      // 保存token到localStorage
      localStorage.setItem('admin_token', response.data.data.token)
      // 保存用户信息到localStorage
      localStorage.setItem('admin_user', JSON.stringify(response.data.data.user))

      ElMessage.success('登录成功')

      // 检查是否有重定向参数
      const redirect = router.currentRoute.value.query.redirect as string
      if (redirect) {
        // 跳转到原来的页面
        router.push(redirect)
      } else {
        // 默认跳转到卡密管理页面
        router.push('/admin/cards')
      }
    } else {
      ElMessage.error(response.data.message || '登录失败')
    }

  } catch (error: any) {
    console.error('登录失败:', error)
    const message = error.response?.data?.message || '登录失败，请重试'
    ElMessage.error(message)
  } finally {
    loggingIn.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.login-btn {
  width: 100%;
}
</style>
