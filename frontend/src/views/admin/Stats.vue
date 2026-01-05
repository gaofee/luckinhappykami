<template>
  <div class="stats-admin">
    <el-card class="main-card" shadow="never">
      <template #header>
        <div class="card-header">
          <i-ep-trend-charts />
          <span>数据统计</span>
        </div>
      </template>

      <div class="stats-content">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <i-ep-key class="stat-icon" />
                <div>
                  <div class="stat-value">{{ stats.total }}</div>
                  <div class="stat-label">总卡密数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <i-ep-check class="stat-icon success" />
                <div>
                  <div class="stat-value">{{ stats.used }}</div>
                  <div class="stat-label">已使用</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <i-ep-time class="stat-icon warning" />
                <div>
                  <div class="stat-value">{{ stats.unused }}</div>
                  <div class="stat-label">未使用</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <i-ep-percentage class="stat-icon info" />
                <div>
                  <div class="stat-value">{{ stats.usage_rate }}%</div>
                  <div class="stat-label">使用率</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-divider>使用趋势</el-divider>

        <el-row :gutter="20">
          <el-col :span="16">
            <el-card class="chart-card">
              <template #header>
                <div class="chart-header">
                  <i-ep-trend-charts />
                  <span>卡密使用趋势 (最近7天)</span>
                  <el-select v-model="trendDays" size="small" @change="loadTrends" style="margin-left: auto;">
                    <el-option label="7天" :value="7" />
                    <el-option label="14天" :value="14" />
                    <el-option label="30天" :value="30" />
                  </el-select>
                </div>
              </template>
              <div class="chart-container">
                <v-chart :option="trendChartOption" :autoresize="true" />
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="chart-card">
              <template #header>
                <div class="chart-header">
                  <i-ep-pie-chart />
                  <span>卡密状态分布</span>
                </div>
              </template>
              <div class="chart-container">
                <v-chart :option="statusChartOption" :autoresize="true" />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { statsAPI } from '@/services/api'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  LineChart,
  PieChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'

// 注册ECharts组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const loading = ref(false)
const statsData = reactive({
  cards: {
    total: 0,
    used: 0,
    unused: 0,
    disabled: 0,
    usage_rate: 0
  },
  apis: {
    total: 0,
    active: 0,
    total_calls: 0
  },
  recent: {
    new_cards: 0,
    recent_used: 0
  }
})

// 为模板兼容性保留的stats计算属性
const stats = ref({
  total: 0,
  used: 0,
  unused: 0,
  usage_rate: 0
})

// 图表相关数据
const trendDays = ref(7)
const trendData = ref<any[]>([])
const trendChartOption = ref({})
const statusChartOption = ref({})

// 加载趋势数据
const loadTrends = async () => {
  try {
    const response = await statsAPI.getTrends(trendDays.value)
    if (response.data.code === 0) {
      trendData.value = response.data.data.trends
      updateTrendChart()
    }
  } catch (error: any) {
    console.error('获取趋势数据失败:', error)
  }
}

// 更新趋势图表
const updateTrendChart = () => {
  trendChartOption.value = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增卡密', '使用卡密']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.value.map(item => {
        const date = new Date(item.date)
        return `${date.getMonth() + 1}/${date.getDate()}`
      })
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增卡密',
        type: 'line',
        stack: 'Total',
        data: trendData.value.map(item => item.new_cards),
        smooth: true,
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '使用卡密',
        type: 'line',
        stack: 'Total',
        data: trendData.value.map(item => item.used_cards),
        smooth: true,
        itemStyle: { color: '#E6A23C' }
      }
    ]
  }
}

// 更新状态分布图表
const updateStatusChart = () => {
  statusChartOption.value = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '卡密状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: statsData.cards.used, name: '已使用', itemStyle: { color: '#67C23A' } },
          { value: statsData.cards.unused, name: '未使用', itemStyle: { color: '#E6A23C' } },
          { value: statsData.cards.disabled, name: '已停用', itemStyle: { color: '#F56C6C' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}

const loadStats = async () => {
  loading.value = true
  try {
    const response = await statsAPI.getStats()

    if (response.data.code === 0) {
      Object.assign(statsData, response.data.data)

      // 更新模板使用的stats
      stats.value = {
        total: statsData.cards.total,
        used: statsData.cards.used,
        unused: statsData.cards.unused,
        usage_rate: statsData.cards.usage_rate
      }
    } else {
      ElMessage.error(response.data.message || '获取统计数据失败')
    }
  } catch (error: any) {
    console.error('获取统计数据失败:', error)
    ElMessage.error(error.response?.data?.message || '获取统计数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadStats()
  await loadTrends()
  updateStatusChart()
})
</script>

<style scoped>
.stats-admin {
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

.chart-card {
  height: 350px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.chart-container {
  height: 280px;
  width: 100%;
}

.chart-placeholder {
  text-align: center;
  color: #999;
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 10px;
}
</style>
