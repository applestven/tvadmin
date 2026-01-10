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
            <span>转译任务详情</span>
            <a-tag :color="getStatusColor(task.status)">
              {{ getStatusText(task.status) }}
            </a-tag>
          </div>
        </template>
        
        <a-descriptions :column="2">
          <a-descriptions-item label="任务ID" :span="2">
            {{ task.id }}
          </a-descriptions-item>
          <a-descriptions-item label="音视频链接" :span="2">
            <a :href="task.url" target="_blank">{{ task.url }}</a>
          </a-descriptions-item>
          <a-descriptions-item label="模型质量">
            {{ task.quality }}
          </a-descriptions-item>
          <a-descriptions-item label="语言">
            {{ task.languageArray || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="执行位置">
            {{ task.location || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="进度" v-if="task.progress !== undefined">
            <a-progress :percent="task.progress" size="small" />
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
          <a-button type="primary" @click="viewOutput">
            <template #icon><FileTextOutlined /></template>
            查看输出
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
  Progress as AProgress,
} from 'ant-design-vue'
import { ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { DvTask, DvTaskStatus } from '~/types/dv'

const route = useRoute()
const router = useRouter()
const dvApi = useDvApi()

const loading = ref(true)
const task = ref<DvTask | null>(null)

const taskId = computed(() => route.params.id as string)

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

function viewOutput() {
  if (task.value?.output) {
    window.open(task.value.output, '_blank')
  }
}

async function loadTask() {
  loading.value = true
  
  try {
    task.value = await dvApi.getTask(taskId.value)
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
