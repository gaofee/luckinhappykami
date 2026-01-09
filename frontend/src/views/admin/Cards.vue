<template>
  <div class="cards-admin">
    <el-card class="main-card" shadow="never">
      <template #header>
        <div class="card-header">
          <i-ep-key />
          <span>卡密管理</span>
        </div>
      </template>

      <!-- 操作栏 -->
      <div class="toolbar">
        <el-button type="primary" @click="showGenerateDialog = true">
          <i-ep-plus />
          生成卡密
        </el-button>
        <el-button type="danger" :disabled="selectedCards.length === 0" @click="batchDelete">
          <i-ep-delete />
          批量删除
        </el-button>
        <el-button type="success" @click="exportCards">
          <i-ep-download />
          导出Excel
        </el-button>
      </div>

      <!-- 筛选栏 -->
      <div class="filters">
        <el-form :inline="true" :model="filters">
          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="选择状态" clearable>
              <el-option label="未使用" :value="0" />
              <el-option label="已使用" :value="1" />
              <el-option label="已停用" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="filters.card_type" placeholder="选择类型" clearable>
              <el-option label="时间卡密" value="time" />
              <el-option label="次数卡密" value="count" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="filters.search"
              placeholder="搜索卡密"
              clearable
              style="width: 200px"
            >
              <template #prefix>
                <i-ep-search />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadCards">
              <i-ep-search />
              搜索
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 卡密表格 -->
      <el-table
        :data="cards"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="card_key" label="卡密" min-width="200">
          <template #default="scope">
            <div class="card-key-cell">
              <span>{{ scope.row.card_key }}</span>
              <el-button
                size="small"
                type="primary"
                @click="copyCardKey(scope.row.card_key)"
                title="复制卡密"
              >
                复制
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="card_type" label="类型" width="100">
          <template #default="scope">
            {{ scope.row.card_type === 'time' ? '时间卡密' : '次数卡密' }}
          </template>
        </el-table-column>
        <el-table-column label="有效期/次数" min-width="150">
          <template #default="scope">
            <div v-if="scope.row.card_type === 'time'">
              <div v-if="scope.row.expire_time">
                {{ calculateRemainingDays(scope.row.expire_time) }}
                <span class="original-duration">{{ calculateRemainingDays(scope.row.expire_time) === '已过期' ? '（原' + scope.row.duration + '天）' : '天（原' + scope.row.duration + '天）' }}</span>
              </div>
              <div v-else>
                {{ scope.row.duration }}天
              </div>
            </div>
            <div v-else>
              {{ scope.row.remaining_count }}/{{ scope.row.total_count }}次
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="device_id" label="绑定设备" min-width="200">
          <template #default="scope">
            <div v-if="scope.row.device_id" class="device-cell">
              <span :title="scope.row.device_id">{{ maskDeviceId(scope.row.device_id) }}</span>
            </div>
            <div v-else class="no-device">
              -
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="use_time" label="使用时间" min-width="160">
          <template #default="scope">
            {{ scope.row.use_time ? formatDate(scope.row.use_time) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" min-width="160">
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <!-- 删除按钮 -->
              <el-button
                v-if="scope.row.status === 0"
                size="small"
                type="danger"
                @click="deleteCard(scope.row)"
              >
                删除
              </el-button>

              <!-- 停用按钮 -->
              <el-button
                v-if="scope.row.status === 1"
                size="small"
                type="warning"
                @click="disableCard(scope.row)"
              >
                停用
              </el-button>

              <!-- 启用按钮 -->
              <el-button
                v-if="scope.row.status === 2"
                size="small"
                type="success"
                @click="enableCard(scope.row)"
              >
                启用
              </el-button>

              <!-- 续期按钮 -->
              <el-button
                v-if="scope.row.card_type === 'time' && scope.row.status === 1"
                size="small"
                type="primary"
                @click="openExtendDialog(scope.row)"
              >
                续期
              </el-button>

              <!-- 增加次数按钮 -->
              <el-button
                v-if="scope.row.card_type === 'count' && scope.row.status === 1"
                size="small"
                type="primary"
                @click="openAddCountDialog(scope.row)"
              >
                增加次数
              </el-button>

              <!-- 解绑设备按钮 -->
              <el-button
                v-if="scope.row.device_id && scope.row.status === 1"
                size="small"
                type="info"
                @click="unbindDevice(scope.row)"
              >
                解绑设备
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

    <!-- 生成卡密对话框 -->
    <el-dialog
      v-model="showGenerateDialog"
      title="生成卡密"
      width="600px"
    >
      <el-form
        ref="generateFormRef"
        :model="generateForm"
        :rules="generateRules"
        label-width="100px"
      >
        <el-form-item label="生成数量" prop="count">
          <el-input-number
            v-model="generateForm.count"
            :min="1"
            :max="1000"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="卡密类型" prop="card_type">
          <el-radio-group v-model="generateForm.card_type">
            <el-radio label="time">时间卡密</el-radio>
            <el-radio label="count">次数卡密</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="generateForm.card_type === 'time'"
          label="使用时长"
          prop="duration"
        >
          <el-select v-model="generateForm.duration">
            <el-option label="1天" :value="1" />
            <el-option label="7天" :value="7" />
            <el-option label="30天" :value="30" />
            <el-option label="90天" :value="90" />
            <el-option label="365天" :value="365" />
          </el-select>
        </el-form-item>

        <el-form-item
          v-else
          label="使用次数"
          prop="total_count"
        >
          <el-input-number
            v-model="generateForm.total_count"
            :min="1"
            :max="10000"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="允许重复验证">
          <el-switch v-model="generateForm.allow_reverify" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showGenerateDialog = false">取消</el-button>
        <el-button type="primary" @click="generateCards" :loading="generating">
          生成
        </el-button>
      </template>
    </el-dialog>

    <!-- 续期对话框 -->
    <el-dialog
      v-model="showExtendDialog"
      title="续期卡密"
      width="500px"
    >
      <div class="dialog-content">
        <p><strong>卡密：</strong>{{ currentCard?.card_key }}</p>
        <p><strong>当前到期时间：</strong>{{ currentCard?.expire_time ? formatDate(currentCard.expire_time) : '未设置' }}</p>

        <el-form :model="extendForm" label-width="100px">
          <el-form-item label="续期天数">
            <el-input-number
              v-model="extendForm.days"
              :min="1"
              :max="365"
              controls-position="right"
            />
            <span class="unit">天</span>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showExtendDialog = false">取消</el-button>
        <el-button type="primary" @click="extendCard" :loading="extending">
          续期
        </el-button>
      </template>
    </el-dialog>

    <!-- 增加次数对话框 -->
    <el-dialog
      v-model="showAddCountDialog"
      title="增加卡密次数"
      width="500px"
    >
      <div class="dialog-content">
        <p><strong>卡密：</strong>{{ currentCard?.card_key }}</p>
        <p><strong>当前次数：</strong>{{ currentCard?.remaining_count }}/{{ currentCard?.total_count }}</p>

        <el-form :model="addCountForm" label-width="100px">
          <el-form-item label="增加次数">
            <el-input-number
              v-model="addCountForm.count"
              :min="1"
              :max="10000"
              controls-position="right"
            />
            <span class="unit">次</span>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showAddCountDialog = false">取消</el-button>
        <el-button type="primary" @click="addCardCount" :loading="addingCount">
          增加
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cardAPI, settingsAPI } from '@/services/api'
import type { FormInstance } from 'element-plus'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface Card {
  id: number
  card_key: string
  encrypted_key: string
  status: number
  card_type: string
  duration?: number
  total_count?: number
  remaining_count?: number
  allow_reverify: boolean
  device_id?: string
  use_time?: string
  expire_time?: string
  create_time: string
}

// 响应式数据
const loading = ref(false)
const generating = ref(false)
const extending = ref(false)
const addingCount = ref(false)
const showGenerateDialog = ref(false)
const showExtendDialog = ref(false)
const showAddCountDialog = ref(false)
const selectedCards = ref<Card[]>([])
const currentCard = ref<Card | null>(null)

const cards = ref<Card[]>([])

const filters = reactive({
  status: undefined,
  card_type: undefined,
  search: ''
})

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const generateForm = reactive({
  count: 10,
  card_type: 'time',
  duration: 30,
  total_count: 100,
  allow_reverify: true
})

const generateRules = {
  count: [
    { required: true, message: '请输入生成数量', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '数量应在1-1000之间', trigger: 'blur' }
  ],
  card_type: [
    { required: true, message: '请选择卡密类型', trigger: 'change' }
  ]
}

const extendForm = reactive({
  days: 30
})

const addCountForm = reactive({
  count: 10
})

// 表单引用
const generateFormRef = ref<FormInstance>()

// 方法
const loadCards = async () => {
  loading.value = true
  try {
    const response = await cardAPI.getCards({
      page: pagination.page,
      limit: pagination.limit,
      status: filters.status,
      card_type: filters.card_type,
      search: filters.search
    })

    if (response.data.code === 0) {
      cards.value = response.data.data.cards
      pagination.total = response.data.data.pagination.total
    } else {
      ElMessage.error(response.data.message || '加载卡密列表失败')
    }
  } catch (error: any) {
    console.error('加载卡密列表失败:', error)
    ElMessage.error(error.response?.data?.message || '加载卡密列表失败')
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection: Card[]) => {
  selectedCards.value = selection
}

const copyCardKey = async (cardKey: string) => {
  try {
    await navigator.clipboard.writeText(cardKey)
    ElMessage.success('卡密已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const deleteCard = async (card: Card) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除卡密 "${card.card_key}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await cardAPI.deleteCard(card.id)
    ElMessage.success('删除成功')
    loadCards()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

const batchDelete = async () => {
  if (selectedCards.value.length === 0) {
    ElMessage.warning('请先选择要删除的卡密')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCards.value.length} 个卡密吗？此操作不可恢复！`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await cardAPI.batchDelete(selectedCards.value.map(card => card.id))
    ElMessage.success('批量删除成功')
    selectedCards.value = []
    loadCards()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '批量删除失败')
    }
  }
}

const disableCard = async (card: Card) => {
  try {
    await ElMessageBox.confirm(
      `确定要停用卡密 "${card.card_key}" 吗？`,
      '确认停用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await cardAPI.disableCard(card.id)
    ElMessage.success('卡密停用成功')
    loadCards()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '停用失败')
    }
  }
}

const enableCard = async (card: Card) => {
  try {
    await ElMessageBox.confirm(
      `确定要启用卡密 "${card.card_key}" 吗？`,
      '确认启用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      }
    )

    await cardAPI.enableCard(card.id)
    ElMessage.success('卡密启用成功')
    loadCards()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '启用失败')
    }
  }
}

const unbindDevice = async (card: Card) => {
  try {
    await ElMessageBox.confirm(
      `确定要解绑卡密 "${card.card_key}" 的设备吗？`,
      '确认解绑',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await cardAPI.unbindDevice(card.id)
    ElMessage.success('设备解绑成功')
    loadCards()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '解绑失败')
    }
  }
}

const generateCards = async () => {
  if (!generateFormRef.value) return

  try {
    await generateFormRef.value.validate()

    generating.value = true

    const response = await cardAPI.generate({
      count: generateForm.count,
      card_type: generateForm.card_type as 'time' | 'count',
      duration: generateForm.card_type === 'time' ? generateForm.duration : undefined,
      total_count: generateForm.card_type === 'count' ? generateForm.total_count : undefined,
      allow_reverify: generateForm.allow_reverify
    })

    if (response.data.code === 0) {
      ElMessage.success(`成功生成 ${generateForm.count} 个卡密`)
      showGenerateDialog.value = false
      loadCards()
    } else {
      ElMessage.error(response.data.message || '生成失败')
    }
  } catch (error: any) {
    console.error('生成失败:', error)
    ElMessage.error(error.response?.data?.message || '生成失败')
  } finally {
    generating.value = false
  }
}

const exportCards = async () => {
  try {
    // 检查是否有选中的数据
    if (selectedCards.value.length === 0) {
      ElMessage.warning('请选择要导出的数据')
      return
    }

    ElMessage.info('正在导出Excel文件，请稍候...')

    const exportCards: Card[] = selectedCards.value

    if (exportCards.length === 0) {
      ElMessage.warning('没有卡密数据可导出')
      return
    }

    // 转换为Excel数据格式
    const excelData = exportCards.map(card => ({
      'ID': card.id,
      '卡密': card.card_key,
      '状态': getStatusText(card.status),
      '类型': card.card_type === 'time' ? '时间卡密' : '次数卡密',
      '有效期/次数': card.card_type === 'time'
        ? `${card.duration}天`
        : `${card.remaining_count}/${card.total_count}次`,
      '绑定设备': card.device_id || '未绑定',
      '使用时间': card.use_time ? formatDate(card.use_time) : '未使用',
      '到期时间': card.expire_time ? formatDate(card.expire_time) : '未设置',
      '允许重复验证': card.allow_reverify ? '是' : '否',
      '创建时间': formatDate(card.create_time)
    }))

    // 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // 设置列宽
    const colWidths = [
      { wch: 8 },  // ID
      { wch: 25 }, // 卡密
      { wch: 8 },  // 状态
      { wch: 10 }, // 类型
      { wch: 15 }, // 有效期/次数
      { wch: 20 }, // 绑定设备
      { wch: 18 }, // 使用时间
      { wch: 18 }, // 到期时间
      { wch: 12 }, // 允许重复验证
      { wch: 18 }  // 创建时间
    ]
    worksheet['!cols'] = colWidths

    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '卡密数据')

    // 生成文件名
    const dateStr = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')
    const fileName = `卡密数据_${dateStr}.xlsx`

    // 保存文件
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, fileName)

    ElMessage.success(`成功导出 ${exportCards.length} 条卡密数据`)

  } catch (error: any) {
    console.error('导出Excel失败:', error)
    ElMessage.error(error.response?.data?.message || '导出Excel失败')
  }
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  loadCards()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadCards()
}

const getStatusTagType = (status: number) => {
  switch (status) {
    case 0: return 'success'
    case 1: return 'info'
    case 2: return 'danger'
    default: return ''
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '未使用'
    case 1: return '已使用'
    case 2: return '已停用'
    default: return '未知'
  }
}

const extendCard = async () => {
  if (!currentCard.value) return

  extending.value = true
  try {
    await cardAPI.extendCard(currentCard.value.id, extendForm.days)
    ElMessage.success(`卡密续期成功，延长了 ${extendForm.days} 天`)
    showExtendDialog.value = false
    loadCards()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '续期失败')
  } finally {
    extending.value = false
  }
}

const addCardCount = async () => {
  if (!currentCard.value) return

  addingCount.value = true
  try {
    await cardAPI.addCardCount(currentCard.value.id, addCountForm.count)
    ElMessage.success(`卡密次数增加成功，增加了 ${addCountForm.count} 次`)
    showAddCountDialog.value = false
    loadCards()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '增加次数失败')
  } finally {
    addingCount.value = false
  }
}

const openExtendDialog = (card: any) => {
  currentCard.value = card
  extendForm.days = 30
  showExtendDialog.value = true
}

const openAddCountDialog = (card: any) => {
  currentCard.value = card
  addCountForm.count = 10
  showAddCountDialog.value = true
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const maskDeviceId = (deviceId: string) => {
  if (!deviceId || deviceId.length <= 10) {
    return deviceId
  }
  return deviceId.substring(0, 6) + '...' + deviceId.substring(deviceId.length - 4)
}

const calculateRemainingDays = (expireTimeStr: string) => {
  const expireTime = new Date(expireTimeStr)
  const now = new Date()
  const diffTime = expireTime.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return '已过期'
  } else if (diffDays === 0) {
    return '今日到期'
  } else {
    return diffDays.toString()
  }
}

// 加载系统设置
const loadSettings = async () => {
  try {
    const response = await settingsAPI.getSettings()
    if (response.data.code === 0) {
      const settings = response.data.data
      // 更新生成表单的默认值
      generateForm.count = parseInt(settings.default_generate_count || '10')
      generateForm.duration = parseInt(settings.default_card_duration || '30')
      generateForm.total_count = parseInt(settings.default_card_count || '100')
      generateForm.allow_reverify = settings.allow_reverify === 'true'
    }
  } catch (error) {
    console.error('加载系统设置失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadSettings()
  loadCards()
})
</script>

<style scoped>
.cards-admin {
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

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
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

.card-key-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-key-cell span {
  font-family: monospace;
  font-weight: 500;
}

.operation-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.dialog-content {
  margin-bottom: 20px;
}

.dialog-content p {
  margin: 10px 0;
  line-height: 1.5;
}

.unit {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

.device-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

.no-device {
  color: #C0C4CC;
}

.device-edit-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
  flex-wrap: wrap;
  flex-wrap: wrap;

