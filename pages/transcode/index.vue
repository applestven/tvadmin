<template>
  <div class="transcode-management">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 m-0">转译管理</h1>
        <p class="text-gray-500 mt-1 mb-0">管理语音转文字任务</p>
      </div>
      <a-button type="primary" class="!rounded-xl !h-10 !px-6" @click="showCreateModal = true">
        <template #icon><PlusOutlined /></template>
        新建转译
      </a-button>
    </div>
    
    <!-- 搜索筛选 -->
    <a-card :bordered="false" class="mb-6 filter-card">
      <a-form layout="inline" :model="filters" class="flex flex-wrap gap-4">
        <a-form-item label="状态">
          <a-select 
            v-model:value="filters.status" 
            placeholder="全部状态"
            style="width: 140px"
            allowClear
          >
            <a-select-option value="pending">等待中</a-select-option>
            <a-select-option value="queued">队列中</a-select-option>
            <a-select-option value="running">转译中</a-select-option>
            <a-select-option value="success">成功</a-select-option>
            <a-select-option value="failed">失败</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="模型质量">
          <a-select 
            v-model:value="filters.quality" 
            placeholder="全部质量"
            style="width: 140px"
            allowClear
          >
            <a-select-option value="tiny">tiny</a-select-option>
            <a-select-option value="base">base</a-select-option>
            <a-select-option value="small">small</a-select-option>
            <a-select-option value="medium">medium</a-select-option>
            <a-select-option value="large">large</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch" class="!rounded-lg">
              <template #icon><SearchOutlined /></template>
              搜索
            </a-button>
            <a-button @click="handleReset" class="!rounded-lg">重置</a-button>
            <a-button @click="handleCleanup" :loading="cleaning" class="!rounded-lg">
              <template #icon><ClearOutlined /></template>
              清理旧任务
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
    
    <!-- 队列状态 -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div class="stat-mini-card bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 text-center">
        <div class="text-3xl font-bold text-gray-600 mb-1">{{ queueStatus.pending }}</div>
        <div class="text-sm text-gray-500">等待中</div>
      </div>
      <div class="stat-mini-card bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 text-center">
        <div class="text-3xl font-bold text-orange-500 mb-1">{{ queueStatus.queued }}</div>
        <div class="text-sm text-gray-500">队列中</div>
      </div>
      <div class="stat-mini-card bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center">
        <div class="text-3xl font-bold text-blue-500 mb-1">{{ queueStatus.running }}</div>
        <div class="text-sm text-gray-500">运行中</div>
      </div>
      <div class="stat-mini-card bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
        <div class="text-3xl font-bold text-green-500 mb-1">{{ queueStatus.completed }}</div>
        <div class="text-sm text-gray-500">已完成</div>
      </div>
      <div class="stat-mini-card bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 text-center">
        <div class="text-3xl font-bold text-red-500 mb-1">{{ queueStatus.failed }}</div>
        <div class="text-sm text-gray-500">失败</div>
      </div>
    </div>
    
    <!-- 任务列表 -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="tasks"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1200 }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'url'">
            <a-tooltip :title="record.url">
              <span class="block max-w-[200px] truncate text-gray-600">{{ record.url }}</span>
            </a-tooltip>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <div class="flex items-center gap-2">
              <span 
                class="status-dot"
                :class="{
                  'status-dot-pending': record.status === 'pending',
                  'status-dot-queued': record.status === 'queued',
                  'status-dot-running': record.status === 'running',
                  'status-dot-success': record.status === 'success',
                  'status-dot-failed': record.status === 'failed',
                }"
              />
              <span class="text-gray-700">{{ getStatusText(record.status) }}</span>
            </div>
          </template>
          
          <template v-else-if="column.key === 'quality'">
            <span class="px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600">
              {{ record.quality }}
            </span>
          </template>
          
          <template v-else-if="column.key === 'createdAt'">
            <span class="text-gray-500">{{ formatTime(record.createdAt) }}</span>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)">
                详情
              </a-button>
              <a-popconfirm
                v-if="['pending', 'queued', 'running'].includes(record.status)"
                title="确定要取消此任务吗？"
                @confirm="handleCancel(record.id)"
              >
                <a-button type="link" size="small" danger>
                  取消
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 新建转译弹窗 -->
    <a-modal
      v-model:open="showCreateModal"
      title="新建转译任务"
      @ok="handleCreate"
      :confirm-loading="creating"
    >
      <a-form :model="createForm" :label-col="{ span: 6 }">
        <a-form-item label="音视频链接" required>
          <a-input 
            v-model:value="createForm.url" 
            placeholder="请输入音视频文件链接"
          />
        </a-form-item>
        <a-form-item label="模型质量">
          <a-select v-model:value="createForm.quality">
            <a-select-option value="tiny">tiny (最快)</a-select-option>
            <a-select-option value="base">base</a-select-option>
            <a-select-option value="small">small</a-select-option>
            <a-select-option value="medium">medium (推荐)</a-select-option>
            <a-select-option value="large">large (最准确)</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="目标语言">
          <a-input 
            v-model:value="createForm.languageArray" 
            placeholder="如: zh, en"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 详情抽屉 -->
    <a-drawer
      v-model:open="showDetail"
      title="任务详情"
      width="500"
    >
      <a-descriptions :column="1" v-if="currentTask">
        <a-descriptions-item label="任务ID">{{ currentTask.id }}</a-descriptions-item>
        <a-descriptions-item label="音视频链接">{{ currentTask.url }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentTask.status)">
            {{ getStatusText(currentTask.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="模型质量">{{ currentTask.quality }}</a-descriptions-item>
        <a-descriptions-item label="语言">{{ currentTask.languageArray || '-' }}</a-descriptions-item>
        <a-descriptions-item label="位置">{{ currentTask.location || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatTime(currentTask.createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ formatTime(currentTask.startedAt) }}</a-descriptions-item>
        <a-descriptions-item label="完成时间">{{ formatTime(currentTask.finishedAt) }}</a-descriptions-item>
        <a-descriptions-item label="输出文件" v-if="currentTask.output">
          {{ currentTask.output }}
        </a-descriptions-item>
        <a-descriptions-item label="错误信息" v-if="currentTask.error">
          <span class="text-red-500">{{ currentTask.error }}</span>
        </a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import {
  Card as ACard,
  Form as AForm,
  FormItem as AFormItem,
  Select as ASelect,
  SelectOption as ASelectOption,
  Button as AButton,
  Space as ASpace,
  Table as ATable,
  Tag as ATag,
  Tooltip as ATooltip,
  Modal as AModal,
  Input as AInput,
  Drawer as ADrawer,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Statistic as AStatistic,
  Popconfirm as APopconfirm,
  message,
} from 'ant-design-vue'
import {
  PlusOutlined,
  SearchOutlined,
  ClearOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { DvTask, DvTaskStatus, ModelQuality, QueueStatus } from '~/types/dv'

const dvApi = useDvApi()

// 状态
const loading = ref(false)
const cleaning = ref(false)
const tasks = ref<DvTask[]>([])
const showCreateModal = ref(false)
const showDetail = ref(false)
const creating = ref(false)
const currentTask = ref<DvTask | null>(null)
const queueStatus = ref<QueueStatus>({
  pending: 0,
  queued: 0,
  running: 0,
  completed: 0,
  failed: 0,
})

// 筛选条件
const filters = ref<{
  status?: DvTaskStatus
  quality?: ModelQuality
}>({})

// 分页
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
})

// 创建表单
const createForm = ref({
  url: '',
  quality: 'medium' as ModelQuality,
  languageArray: 'zh',
})

// 表格列
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 120, ellipsis: true },
  { title: '音视频链接', dataIndex: 'url', key: 'url', width: 200 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '模型', dataIndex: 'quality', key: 'quality', width: 100 },
  { title: '语言', dataIndex: 'languageArray', key: 'languageArray', width: 80 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 150 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' as const },
]

// 状态颜色
function getStatusColor(status: DvTaskStatus) {
  const map: Record<DvTaskStatus, string> = {
    pending: 'default',
    queued: 'orange',
    running: 'processing',
    success: 'success',
    failed: 'error',
  }
  return map[status] || 'default'
}

// 状态文字
function getStatusText(status: DvTaskStatus) {
  const map: Record<DvTaskStatus, string> = {
    pending: '等待中',
    queued: '队列中',
    running: '转译中',
    success: '成功',
    failed: '失败',
  }
  return map[status] || status
}

// 格式化时间
function formatTime(timestamp?: number) {
  if (!timestamp) return '-'
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// 加载队列状态
async function loadQueueStatus() {
  try {
    const status = await dvApi.getQueueStatus()
    queueStatus.value = status || queueStatus.value
  } catch (error) {
    console.error('获取队列状态失败:', error)
  }
}

// 加载任务列表
async function loadTasks() {
  loading.value = true
  
  try {
    const res = await dvApi.getTasks({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ...filters.value,
    })
    
    tasks.value = res?.data || []
    pagination.value.total = (res as any)?.total || tasks.value.length
  } catch (error) {
    console.error('加载任务失败:', error)
    message.error('加载任务失败')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  pagination.value.current = 1
  loadTasks()
}

// 重置
function handleReset() {
  filters.value = {}
  pagination.value.current = 1
  loadTasks()
}

// 表格变化
function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadTasks()
}

// 查看详情
function viewDetail(task: DvTask) {
  currentTask.value = task
  showDetail.value = true
}

// 取消任务
async function handleCancel(id: string) {
  try {
    await dvApi.cancelTask(id)
    message.success('任务已取消')
    loadTasks()
    loadQueueStatus()
  } catch (error) {
    console.error('取消任务失败:', error)
    message.error('取消任务失败')
  }
}

// 清理旧任务
async function handleCleanup() {
  cleaning.value = true
  try {
    await dvApi.cleanup()
    message.success('清理成功')
    loadTasks()
    loadQueueStatus()
  } catch (error) {
    console.error('清理失败:', error)
    message.error('清理失败')
  } finally {
    cleaning.value = false
  }
}

// 创建任务
async function handleCreate() {
  if (!createForm.value.url) {
    message.warning('请输入音视频链接')
    return
  }
  
  creating.value = true
  
  try {
    await dvApi.createTask({
      url: createForm.value.url,
      quality: createForm.value.quality,
      languageArray: createForm.value.languageArray,
    })
    
    message.success('任务创建成功')
    showCreateModal.value = false
    createForm.value = { url: '', quality: 'medium', languageArray: 'zh' }
    loadTasks()
    loadQueueStatus()
  } catch (error) {
    console.error('创建任务失败:', error)
    message.error('创建任务失败')
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  loadTasks()
  loadQueueStatus()
})
</script>
