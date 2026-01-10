// DV API 类型定义 (转译服务)

// 任务状态
export type DvTaskStatus = 'pending' | 'queued' | 'running' | 'success' | 'failed'

// 模型质量
export type ModelQuality = 'tiny' | 'base' | 'small' | 'medium' | 'large'

// 转译任务
export interface DvTask {
  id: string
  url: string
  quality: ModelQuality
  status: DvTaskStatus
  location?: string
  languageArray?: string
  createdAt?: number
  startedAt?: number
  finishedAt?: number
  progress?: number
  output?: string
  error?: string
}

// 任务创建请求
export interface CreateTaskRequest {
  url: string
  quality: ModelQuality
  languageArray?: string
}

// 任务列表查询参数
export interface DvTaskQueryParams {
  page?: number
  pageSize?: number
  status?: DvTaskStatus
  quality?: ModelQuality
  location?: string
}

// 队列状态
export interface QueueStatus {
  pending: number
  queued: number
  running: number
  completed: number
  failed: number
}

// 模型信息
export interface ModelInfo {
  name: string
  size: string
  language: string[]
}

// 文件信息
export interface FileInfo {
  name: string
  size: number
  createdAt: string
}

// 统计数据
export interface DvStats {
  totalTasks: number
  successTasks: number
  failedTasks: number
  runningTasks: number
  queuedTasks: number
  pendingTasks: number
}
