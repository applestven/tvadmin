'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTvApi } from '@/hooks'
import { getStatusColor, getStatusText, formatDate, formatDuration } from '@/lib/utils'
import { ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react'
import type { TvTask } from '@/types'

export default function DownloadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [task, setTask] = useState<TvTask | null>(null)
  const [loading, setLoading] = useState(true)

  const { getTaskDetail } = useTvApi()

  const fetchTask = async () => {
    setLoading(true)
    try {
      const data = await getTaskDetail(params.id as string)
      if (data) {
        setTask(data)
      }
    } catch (error) {
      console.error('Failed to fetch task:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchTask()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground mb-4">任务不存在</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>
    )
  }

  const duration = task.finishedAt && task.startedAt
    ? formatDuration(task.finishedAt - task.startedAt)
    : '-'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">任务详情</h2>
            <p className="text-muted-foreground font-mono text-sm">{task.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchTask}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>任务的基本配置信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">状态</span>
              <Badge className={getStatusColor(task.status)}>
                {getStatusText(task.status)}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">视频质量</span>
              <Badge variant="outline">{task.quality}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">执行位置</span>
              <span>{task.location || '-'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">策略</span>
              <span>{task.strategy || '-'}</span>
            </div>
          </CardContent>
        </Card>

        {/* 时间信息 */}
        <Card>
          <CardHeader>
            <CardTitle>时间信息</CardTitle>
            <CardDescription>任务执行时间记录</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">创建时间</span>
              <span>{task.createdAt ? formatDate(task.createdAt) : '-'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">开始时间</span>
              <span>{task.startedAt ? formatDate(task.startedAt) : '-'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">完成时间</span>
              <span>{task.finishedAt ? formatDate(task.finishedAt) : '-'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">执行时长</span>
              <span>{duration}</span>
            </div>
          </CardContent>
        </Card>

        {/* URL 信息 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>URL 信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-muted-foreground text-sm">源 URL</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 rounded bg-muted p-2 text-sm break-all">
                  {task.url}
                </code>
                <a href={task.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
            {task.output && (
              <div>
                <span className="text-muted-foreground text-sm">输出路径</span>
                <code className="block rounded bg-muted p-2 text-sm mt-1 break-all">
                  {task.output}
                </code>
              </div>
            )}
            {task.outputName && (
              <div>
                <span className="text-muted-foreground text-sm">输出文件名</span>
                <code className="block rounded bg-muted p-2 text-sm mt-1">
                  {task.outputName}
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 错误信息 */}
        {task.error && (
          <Card className="md:col-span-2 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">错误信息</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="rounded bg-destructive/10 p-4 text-sm text-destructive overflow-auto">
                {task.error}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
