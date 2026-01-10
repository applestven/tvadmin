<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800 m-0">控制台</h1>
      <p class="text-gray-500 mt-1 mb-0">实时监控服务运行状态</p>
    </div>
    
    <!-- 统计卡片 -->
    <ChartsStatsCards :cards="statsCards" :loading="loading" />
    
    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <!-- 下载统计 -->
      <a-card :bordered="false">
        <template #title>
          <div class="flex items-center gap-2">
            <CloudDownloadOutlined class="text-purple-500" />
            <span>下载任务统计</span>
          </div>
        </template>
        <ChartsTrafficChart 
          :data="downloadChartData" 
          type="pie" 
          :height="280"
        />
      </a-card>
      
      <!-- 转译统计 -->
      <a-card :bordered="false">
        <template #title>
          <div class="flex items-center gap-2">
            <SwapOutlined class="text-blue-500" />
            <span>转译任务统计</span>
          </div>
        </template>
        <ChartsTrafficChart 
          :data="transcodeChartData" 
          type="pie" 
          :height="280"
        />
      </a-card>
    </div>
    
    <!-- 正在进行的任务 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <!-- 正在下载 -->
      <a-card :bordered="false">
        <template #title>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>正在下载</span>
          </div>
        </template>
        <a-empty v-if="runningDownloads.length === 0" description="暂无进行中的下载任务" />
        <div v-else class="space-y-3">
          <div 
            v-for="item in runningDownloads" 
            :key="item.id"
            class="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-all"
          >
            <div class="font-medium text-gray-800 truncate mb-2">{{ item.outputName || item.url }}</div>
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 text-blue-600 text-xs font-medium">
                <LoadingOutlined spin />
                下载中
              </span>
              <span class="text-xs text-gray-400">
                {{ formatTime(item.startedAt) }}
              </span>
            </div>
          </div>
        </div>
      </a-card>
      
      <!-- 正在转译 -->
      <a-card :bordered="false">
        <template #title>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>转译队列</span>
          </div>
        </template>
        <a-empty v-if="runningTranscodes.length === 0" description="暂无进行中的转译任务" />
        <div v-else class="space-y-3">
          <div 
            v-for="item in runningTranscodes" 
            :key="item.id"
            class="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 hover:shadow-md transition-all"
          >
            <div class="font-medium text-gray-800 truncate mb-2">{{ item.url }}</div>
            <div class="flex items-center gap-3">
              <span 
                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                :class="item.status === 'running' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-orange-100 text-orange-600'"
              >
                <SyncOutlined :spin="item.status === 'running'" />
                {{ item.status === 'running' ? '转译中' : '队列中' }}
              </span>
              <span class="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs">
                {{ item.quality }}
              </span>
            </div>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Card as ACard, 
  Empty as AEmpty,
} from 'ant-design-vue'
import { 
  CloudDownloadOutlined,
  SwapOutlined,
  SyncOutlined, 
  LoadingOutlined,
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { TvStats, TvTask } from '~/types/tv'
import type { DvStats, DvTask } from '~/types/dv'

const tvApi = useTvApi()
const dvApi = useDvApi()

const loading = ref(true)
const tvStats = ref<TvStats>({
  totalTasks: 0,
  successTasks: 0,
  failedTasks: 0,
  runningTasks: 0,
  pendingTasks: 0,
})
const dvStats = ref<DvStats>({
  totalTasks: 0,
  successTasks: 0,
  failedTasks: 0,
  runningTasks: 0,
  queuedTasks: 0,
  pendingTasks: 0,
})
const runningDownloads = ref<TvTask[]>([])
const runningTranscodes = ref<DvTask[]>([])

// 统计卡片数据
const statsCards = computed(() => [
  {
    title: '下载任务总数',
    value: tvStats.value.totalTasks,
    icon: CloudDownloadOutlined,
    class: 'stat-card-primary',
    subLabel: '成功/失败',
    subValue: `${tvStats.value.successTasks}/${tvStats.value.failedTasks}`,
  },
  {
    title: '转译任务总数',
    value: dvStats.value.totalTasks,
    icon: SwapOutlined,
    class: 'stat-card-info',
    subLabel: '成功/失败',
    subValue: `${dvStats.value.successTasks}/${dvStats.value.failedTasks}`,
  },
  {
    title: '正在下载',
    value: tvStats.value.runningTasks + tvStats.value.pendingTasks,
    icon: LoadingOutlined,
    class: 'stat-card-success',
    subLabel: '运行中/等待中',
    subValue: `${tvStats.value.runningTasks}/${tvStats.value.pendingTasks}`,
  },
  {
    title: '正在转译',
    value: dvStats.value.runningTasks + dvStats.value.queuedTasks,
    icon: SyncOutlined,
    class: 'stat-card-warning',
    subLabel: '运行中/队列中',
    subValue: `${dvStats.value.runningTasks}/${dvStats.value.queuedTasks}`,
  },
])

// 下载统计图表数据
const downloadChartData = computed(() => [
  { name: '成功', value: tvStats.value.successTasks },
  { name: '失败', value: tvStats.value.failedTasks },
  { name: '进行中', value: tvStats.value.runningTasks },
  { name: '等待中', value: tvStats.value.pendingTasks },
])

// 转译统计图表数据
const transcodeChartData = computed(() => [
  { name: '成功', value: dvStats.value.successTasks },
  { name: '失败', value: dvStats.value.failedTasks },
  { name: '进行中', value: dvStats.value.runningTasks },
  { name: '队列中', value: dvStats.value.queuedTasks },
])

// 格式化时间
function formatTime(timestamp?: number) {
  if (!timestamp) return '-'
  return dayjs(timestamp).format('MM-DD HH:mm')
}

// 加载数据
async function loadData() {
  loading.value = true
  
  try {
    const [tvStatsData, dvStatsData, runningRes] = await Promise.all([
      tvApi.getStats(),
      dvApi.getStats(),
      tvApi.getRunningTasks().catch(() => ({ runningTasks: [] })),
    ])
    
    tvStats.value = tvStatsData
    dvStats.value = dvStatsData
    runningDownloads.value = runningRes.runningTasks || []
    
    // 获取正在转译的任务
    try {
      const dvTasks = await dvApi.getTasks({ 
        status: 'running',
        pageSize: 10 
      })
      runningTranscodes.value = dvTasks?.data || []
      
      // 也获取队列中的任务
      const queuedTasks = await dvApi.getTasks({ 
        status: 'queued',
        pageSize: 10 
      })
      if (queuedTasks?.data) {
        runningTranscodes.value = [...runningTranscodes.value, ...queuedTasks.data]
      }
    } catch (e) {
      console.error('获取转译任务失败', e)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 定时刷新
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  loadData()
  timer = setInterval(loadData, 30000) // 每30秒刷新
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
