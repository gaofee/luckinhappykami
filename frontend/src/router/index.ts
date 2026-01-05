import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/verify',
    name: 'Verify',
    component: () => import('@/views/Verify.vue'),
    meta: { title: '卡密验证' }
  },
  {
    path: '/admin',
    redirect: '/admin/cards',
    children: [
      {
        path: 'cards',
        name: 'AdminCards',
        component: () => import('@/views/admin/Cards.vue'),
        meta: { title: '卡密管理', requiresAuth: true }
      },
      {
        path: 'stats',
        name: 'AdminStats',
        component: () => import('@/views/admin/Stats.vue'),
        meta: { title: '数据统计', requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/Settings.vue'),
        meta: { title: '系统设置', requiresAuth: true }
      },
      {
        path: 'api',
        name: 'AdminApi',
        component: () => import('@/views/admin/Api.vue'),
        meta: { title: 'API接口', requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '管理员登录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - LuckinHappy卡密验证系统`
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 检查用户是否已登录
    const token = localStorage.getItem('admin_token')
    if (token) {
      // 已登录，允许访问
      next()
    } else {
      // 未登录，跳转到登录页面
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存原目标路径
      })
    }
  } else {
    next()
  }
})

export default router
