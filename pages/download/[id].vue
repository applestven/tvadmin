<template>
  <div class="task-detail">
    <div class="mb-6">
      <a-button @click="router.back()">
        <template #icon><ArrowLeftOutlined /></template>
        返回列表
      </a-button>
    </div>
    
    <a-spin :spinning="loading">
      <a-card v-if="task" :bordered="false" class="shadow-sm">
        <template #title>
          <div class="flex items-center gap-3">
            <span>任务详情</span>
            <a-tag :color="getStatusColor(task.status)">
              {{ getStatusText(task.status) }}
            </a-tag>
          </div>
        </template>
        
        <a-descriptions :column="2">
          <a-descriptions-item label="任务ID" :span="2">
            {{ task.id }}
          </a-descriptions-item>
          <a-descriptions-item label="视频链接" :span="2">
            <a :href="task.url" target="_blank">{{ task.url }}</a>
          </a-descriptions-item>
          <a-descriptions-item label="视频质量">
            {{ task.quality }}
          </a-descriptions-item>
          <a-descriptions-item label="下载策略">
            {{ task.strategy || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="执行位置">
            {{ task.location || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="输出文件">
            {{ task.outputName || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatTime(task.createdAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="开始时间">
            {{ formatTime(task.startedAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="完成时间">
            {{ formatTime(task.finishedAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="耗时">
            {{ getDuration() }}
          </a-descriptions-item>
        </a-descriptions>
        
        <a-divider v-if="task.error" />
        
        <a-alert 
          v-if="task.error"
          type="error"
          :message="task.error"
          show-icon
        />
        
        <div v-if="task.output" class="mt-4">
          <a-button type="primary" @click="downloadFile">
            <template #icon><DownloadOutlined /></template>
            下载文件
          </a-button>
        </div>
      </a-card>
      
      <a-empty v-else description="任务不存在" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import {
  Card as ACard,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Tag as ATag,
  Button as AButton,
  Spin as ASpin,
  Divider as ADivider,
  Alert as AAlert,
  Empty as AEmpty,
} from 'ant-design-vue'
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { TvTask, TvTaskStatus } from '~/types/tv'

const route = useRoute()
const router = useRouter()
const tvApi = useTvApi()

const loading = ref(true)
const task = ref<TvTask | null>(null)

const taskId = computed(() => route.params.id as string)

function getStatusColor(status: TvTaskStatus) {
  const map: Record<TvTaskStatus, string> = {
    pending: 'default',
    running: 'processing',
    success: 'success',
    failed: 'error',
  }
  return map[status] || 'default'
}

function getStatusText(status: TvTaskStatus) {
  const map: Record<TvTaskStatus, string> = {
    pending: '等待中',
    running: '下载中',
    success: '成功',
    failed: '失败',
  }
  return map[status] || status
}

function formatTime(timestamp?: number) {
  if (!timestamp) return '-'
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

function getDuration() {
  if (!task.value?.startedAt || !task.value?.finishedAt) return '-'
  const duration = task.value.finishedAt - task.value.startedAt
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分${seconds % 60}秒`
  }
  if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`
  }
  return `${seconds}秒`
}

function downloadFile() {
  if (task.value?.output) {
    window.open(task.value.output, '_blank')
  }
}

async function loadTask() {
  loading.value = true
  
  try {
    task.value = await tvApi.getTask(taskId.value)
  } catch (error) {
    console.error('加载任务详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTask()
})
</script>
