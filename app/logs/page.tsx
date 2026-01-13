'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Pause, Play, Trash2, Plus, Edit, X, ExternalLink, Maximize2, Minimize2, Copy, EyeOff, Eye } from 'lucide-react'
import { useAdminLogApi } from '@/hooks'
import type { AdminLog, CreateAdminLogDto } from '@/types'

interface LogViewerState {
  id: string
  isAutoRefresh: boolean
  refreshInterval: number // 秒
  isFullscreen: boolean
  iframeKey: number // 用于强制刷新 iframe
}

// 临时日志类型（不存入数据库）
interface TempLog {
  id: string
  name: string
  address: string
  isTemp: true
  created_at: string
}

export default function LogsPage() {
  const { loading, error, getAdminLogs, createAdminLog, updateAdminLog, deleteAdminLog } = useAdminLogApi()
  
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([])
  const [tempLogs, setTempLogs] = useState<TempLog[]>([]) // 临时日志（不存数据库）
  const [logViewerStates, setLogViewerStates] = useState<Map<string, LogViewerState>>(new Map())
  const [selectedLogs, setSelectedLogs] = useState<string[]>([])
  const [hideHeaders, setHideHeaders] = useState(false) // 隐藏窗口信息条
  
  // 表单状态
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLog, setEditingLog] = useState<AdminLog | null>(null)
  const [formData, setFormData] = useState<CreateAdminLogDto>({ name: '', address: '' })
  
  // 自动刷新定时器引用
  const refreshTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // 获取管理员日志列表
  const fetchAdminLogs = useCallback(async () => {
    try {
      const logs = await getAdminLogs()
      setAdminLogs(logs)
      
      // 初始化每个日志的查看器状态（包括临时日志）
      const newStates = new Map<string, LogViewerState>()
      const allLogs = [...logs, ...tempLogs]
      allLogs.forEach((log) => {
        const existingState = logViewerStates.get(log.id)
        newStates.set(log.id, existingState || {
          id: log.id,
          isAutoRefresh: false,
          refreshInterval: 3,
          isFullscreen: false,
          iframeKey: 0,
        })
      })
      setLogViewerStates(newStates)
      
      // 默认选中所有日志
      if (selectedLogs.length === 0 && allLogs.length > 0) {
        setSelectedLogs(allLogs.map((log) => log.id))
      }
    } catch (err) {
      console.error('获取管理员日志失败:', err)
    }
  }, [getAdminLogs, tempLogs])

  // 初始加载
  useEffect(() => {
    fetchAdminLogs()
  }, [])

  // 处理自动刷新
  useEffect(() => {
    logViewerStates.forEach((state, id) => {
      const existingTimer = refreshTimersRef.current.get(id)
      
      if (state.isAutoRefresh) {
        // 如果已有定时器，先清除
        if (existingTimer) {
          clearInterval(existingTimer)
        }
        
        // 创建新的定时器
        const timer = setInterval(() => {
          setLogViewerStates(prev => {
            const newStates = new Map(prev)
            const currentState = newStates.get(id)
            if (currentState) {
              newStates.set(id, {
                ...currentState,
                iframeKey: currentState.iframeKey + 1,
              })
            }
            return newStates
          })
        }, state.refreshInterval * 1000)
        
        refreshTimersRef.current.set(id, timer)
      } else {
        // 清除定时器
        if (existingTimer) {
          clearInterval(existingTimer)
          refreshTimersRef.current.delete(id)
        }
      }
    })

    // 清理函数
    return () => {
      refreshTimersRef.current.forEach((timer) => clearInterval(timer))
    }
  }, [logViewerStates])

  // 手动刷新单个日志
  const handleRefresh = (id: string) => {
    setLogViewerStates(prev => {
      const newStates = new Map(prev)
      const state = newStates.get(id)
      if (state) {
        newStates.set(id, {
          ...state,
          iframeKey: state.iframeKey + 1,
        })
      }
      return newStates
    })
  }

  // 切换自动刷新
  const toggleAutoRefresh = (id: string) => {
    setLogViewerStates(prev => {
      const newStates = new Map(prev)
      const state = newStates.get(id)
      if (state) {
        newStates.set(id, {
          ...state,
          isAutoRefresh: !state.isAutoRefresh,
        })
      }
      return newStates
    })
  }

  // 设置刷新间隔
  const setRefreshInterval = (id: string, interval: number) => {
    setLogViewerStates(prev => {
      const newStates = new Map(prev)
      const state = newStates.get(id)
      if (state) {
        newStates.set(id, {
          ...state,
          refreshInterval: interval,
        })
      }
      return newStates
    })
  }

  // 切换全屏
  const toggleFullscreen = (id: string) => {
    setLogViewerStates(prev => {
      const newStates = new Map(prev)
      const state = newStates.get(id)
      if (state) {
        newStates.set(id, {
          ...state,
          isFullscreen: !state.isFullscreen,
        })
      }
      return newStates
    })
  }

  // 创建日志
  const handleCreate = async () => {
    if (!formData.name || !formData.address) return
    
    try {
      await createAdminLog(formData)
      setFormData({ name: '', address: '' })
      setShowAddForm(false)
      fetchAdminLogs()
    } catch (err) {
      console.error('创建日志失败:', err)
    }
  }

  // 更新日志
  const handleUpdate = async () => {
    if (!editingLog || !formData.name || !formData.address) return
    
    try {
      await updateAdminLog(editingLog.id, formData)
      setFormData({ name: '', address: '' })
      setEditingLog(null)
      fetchAdminLogs()
    } catch (err) {
      console.error('更新日志失败:', err)
    }
  }

  // 删除日志
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个日志吗？')) return
    
    try {
      await deleteAdminLog(id)
      setSelectedLogs(prev => prev.filter(logId => logId !== id))
      fetchAdminLogs()
    } catch (err) {
      console.error('删除日志失败:', err)
    }
  }

  // 开始编辑
  const startEdit = (log: AdminLog) => {
    setEditingLog(log)
    setFormData({ name: log.name, address: log.address })
    setShowAddForm(false)
  }

  // 取消编辑/添加
  const cancelForm = () => {
    setEditingLog(null)
    setShowAddForm(false)
    setFormData({ name: '', address: '' })
  }

  // 删除临时日志
  const handleDeleteTempLog = (id: string) => {
    setTempLogs(prev => prev.filter(log => log.id !== id))
    setSelectedLogs(prev => prev.filter(logId => logId !== id))
    setLogViewerStates(prev => {
      const newStates = new Map(prev)
      newStates.delete(id)
      return newStates
    })
  }

  // 复制窗口（创建一个相同的临时日志窗口，命名为 名称-1, 名称-2...）
  const handleDuplicateWindow = (log: AdminLog | TempLog) => {
    // 获取基础名称（去掉已有的 -数字 后缀）
    const baseName = log.name.replace(/-\d+$/, '')
    
    // 计算下一个编号
    const existingNumbers = tempLogs
      .filter(t => t.name.startsWith(baseName) && t.name !== baseName)
      .map(t => {
        const match = t.name.match(/-(\d+)$/)
        return match ? parseInt(match[1], 10) : 0
      })
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
    
    const tempLog: TempLog = {
      id: `temp-${Date.now()}`,
      name: `${baseName}-${nextNumber}`,
      address: log.address,
      isTemp: true,
      created_at: new Date().toISOString(),
    }
    
    setTempLogs(prev => [...prev, tempLog])
    setSelectedLogs(prev => [...prev, tempLog.id])
    
    // 为副本创建查看器状态
    setLogViewerStates(prev => {
      const newStates = new Map(prev)
      newStates.set(tempLog.id, {
        id: tempLog.id,
        isAutoRefresh: false,
        refreshInterval: 3,
        isFullscreen: false,
        iframeKey: 0,
      })
      return newStates
    })
  }

  // 获取网格列数
  const getGridCols = () => {
    const count = selectedLogs.length
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2'
    if (count <= 4) return 'grid-cols-1 lg:grid-cols-2'
    return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
  }

  // 合并所有日志（数据库日志 + 临时日志）
  const allLogs = [...adminLogs, ...tempLogs]
  const visibleLogs = allLogs.filter(log => selectedLogs.includes(log.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">日志监控</h2>
          <p className="text-muted-foreground">管理和查看服务日志</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdminLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新列表
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHideHeaders(!hideHeaders)}
            title={hideHeaders ? '显示窗口信息' : '隐藏窗口信息'}
          >
            {hideHeaders ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {hideHeaders ? '显示信息' : '隐藏信息'}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowAddForm(true)
              setEditingLog(null)
              setFormData({ name: '', address: '' })
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            添加日志
          </Button>
        </div>
      </div>

      {/* 添加/编辑表单 */}
      {(showAddForm || editingLog) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {editingLog ? '编辑日志' : '添加新日志'}
              </span>
              <Button variant="ghost" size="icon" onClick={cancelForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">日志名称</Label>
                <Input
                  id="name"
                  placeholder="例如: TV 服务日志"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">日志地址 (URL)</Label>
                <Input
                  id="address"
                  placeholder="例如: http://192.168.1.1:8080/logs"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={cancelForm}>
                取消
              </Button>
              <Button 
                onClick={editingLog ? handleUpdate : handleCreate}
                disabled={loading || !formData.name || !formData.address}
              >
                {editingLog ? '保存修改' : '创建日志'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 日志选择器 */}
      <Card>
        <CardHeader>
          <CardTitle>日志选择</CardTitle>
        </CardHeader>
        <CardContent>
          {allLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              暂无日志，请点击上方&ldquo;添加日志&rdquo;按钮创建
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allLogs.map((log) => {
                const isTemp = 'isTemp' in log
                return (
                  <Badge
                    key={log.id}
                    variant={selectedLogs.includes(log.id) ? 'default' : 'outline'}
                    className={`cursor-pointer px-3 py-1 ${isTemp ? 'border-dashed' : ''}`}
                    onClick={() => {
                      setSelectedLogs(prev =>
                        prev.includes(log.id)
                          ? prev.filter(id => id !== log.id)
                          : [...prev, log.id]
                      )
                    }}
                  >
                    {log.name}
                    {isTemp ? <span className="ml-1 text-xs opacity-70">(临时)</span> : null}
                  </Badge>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 日志查看器 */}
      <div className={`grid gap-4 ${getGridCols()}`}>
        {visibleLogs.map((log) => {
          const state = logViewerStates.get(log.id)
          if (!state) return null
          const isTemp = 'isTemp' in log

          return (
            <Card 
              key={log.id} 
              className={`flex flex-col group ${state.isFullscreen ? 'fixed inset-4 z-50 m-0' : ''} ${isTemp ? 'border-dashed' : ''}`}
            >
              {/* 信息条 - 根据 hideHeaders 状态显示/隐藏 */}
              {!hideHeaders && (
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {log.name}
                    {isTemp && <Badge variant="secondary" className="text-xs">临时</Badge>}
                    <span className="text-xs text-muted-foreground font-normal">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {/* 刷新间隔选择 */}
                    <Select
                      value={String(state.refreshInterval)}
                      onValueChange={(value) => setRefreshInterval(log.id, Number(value))}
                    >
                      <SelectTrigger className="h-7 w-16 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1s</SelectItem>
                        <SelectItem value="3">3s</SelectItem>
                        <SelectItem value="5">5s</SelectItem>
                        <SelectItem value="10">10s</SelectItem>
                        <SelectItem value="30">30s</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* 自动刷新开关 */}
                    <Button
                      variant={state.isAutoRefresh ? 'default' : 'outline'}
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleAutoRefresh(log.id)}
                      title={state.isAutoRefresh ? '停止自动刷新' : '开始自动刷新'}
                    >
                      {state.isAutoRefresh ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                    
                    {/* 手动刷新 */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleRefresh(log.id)}
                      title="手动刷新"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    
                    {/* 复制窗口 */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDuplicateWindow(log)}
                      title="复制窗口"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    
                    {/* 在新窗口打开 */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => window.open(log.address, '_blank')}
                      title="在新窗口打开"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    
                    {/* 全屏切换 */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleFullscreen(log.id)}
                      title={state.isFullscreen ? '退出全屏' : '全屏'}
                    >
                      {state.isFullscreen ? (
                        <Minimize2 className="h-3 w-3" />
                      ) : (
                        <Maximize2 className="h-3 w-3" />
                      )}
                    </Button>
                    
                    {/* 编辑（仅非临时日志） */}
                    {!isTemp && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => startEdit(log as AdminLog)}
                        title="编辑"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {/* 删除 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => isTemp ? handleDeleteTempLog(log.id) : handleDelete(log.id)}
                      title="删除"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
              )}
              <CardContent className={`flex-1 ${hideHeaders ? 'p-0' : 'p-0'}`}>
                <div className={`relative log-iframe-wrapper ${state.isFullscreen ? 'h-[calc(100vh-120px)]' : hideHeaders ? 'h-[450px]' : 'h-[400px]'}`}>
                  {/* 自动刷新指示器 */}
                  {state.isAutoRefresh && !hideHeaders && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="secondary" className="text-xs">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-1" />
                        每 {state.refreshInterval}s 刷新
                      </Badge>
                    </div>
                  )}
                  
                  {/* 隐藏信息条时，悬停显示窗口名称 */}
                  {hideHeaders && (
                    <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <Badge variant="secondary" className="text-xs shadow-md">
                        {log.name}
                        {isTemp && ' (临时)'}
                        {state.isAutoRefresh && (
                          <span className="ml-1 inline-flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                          </span>
                        )}
                      </Badge>
                    </div>
                  )}
                  
                  <iframe
                    key={state.iframeKey}
                    src={log.address}
                    className="w-full h-full border-0 bg-background"
                    title={log.name}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 空状态 */}
      {visibleLogs.length === 0 && allLogs.length > 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              请在上方选择要查看的日志
            </p>
          </CardContent>
        </Card>
      )}

      {/* 状态指示 */}
      {allLogs.length > 0 && (
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>共 {adminLogs.length} 个日志</span>
          {tempLogs.length > 0 && (
            <>
              <span>|</span>
              <span>{tempLogs.length} 个临时</span>
            </>
          )}
          <span>|</span>
          <span>显示 {selectedLogs.length} 个</span>
          {Array.from(logViewerStates.values()).some(s => s.isAutoRefresh) && (
            <>
              <span>|</span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                自动刷新中
              </span>
            </>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg">
          {error}
        </div>
      )}
    </div>
  )
}
