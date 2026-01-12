'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileAudio, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import type { TvTaskStats, DvTaskStats } from '@/types'

interface StatsCardsProps {
  tvStats: TvTaskStats | null
  dvStats: DvTaskStats | null
  loading?: boolean
}

export function StatsCards({ tvStats, dvStats, loading }: StatsCardsProps) {
  const cards = [
    {
      title: 'TV 下载任务',
      value: tvStats?.total ?? 0,
      description: '总任务数',
      icon: Download,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'DV 转译任务',
      value: dvStats?.total ?? 0,
      description: '总任务数',
      icon: FileAudio,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: '运行中',
      value: (tvStats?.running ?? 0) + (dvStats?.running ?? 0),
      description: '当前正在处理',
      icon: Loader2,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: '等待中',
      value: (tvStats?.pending ?? 0) + (dvStats?.pending ?? 0) + (dvStats?.queued ?? 0),
      description: '队列中等待',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: '已完成',
      value: (tvStats?.success ?? 0) + (dvStats?.success ?? 0),
      description: '成功完成',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '失败',
      value: (tvStats?.failed ?? 0) + (dvStats?.failed ?? 0),
      description: '执行失败',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted mb-1" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`rounded-lg p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
