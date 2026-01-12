'use client'

import { useEffect, useState } from 'react'
import { StatsCards } from '@/components/charts/StatsCards'
import { TrafficChart } from '@/components/charts/TrafficChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTvApi, useDvApi } from '@/hooks'
import { getStatusColor, getStatusText, formatDate } from '@/lib/utils'
import type { TvTask, DvTask, TvTaskStats, DvTaskStats } from '@/types'

export default function DashboardPage() {
  const [tvStats, setTvStats] = useState<TvTaskStats | null>(null)
  const [dvStats, setDvStats] = useState<DvTaskStats | null>(null)
  const [recentTvTasks, setRecentTvTasks] = useState<TvTask[]>([])
  const [recentDvTasks, setRecentDvTasks] = useState<DvTask[]>([])
  const [loading, setLoading] = useState(true)

  const tvApi = useTvApi()
  const dvApi = useDvApi()

  const fetchData = async () => {
    setLoading(true)
    try {
      // 获取 TV 任务
      const tvTasksResponse = await tvApi.getTasks({ page: 1, limit: 5 })
      if (tvTasksResponse?.data) {
        setRecentTvTasks(tvTasksResponse.data)
      }

      // 获取 DV 任务
      const dvTasksResponse = await dvApi.getTasks({ page: 1, pageSize: 5 })
      if (dvTasksResponse?.data) {
        setRecentDvTasks(dvTasksResponse.data)
      }

      // 获取统计
      const tvStatsData = await tvApi.getStats()
      setTvStats(tvStatsData)

      const dvStatsData = await dvApi.getStats()
      setDvStats(dvStatsData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // 30秒自动刷新
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">仪表盘</h2>
        <p className="text-muted-foreground">
          系统运行状态概览
        </p>
      </div>

      {/* 统计卡片 */}
      <StatsCards tvStats={tvStats} dvStats={dvStats} loading={loading} />

      {/* 图表区域 */}
      <div className="grid gap-6 md:grid-cols-2">
        <TrafficChart tvStats={tvStats} dvStats={dvStats} title="TV 任务分布" type="tv" />
        <TrafficChart tvStats={tvStats} dvStats={dvStats} title="DV 任务分布" type="dv" />
      </div>

      {/* 最近任务 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* TV 任务 */}
        <Card>
          <CardHeader>
            <CardTitle>最近下载任务</CardTitle>
            <CardDescription>TV 视频下载服务最新任务</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : recentTvTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTvTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{task.url}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.createdAt ? formatDate(task.createdAt) : '-'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">暂无任务</p>
            )}
          </CardContent>
        </Card>

        {/* DV 任务 */}
        <Card>
          <CardHeader>
            <CardTitle>最近转译任务</CardTitle>
            <CardDescription>DV 语音转文字服务最新任务</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : recentDvTasks.length > 0 ? (
              <div className="space-y-3">
                {recentDvTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{task.url}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.createdAt ? formatDate(task.createdAt) : '-'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">暂无任务</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
