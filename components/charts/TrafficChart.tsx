'use client'

import { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TvTaskStats, DvTaskStats } from '@/types'

// 注册必要的 ECharts 组件
echarts.use([PieChart, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer])

interface TrafficChartProps {
  tvStats: TvTaskStats | null
  dvStats: DvTaskStats | null
  title: string
  type: 'tv' | 'dv'
}

export function TrafficChart({ tvStats, dvStats, title, type }: TrafficChartProps) {
  const stats = type === 'tv' ? tvStats : dvStats

  const option = useMemo(() => {
    if (!stats) {
      return {
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14,
          },
        },
      }
    }

    const data = [
      { value: stats.pending, name: '等待中', itemStyle: { color: '#f59e0b' } },
      { value: stats.running, name: '运行中', itemStyle: { color: '#3b82f6' } },
      { value: stats.success, name: '成功', itemStyle: { color: '#22c55e' } },
      { value: stats.failed, name: '失败', itemStyle: { color: '#ef4444' } },
    ]

    // 添加 DV 特有的 queued 状态
    if (type === 'dv' && dvStats) {
      data.splice(1, 0, {
        value: dvStats.queued,
        name: '排队中',
        itemStyle: { color: '#8b5cf6' },
      })
    }

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: data.map((item) => item.name),
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.filter((item) => item.value > 0),
        },
      ],
    }
  }, [stats, type, dvStats, title])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{ height: '300px', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </CardContent>
    </Card>
  )
}
