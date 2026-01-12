'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CopyableText } from '@/components/ui/copyable-text'
import { useTvApi } from '@/hooks'
import { getStatusColor, getStatusText, formatDate, formatDuration } from '@/lib/utils'
import { ArrowLeft, RefreshCw, ExternalLink, Download, Play, Music, Video, FileAudio, FileVideo } from 'lucide-react'
import type { TvTask } from '@/types'

// 判断媒体类型
function getMediaType(filename?: string): 'audio' | 'video' | 'unknown' {
  if (!filename) return 'unknown'
  const ext = filename.toLowerCase().split('.').pop()
  const audioExts = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma']
  const videoExts = ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'm4v']
  
  if (audioExts.includes(ext || '')) return 'audio'
  if (videoExts.includes(ext || '')) return 'video'
  return 'unknown'
}

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

  // 计算媒体类型
  const mediaType = useMemo(() => {
    return getMediaType(task?.outputName || task?.fullPath)
  }, [task?.outputName, task?.fullPath])

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
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">任务详情</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(task.status)}>
                {getStatusText(task.status)}
              </Badge>
              <span className="text-muted-foreground font-mono text-sm">
                <CopyableText text={task.id} maxLength={36} />
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchTask}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {task.fullPath && (
            <a href={task.fullPath} download>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                下载文件
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* 媒体播放器 - 仅在成功状态且有 fullPath 时显示 */}
      {task.status === 'success' && task.fullPath && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mediaType === 'audio' ? (
                <><Music className="h-5 w-5" /> 音频播放</>
              ) : mediaType === 'video' ? (
                <><Video className="h-5 w-5" /> 视频播放</>
              ) : (
                <><Play className="h-5 w-5" /> 媒体预览</>
              )}
            </CardTitle>
            <CardDescription>
              {task.outputName || '媒体文件'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mediaType === 'audio' ? (
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileAudio className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium truncate">{task.outputName}</p>
                    <p className="text-sm text-muted-foreground">{task.quality}</p>
                  </div>
                </div>
                <audio 
                  controls 
                  className="w-full" 
                  src={task.fullPath}
                  preload="metadata"
                >
                  您的浏览器不支持音频播放
                </audio>
              </div>
            ) : mediaType === 'video' ? (
              <div className="bg-black rounded-lg overflow-hidden">
                <video 
                  controls 
                  className="w-full max-h-[500px]" 
                  src={task.fullPath}
                  preload="metadata"
                  poster=""
                >
                  您的浏览器不支持视频播放
                </video>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <FileVideo className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">无法预览此文件类型</p>
                <a href={task.fullPath} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="mt-4">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    在新窗口打开
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>任务的基本配置信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">任务 ID</span>
              <span className="font-mono text-sm">
                <CopyableText text={task.id} maxLength={16} />
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">状态</span>
              <Badge className={getStatusColor(task.status)}>
                {getStatusText(task.status)}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">下载质量</span>
              <Badge variant="outline">{task.quality}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">执行节点</span>
              <span className="text-sm">
                {task.location ? (
                  <CopyableText text={task.location} maxLength={30} />
                ) : '-'}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">下载策略</span>
              <Badge variant="secondary">{task.strategy || '-'}</Badge>
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
              <span className="text-sm">{task.createdAt ? formatDate(task.createdAt) : '-'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">开始时间</span>
              <span className="text-sm">{task.startedAt ? formatDate(task.startedAt) : '-'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">完成时间</span>
              <span className="text-sm">{task.finishedAt ? formatDate(task.finishedAt) : '-'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">执行时长</span>
              <Badge variant="outline">{duration}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 源 URL */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>源地址</CardTitle>
            <CardDescription>原始下载链接</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted p-3 text-sm break-all font-mono">
                <CopyableText text={task.url} maxLength={200} />
              </code>
              <a href={task.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* 输出信息 */}
        {(task.fullPath || task.output || task.outputName) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>输出信息</CardTitle>
              <CardDescription>下载文件的相关信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.outputName && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {mediaType === 'audio' ? (
                      <FileAudio className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileVideo className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground text-sm">文件名</span>
                  </div>
                  <code className="block rounded bg-muted p-3 text-sm font-mono">
                    <CopyableText text={task.outputName} maxLength={100} />
                  </code>
                </div>
              )}
              {task.fullPath && (
                <div>
                  <span className="text-muted-foreground text-sm">访问地址</span>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 rounded bg-muted p-3 text-sm break-all font-mono">
                      <CopyableText text={task.fullPath} maxLength={150} />
                    </code>
                    <a href={task.fullPath} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <a href={task.fullPath} download>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              )}
              {task.output && (
                <div>
                  <span className="text-muted-foreground text-sm">服务器路径</span>
                  <code className="block rounded bg-muted p-3 text-sm mt-2 break-all font-mono">
                    <CopyableText text={task.output} maxLength={150} />
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 错误信息 */}
        {task.error && (
          <Card className="md:col-span-2 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">错误信息</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="rounded bg-destructive/10 p-4 text-sm text-destructive overflow-auto whitespace-pre-wrap">
                {task.error}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
