<template>
  <div class="grid gap-4" :class="gridClass">
    <div
      v-for="container in containers"
      :key="container.id"
      class="log-panel relative border border-gray-200 rounded-lg overflow-hidden flex flex-col"
    >
      <!-- 容器头部 -->
      <div class="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
        <span class="font-medium text-sm">{{ container.name }}</span>
        <a-button 
          type="text" 
          size="small" 
          danger
          @click="() => emit('close', container.id)"
        >
          <template #icon>
            <CloseOutlined />
          </template>
        </a-button>
      </div>
      <!-- 日志内容 -->
      <div 
        ref="logRefs"
        class="log-container flex-1 min-h-[200px] overflow-auto"
        :data-id="container.id"
      >
        <div v-if="container.loading" class="flex items-center justify-center h-full">
          <a-spin />
        </div>
        <pre v-else class="m-0 whitespace-pre-wrap">{{ container.content || '暂无日志内容' }}</pre>
      </div>
    </div>
  </div>

  <!-- 固定底部 footer -->
  <div class="fixed left-0 bottom-0 w-full bg-white border-t z-50 shadow px-6 py-3">
    <div class="flex items-center justify-between mb-2">
      <span class="font-semibold text-base">日志服务器列表</span>
      <div class="flex items-center gap-2">
        <a-input-number v-model:value="refreshInterval" min="1" :step="1" size="small" style="width: 100px" />
        <span class="ml-1 text-xs">刷新间隔(s)</span>
      </div>
    </div>
    <a-table
      :columns="columns"
      :data-source="serverList"
      size="small"
      rowKey="id"
      :pagination="false"
      bordered
      class="fixed-footer-table"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <a-button type="primary" size="small" @click="openLog(record)">打开</a-button>
          <a-button type="default" size="small" class="ml-2" @click="refreshLog(record)">刷新</a-button>
        </template>
      </template>
    </a-table>
  </div>

  <!-- iframe 日志预览弹窗 -->
  <a-modal v-model:visible="iframeVisible" width="80vw" :footer="null" :title="iframeTitle" @cancel="iframeVisible = false">
    <iframe
      v-if="iframeUrl"
      :src="iframeUrl"
      style="width:100%;height:70vh;border:none;"
      :key="iframeUrl"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { Spin as ASpin, Button as AButton, InputNumber as AInputNumber, Table as ATable, Modal as AModal } from 'ant-design-vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import { ref, computed } from 'vue'

interface LogContainer {
  id: string
  name: string
  url: string
  content?: string
  loading?: boolean
}

const props = defineProps<{
  containers: LogContainer[]
}>()

const emit = defineEmits(['close', 'open', 'refresh'])

const logRefs = ref<HTMLElement[]>([])

// 根据容器数量计算网格布局
const gridClass = computed(() => {
  const count = props.containers.length
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-2'
  if (count === 3) return 'grid-cols-4'
  if (count === 5) return 'grid-cols-6'
  if (count === 7) return 'grid-cols-9'
  if (count >= 12) return 'grid-cols-12'
  // 其他情况按最大等分
  if (count <= 4) return 'grid-cols-4'
  if (count <= 6) return 'grid-cols-6'
  if (count <= 9) return 'grid-cols-9'
  return 'grid-cols-12'
})

// 自动滚动到底部
function scrollToBottom(id: string) {
  const el = logRefs.value.find(ref => ref?.dataset?.id === id)
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

// 日志服务器列表
const serverList = ref([
  { id: '1', name: '服务器A', url: 'http://baidu.com' },
  { id: '2', name: '服务器B', url: 'http://baidu.com' },
  // 可扩展更多服务器
])

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '日志地址', dataIndex: 'url', key: 'url' },
  { title: '操作', dataIndex: 'action', key: 'action' },
]

const refreshInterval = ref(5) // 默认5秒

const iframeVisible = ref(false)
const iframeUrl = ref('')
const iframeTitle = ref('')

function openLog(record: any) {
  iframeUrl.value = record.url
  iframeTitle.value = record.name + ' 日志预览'
  iframeVisible.value = true
  emit('open', record)
}
function refreshLog(record: any) {
  emit('refresh', record)
}

defineExpose({
  scrollToBottom
})
</script>

<style scoped>
.log-panel {
  min-height: 300px;
  max-height: calc(50vh - 100px);
}

.log-container pre {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
}

.fixed-footer-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

:deep(.ant-table) {
  background: #f8fafc;
}
:deep(.ant-table-thead > tr > th) {
  background: #f1f5f9;
  font-weight: 600;
}
:deep(.ant-btn-primary) {
  background: #6366f1;
  border-color: #6366f1;
}
:deep(.ant-btn-primary:hover) {
  background: #4f46e5;
  border-color: #4f46e5;
}
</style>
