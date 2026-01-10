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
          @click="emit('close', container.id)"
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
</template>

<script setup lang="ts">
import { Spin as ASpin, Button as AButton } from 'ant-design-vue'
import { CloseOutlined } from '@ant-design/icons-vue'

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

const emit = defineEmits<{
  close: [id: string]
}>()

const logRefs = ref<HTMLElement[]>([])

// 根据容器数量计算网格布局
const gridClass = computed(() => {
  const count = props.containers.length
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-2'
  if (count <= 4) return 'grid-cols-2'
  if (count <= 6) return 'grid-cols-3'
  if (count <= 9) return 'grid-cols-3'
  return 'grid-cols-4'
})

// 自动滚动到底部
function scrollToBottom(id: string) {
  const el = logRefs.value.find(ref => ref?.dataset?.id === id)
  if (el) {
    el.scrollTop = el.scrollHeight
  }
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
</style>
