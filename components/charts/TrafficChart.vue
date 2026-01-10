<template>
  <div ref="chartRef" class="w-full" :style="{ height: height + 'px' }"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

interface ChartData {
  name: string
  value: number
}

const props = withDefaults(defineProps<{
  data: ChartData[]
  title?: string
  height?: number
  type?: 'line' | 'bar' | 'pie'
}>(), {
  height: 300,
  type: 'line'
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return
  
  // 现代配色方案
  const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
  
  const option: echarts.EChartsOption = {
    title: props.title ? {
      text: props.title,
      left: 'center',
      textStyle: { 
        fontSize: 14,
        fontWeight: 600,
        color: '#374151'
      }
    } : undefined,
    tooltip: {
      trigger: props.type === 'pie' ? 'item' : 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      },
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);'
    },
    color: colors,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: props.type !== 'pie' ? {
      type: 'category',
      data: props.data.map(d => d.name),
      axisLabel: {
        rotate: 30,
        color: '#6b7280'
      },
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      }
    } : undefined,
    yAxis: props.type !== 'pie' ? {
      type: 'value',
      axisLabel: { color: '#6b7280' },
      splitLine: {
        lineStyle: { color: '#f3f4f6' }
      }
    } : undefined,
    series: props.type === 'pie' ? [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 3
      },
      label: {
        show: true,
        formatter: '{b}: {c}',
        color: '#374151',
        fontSize: 12
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        },
        label: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      data: props.data.map((d, index) => ({
        name: d.name,
        value: d.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: colors[index % colors.length] },
            { offset: 1, color: colors[(index + 1) % colors.length] }
          ])
        }
      }))
    }] : [{
      type: props.type,
      data: props.data.map(d => d.value),
      smooth: true,
      itemStyle: {
        color: '#667eea'
      },
      areaStyle: props.type === 'line' ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(102, 126, 234, 0.4)' },
          { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
        ])
      } : undefined
    }]
  }
  
  chart.setOption(option)
}

watch(() => props.data, updateChart, { deep: true })

onMounted(() => {
  initChart()
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chart?.resize()
  })
})

onUnmounted(() => {
  chart?.dispose()
})

defineExpose({
  resize: () => chart?.resize()
})
</script>
