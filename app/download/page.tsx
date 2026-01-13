'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CopyableText } from '@/components/ui/copyable-text'
import { CreateDownloadTaskDialog, ErrorDetailDialog } from '@/components/dialogs'
import { useTvApi } from '@/hooks'
import { getStatusColor, getStatusText, formatDate, getProcessingTime } from '@/lib/utils'
import { RefreshCw, Search, Eye } from 'lucide-react'
import type { TvTask, VideoQuality, TvTaskStatus } from '@/types'

export default function DownloadPage() {
  const [tasks, setTasks] = useState<TvTask[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    status: '',
    quality: '',
    search: '',
  })

  const { getTasks, createTask } = useTvApi()
  const pageSize = 10

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {
        page,
        limit: pageSize,
      }

      if (filters.status) {
        params.filters = { status: filters.status }
      }
      if (filters.quality) {
        params.filters = { ...params.filters as object, quality: filters.quality }
      }

      const response = await getTasks(params)
      if (response?.data) {
        setTasks(response.data)
        setTotal(response.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [getTasks, page, filters])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // 30秒自动刷新
  useEffect(() => {
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [fetchTasks])

  const handleRefresh = () => {
    fetchTasks()
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleCreateTask = async (url: string, quality: string) => {
    await createTask(url, quality)
    // 创建成功后刷新列表
    fetchTasks()
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">下载管理</h2>
          <p className="text-muted-foreground">管理 TV 视频下载任务</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <CreateDownloadTaskDialog onSubmit={handleCreateTask} loading={loading} />
        </div>
      </div>

      {/* 筛选区域 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
          <CardDescription>按条件筛选任务列表</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索 URL..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="任务状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">等待中</SelectItem>
                <SelectItem value="running">运行中</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.quality} onValueChange={(value) => handleFilterChange('quality', value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="视频质量" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部质量</SelectItem>
                <SelectItem value="video_best">最佳视频</SelectItem>
                <SelectItem value="audio_best">最佳音频</SelectItem>
                <SelectItem value="video_worst">最低视频</SelectItem>
                <SelectItem value="audio_worst">最低音频</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle>任务列表</CardTitle>
          <CardDescription>共 {total} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[180px]">URL</TableHead>
                <TableHead className="w-[150px]">文件名</TableHead>
                <TableHead className="w-[180px]">访问地址</TableHead>
                <TableHead className="w-[80px]">质量</TableHead>
                <TableHead className="w-[80px]">状态</TableHead>
                <TableHead className="w-[150px]">错误信息</TableHead>
                <TableHead className="w-[120px]">处理时间</TableHead>
                <TableHead className="w-[160px]">创建时间</TableHead>
                <TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={9}>
                      <div className="h-10 animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : tasks.length > 0 ? (
                tasks.map((task) => {
                  // 拼接访问地址
                  const accessUrl = task.location && task.outputName 
                    ? `${task.location}:3456/downloads/${task.outputName}`
                    : null
                  
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-mono text-xs relative">
                        <CopyableText text={task.id} maxLength={8} />
                      </TableCell>
                      <TableCell className="relative">
                        <CopyableText 
                          text={task.url} 
                          maxLength={25} 
                          className="text-sm"
                        />
                      </TableCell>
                      <TableCell className="relative">
                        {task.outputName ? (
                          <CopyableText 
                            text={task.outputName} 
                            maxLength={20} 
                            className="text-sm"
                          />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="relative">
                        {accessUrl ? (
                          <CopyableText 
                            text={accessUrl} 
                            maxLength={25} 
                            className="text-sm"
                          />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.quality}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.status === 'failed' && task.error ? (
                          <ErrorDetailDialog error={task.error} taskId={task.id} />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {task.status === 'success' ? (
                          getProcessingTime(task.startedAt, task.finishedAt)
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {task.createdAt ? formatDate(task.createdAt) : '-'}
                      </TableCell>
                      <TableCell>
                        <Link href={`/download/${task.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    暂无任务数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
