'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Pause, Play, Trash2 } from 'lucide-react'

interface LogContainer {
  id: string
  name: string
  service: 'tv' | 'dv'
  logs: string[]
}

export default function LogsPage() {
  const [containers, setContainers] = useState<LogContainer[]>([
    { id: '1', name: 'TV Service', service: 'tv', logs: [] },
    { id: '2', name: 'DV Service', service: 'dv', logs: [] },
  ])
  const [selectedContainers, setSelectedContainers] = useState<string[]>(['1', '2'])
  const [isPaused, setIsPaused] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // 模拟获取日志
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setContainers((prev) =>
        prev.map((container) => ({
          ...container,
          logs: [
            ...container.logs.slice(-100), // 保留最近 100 条
            `[${new Date().toISOString()}] ${container.name} - Sample log message ${Math.random().toString(36).substring(7)}`,
          ],
        }))
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [isPaused])

  // 自动滚动到底部
  useEffect(() => {
    if (!autoScroll) return

    Object.keys(scrollRefs.current).forEach((key) => {
      const el = scrollRefs.current[key]
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    })
  }, [containers, autoScroll])

  const handleClearLogs = (containerId: string) => {
    setContainers((prev) =>
      prev.map((c) => (c.id === containerId ? { ...c, logs: [] } : c))
    )
  }

  const getGridCols = () => {
    const count = selectedContainers.length
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-2'
    if (count <= 4) return 'grid-cols-2'
    if (count <= 6) return 'grid-cols-3'
    return 'grid-cols-4'
  }

  const visibleContainers = containers.filter((c) =>
    selectedContainers.includes(c.id)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">日志监控</h2>
          <p className="text-muted-foreground">实时查看服务运行日志</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant={autoScroll ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
          >
            自动滚动
          </Button>
        </div>
      </div>

      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle>容器选择</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {containers.map((container) => (
              <Badge
                key={container.id}
                variant={
                  selectedContainers.includes(container.id)
                    ? 'default'
                    : 'outline'
                }
                className="cursor-pointer"
                onClick={() => {
                  setSelectedContainers((prev) =>
                    prev.includes(container.id)
                      ? prev.filter((id) => id !== container.id)
                      : [...prev, container.id]
                  )
                }}
              >
                {container.name}
                <span className="ml-1 text-xs opacity-70">
                  ({container.logs.length})
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 日志容器 */}
      <div className={`grid gap-4 ${getGridCols()}`}>
        {visibleContainers.map((container) => (
          <Card key={container.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {container.name}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {container.service.toUpperCase()}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleClearLogs(container.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[300px] w-full">
                <div
                  ref={(el) => {
                    scrollRefs.current[container.id] = el
                  }}
                  className="log-container p-4 font-mono text-xs"
                >
                  {container.logs.length > 0 ? (
                    container.logs.map((log, index) => (
                      <pre
                        key={index}
                        className="text-muted-foreground hover:bg-muted/50 py-0.5"
                      >
                        {log}
                      </pre>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      暂无日志
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 状态指示 */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'
            }`}
          />
          {isPaused ? '已暂停' : '实时更新中'}
        </span>
        <span>|</span>
        <span>显示 {selectedContainers.length} 个容器</span>
      </div>
    </div>
  )
}
