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
  // tvStats 实际是下载任务统计 (DV 服务)
  // dvStats 实际是转译任务统计 (TV 服务)
  const [downloadStats, setDownloadStats] = useState<TvTaskStats | null>(null)
  const [transcodeStats, setTranscodeStats] = useState<DvTaskStats | null>(null)
  const [recentDownloadTasks, setRecentDownloadTasks] = useState<TvTask[]>([])
  const [recentTranscodeTasks, setRecentTranscodeTasks] = useState<DvTask[]>([])
  const [loading, setLoading] = useState(true)

  const downloadApi = useTvApi()  // DV 服务 - 下载
  const transcodeApi = useDvApi() // TV 服务 - 转译

  const fetchData = async () => {
    setLoading(true)
    try {
      // 获取下载任务 (DV)
      const downloadTasksResponse = await downloadApi.getTasks({ page: 1, limit: 5 })
      if (downloadTasksResponse?.data) {
        setRecentDownloadTasks(downloadTasksResponse.data)
      }

      // 获取转译任务 (TV)
      const transcodeTasksResponse = await transcodeApi.getTasks({ page: 1, pageSize: 5 })
      if (transcodeTasksResponse?.data) {
        setRecentTranscodeTasks(transcodeTasksResponse.data)
      }

      // 获取下载统计 (DV /stats)
      const downloadStatsData = await downloadApi.getStats()
      setDownloadStats(downloadStatsData)

      // 获取转译统计 (TV /tts/stats)
      const transcodeStatsData = await transcodeApi.getStats()
      setTranscodeStats(transcodeStatsData)
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
      <StatsCards tvStats={downloadStats} dvStats={transcodeStats} loading={loading} />

      {/* 图表区域 */}
      <div className="grid gap-6 md:grid-cols-2">
        <TrafficChart tvStats={downloadStats} dvStats={transcodeStats} title="下载任务分布" type="tv" />
        <TrafficChart tvStats={downloadStats} dvStats={transcodeStats} title="转译任务分布" type="dv" />
      </div>

      {/* 最近任务 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 下载任务 */}
        <Card>
          <CardHeader>
            <CardTitle>最近下载任务</CardTitle>
            <CardDescription>DV 视频下载服务最新任务</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : recentDownloadTasks.length > 0 ? (
              <div className="space-y-3">
                {recentDownloadTasks.map((task) => (
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

        {/* 转译任务 */}
        <Card>
          <CardHeader>
            <CardTitle>最近转译任务</CardTitle>
            <CardDescription>TV 语音转文字服务最新任务</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : recentTranscodeTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTranscodeTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{task.url}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.createdAt ? formatDate(task.createdAt) : (task.created_at ? formatDate(parseInt(task.created_at)) : '-')}
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
