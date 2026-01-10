<template>
  <div class="download-management">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 m-0">下载管理</h1>
        <p class="text-gray-500 mt-1 mb-0">管理视频下载任务</p>
      </div>
      <a-button type="primary" class="!rounded-xl !h-10 !px-6" @click="showCreateModal = true">
        <template #icon><PlusOutlined /></template>
        新建下载
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
            <a-select-option value="running">下载中</a-select-option>
            <a-select-option value="success">成功</a-select-option>
            <a-select-option value="failed">失败</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="质量">
          <a-select 
            v-model:value="filters.quality" 
            placeholder="全部质量"
            style="width: 140px"
            allowClear
          >
            <a-select-option value="video_best">最佳视频</a-select-option>
            <a-select-option value="audio_best">最佳音频</a-select-option>
            <a-select-option value="video_worst">最低视频</a-select-option>
            <a-select-option value="audio_worst">最低音频</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="时间范围">
          <a-range-picker 
            v-model:value="dateRange"
            style="width: 260px"
          />
        </a-form-item>
        
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch" class="!rounded-lg">
              <template #icon><SearchOutlined /></template>
              搜索
            </a-button>
            <a-button @click="handleReset" class="!rounded-lg">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
    
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
                  'status-dot-running': record.status === 'running',
                  'status-dot-success': record.status === 'success',
                  'status-dot-failed': record.status === 'failed',
                }"
              />
              <span class="text-gray-700">{{ getStatusText(record.status) }}</span>
            </div>
          </template>
          
          <template v-else-if="column.key === 'quality'">
            <span class="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600">
              {{ record.quality }}
            </span>
          </template>
          
          <template v-else-if="column.key === 'createdAt'">
            <span class="text-gray-500">{{ formatTime(record.createdAt) }}</span>
          </template>
          
          <template v-else-if="column.key === 'finishedAt'">
            <span class="text-gray-500">{{ formatTime(record.finishedAt) }}</span>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)">
                详情
              </a-button>
              <a-button 
                v-if="record.output" 
                type="link" 
                size="small"
                @click="downloadFile(record)"
              >
                下载
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 新建下载弹窗 -->
    <a-modal
      v-model:open="showCreateModal"
      title="新建下载任务"
      @ok="handleCreate"
      :confirm-loading="creating"
    >
      <a-form :model="createForm" :label-col="{ span: 6 }">
        <a-form-item label="视频链接" required>
          <a-input 
            v-model:value="createForm.url" 
            placeholder="请输入视频链接"
          />
        </a-form-item>
        <a-form-item label="视频质量">
          <a-select v-model:value="createForm.quality">
            <a-select-option value="video_best">最佳视频</a-select-option>
            <a-select-option value="audio_best">最佳音频</a-select-option>
            <a-select-option value="video_worst">最低视频</a-select-option>
            <a-select-option value="audio_worst">最低音频</a-select-option>
          </a-select>
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
        <a-descriptions-item label="视频链接">{{ currentTask.url }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentTask.status)">
            {{ getStatusText(currentTask.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="质量">{{ currentTask.quality }}</a-descriptions-item>
        <a-descriptions-item label="策略">{{ currentTask.strategy || '-' }}</a-descriptions-item>
        <a-descriptions-item label="输出文件">{{ currentTask.outputName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatTime(currentTask.createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ formatTime(currentTask.startedAt) }}</a-descriptions-item>
        <a-descriptions-item label="完成时间">{{ formatTime(currentTask.finishedAt) }}</a-descriptions-item>
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
  RangePicker as ARangePicker,
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
  message,
} from 'ant-design-vue'
import {
  PlusOutlined,
  SearchOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue'
import dayjs, { Dayjs } from 'dayjs'
import type { TvTask, TvTaskStatus, VideoQuality, TvTaskQueryFilters } from '~/types/tv'

const tvApi = useTvApi()

// 状态
const loading = ref(false)
const tasks = ref<TvTask[]>([])
const showCreateModal = ref(false)
const showDetail = ref(false)
const creating = ref(false)
const currentTask = ref<TvTask | null>(null)

// 筛选条件
const filters = ref<{
  status?: TvTaskStatus
  quality?: VideoQuality
}>({})
const dateRange = ref<[Dayjs, Dayjs] | undefined>(undefined)

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
  quality: 'video_best' as VideoQuality,
})

// 表格列
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 120, ellipsis: true },
  { title: '视频链接', dataIndex: 'url', key: 'url', width: 200 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '质量', dataIndex: 'quality', key: 'quality', width: 100 },
  { title: '输出文件', dataIndex: 'outputName', key: 'outputName', width: 150, ellipsis: true },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 150 },
  { title: '完成时间', dataIndex: 'finishedAt', key: 'finishedAt', width: 150 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' as const },
]

// 状态颜色
function getStatusColor(status: TvTaskStatus) {
  const map: Record<TvTaskStatus, string> = {
    pending: 'default',
    running: 'processing',
    success: 'success',
    failed: 'error',
  }
  return map[status] || 'default'
}

// 状态文字
function getStatusText(status: TvTaskStatus) {
  const map: Record<TvTaskStatus, string> = {
    pending: '等待中',
    running: '下载中',
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

// 加载任务列表
async function loadTasks() {
  loading.value = true
  
  try {
    const queryFilters: TvTaskQueryFilters = {}
    
    if (filters.value.status) {
      queryFilters.status = filters.value.status
    }
    if (filters.value.quality) {
      queryFilters.quality = filters.value.quality
    }
    if (dateRange.value) {
      queryFilters.createdAt = {
        min: dateRange.value[0].startOf('day').valueOf(),
        max: dateRange.value[1].endOf('day').valueOf(),
      }
    }
    
    const res = await tvApi.queryTasks({
      filters: queryFilters,
      page: pagination.value.current,
      limit: pagination.value.pageSize,
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
  dateRange.value = undefined
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
function viewDetail(task: TvTask) {
  currentTask.value = task
  showDetail.value = true
}

// 下载文件
function downloadFile(task: TvTask) {
  if (task.output) {
    window.open(task.output, '_blank')
  }
}

// 创建任务
async function handleCreate() {
  if (!createForm.value.url) {
    message.warning('请输入视频链接')
    return
  }
  
  creating.value = true
  
  try {
    await tvApi.submitDownload({
      url: createForm.value.url,
      quality: createForm.value.quality,
    })
    
    message.success('任务创建成功')
    showCreateModal.value = false
    createForm.value = { url: '', quality: 'video_best' }
    loadTasks()
  } catch (error) {
    console.error('创建任务失败:', error)
    message.error('创建任务失败')
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  loadTasks()
})
</script>
