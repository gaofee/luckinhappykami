<template>
  <div id="app">
    <!-- 顶部导航栏：始终显示 -->
    <el-header class="top-header">
      <div class="header-content">
        <div class="header-title">
          <h2><i-ep-key /> {{ appName }}</h2>
        </div>
        <div class="header-actions">
          <template v-if="!isLoggedIn">
            <!-- 未登录状态：显示登录按钮 -->
            <el-button type="primary" @click="goToLogin" class="login-btn">
              <i-ep-user />
              登录
            </el-button>
          </template>
          <template v-else>
            <!-- 已登录状态：显示登出按钮 -->
            <span class="user-info">
              <i-ep-user style="margin-right: 5px;" />
              {{ currentUser?.username || '管理员' }}
            </span>
            <el-button type="text" @click="handleLogout" style="color: #409eff;">
              <i-ep-switch-button />
              退出登录
            </el-button>
          </template>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <div class="main-wrapper">
      <!-- 未登录状态：全屏显示页面内容 -->
      <div v-if="!isLoggedIn" class="content-fullscreen">
        <router-view />
      </div>

      <!-- 已登录状态：显示完整的应用界面 -->
      <el-container v-else class="app-container">
        <!-- 侧边栏导航 -->
        <el-aside width="250px" class="sidebar">
          <div class="sidebar-content">
            <el-menu
              :default-active="$route.path"
              class="menu"
              router
              unique-opened
            >
              <el-menu-item index="/">
                <i-ep-house />
                <template #title>首页</template>
              </el-menu-item>
              <el-menu-item index="/verify">
                <i-ep-check />
                <template #title>卡密验证</template>
              </el-menu-item>
              <el-submenu index="admin">
                <template #title>
                  <i-ep-setting />
                  <span>管理中心</span>
                </template>
                <el-menu-item index="/admin/cards">卡密管理</el-menu-item>
                <el-menu-item index="/admin/stats">数据统计</el-menu-item>
                <el-menu-item index="/admin/settings">系统设置</el-menu-item>
                <el-menu-item index="/admin/api">API接口</el-menu-item>
              </el-submenu>
            </el-menu>
          </div>
        </el-aside>

        <!-- 主内容区域 -->
        <el-container class="main-container">
          <el-main class="main-content">
            <router-view />
          </el-main>
        </el-container>
      </el-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authAPI } from '@/services/api'

const router = useRouter()

const appName = computed(() => 'LuckinHappy卡密验证系统')

// 使用ref来存储登录状态，使其响应式
const isLoggedIn = ref(!!localStorage.getItem('admin_token'))
const currentUser = ref<{ id: number; username: string } | null>(null)

// 获取当前用户信息
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('admin_user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    return null
  }
}

// 监听localStorage变化（用于多标签页同步）
const checkLoginStatus = () => {
  const token = localStorage.getItem('admin_token')
  isLoggedIn.value = !!token
  currentUser.value = token ? getCurrentUser() : null
}

// 页面加载时检查一次
checkLoginStatus()

// 监听storage事件（其他标签页登录/登出时同步）
window.addEventListener('storage', (e) => {
  if (e.key === 'admin_token') {
    checkLoginStatus()
  }
})

// 监听路由变化，当路由改变时检查登录状态
router.afterEach(() => {
  checkLoginStatus()
})

// 定期检查token状态（防止token过期）
setInterval(checkLoginStatus, 30000) // 每30秒检查一次

const goToLogin = () => {
  router.push('/login')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '确认登出',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 清除token和用户信息
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')

    // 更新登录状态
    isLoggedIn.value = false
    currentUser.value = null

    ElMessage.success('已成功退出登录')

    // 强制刷新页面以确保所有状态正确重置
    window.location.href = '/'
  } catch (error) {
    // 用户取消登出
  }
}
</script>

<style scoped>
/* 顶部导航栏样式 */
.top-header {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
}

.top-header .header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.top-header .header-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  color: #606266;
  font-size: 14px;
}

/* 主要内容区域 */
.main-wrapper {
  margin-top: 60px; /* 为固定顶部栏留出空间 */
  min-height: calc(100vh - 60px);
}

.content-fullscreen {
  min-height: calc(100vh - 60px);
}

.app-container {
  height: calc(100vh - 60px);
}

.sidebar {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  color: #2c3e50;
  box-shadow: 2px 0 8px rgba(0,0,0,0.06);
  height: 100%;
  border-right: 1px solid rgba(102, 126, 234, 0.1);
}

.sidebar-content {
  padding: 20px 0;
}

.menu {
  border-right: none;
  background: transparent;
}

.menu :deep(.el-menu-item) {
  color: #666;
  border-bottom: 1px solid rgba(102, 126, 234, 0.05);
}

.menu :deep(.el-menu-item:hover),
.menu :deep(.el-menu-item.is-active) {
  background: rgba(102, 126, 234, 0.1);
  color: #409eff;
}

.menu :deep(.el-submenu__title) {
  color: #666;
}

.menu :deep(.el-submenu__title:hover) {
  background: rgba(102, 126, 234, 0.1);
  color: #409eff;
}

.main-content {
  background: #f5f7fa;
  padding: 20px;
}

/* 恢复默认Element UI按钮样式 */
.login-btn {
  /* 使用Element UI默认样式 */
}
</style>
