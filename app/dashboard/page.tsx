'use client'

import { useEffect, useState, useRef } from 'react'
import { StatsCards } from '@/components/charts/StatsCards'
import { TrafficChart } from '@/components/charts/TrafficChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTvApi, useDvApi } from '@/hooks'
import { getStatusColor, getStatusText, formatDate } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'
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

  // 使用 ref 保存 API 引用，避免依赖变化导致的无限循环
  const downloadApiRef = useRef(downloadApi)
  const transcodeApiRef = useRef(transcodeApi)
  downloadApiRef.current = downloadApi
  transcodeApiRef.current = transcodeApi

  const fetchData = async () => {
    setLoading(true)
    try {
      // 并行获取所有数据
      const [downloadTasksResponse, transcodeTasksResponse, downloadStatsData, transcodeStatsData] = await Promise.all([
        downloadApiRef.current.getTasks({ page: 1, limit: 5 }),
        transcodeApiRef.current.getTasks({ page: 1, pageSize: 5 }),
        downloadApiRef.current.getStats(),
        transcodeApiRef.current.getStats(),
      ])

      // 设置下载任务
      if (downloadTasksResponse?.data) {
        setRecentDownloadTasks(downloadTasksResponse.data)
      }

      // 设置转译任务
      if (transcodeTasksResponse?.data) {
        setRecentTranscodeTasks(transcodeTasksResponse.data)
      }

      // 设置统计数据
      setDownloadStats(downloadStatsData)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">仪表盘</h2>
          <p className="text-muted-foreground">
            系统运行状态概览
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
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
