// TV API 类型定义 (下载服务)

// 任务状态
export type TvTaskStatus = 'pending' | 'running' | 'success' | 'failed'

// 视频质量
export type VideoQuality = 'video_best' | 'audio_best' | 'video_worst' | 'audio_worst'

// 任务
export interface TvTask {
  id: string
  url: string
  quality: VideoQuality
  status: TvTaskStatus
  location?: string
  createdAt: number
  startedAt?: number
  finishedAt?: number
  strategy?: string
  output?: string
  outputName?: string
  error?: string
}

// 任务查询过滤器
export interface TvTaskQueryFilters {
  id?: string
  url?: string
  quality?: VideoQuality | VideoQuality[]
  status?: TvTaskStatus | TvTaskStatus[]
  location?: string
  error?: string
  createdAt?: number | { min?: number; max?: number }
  startedAt?: number | { min?: number; max?: number }
  finishedAt?: number | { min?: number; max?: number }
  strategy?: string
  output?: string
  outputName?: string
}

// 任务查询参数
export interface TvTaskQueryParams {
  filters?: TvTaskQueryFilters
  page?: number
  limit?: number
}

// 下载请求
export interface DownloadRequest {
  url: string
  quality?: VideoQuality
}

// 下载响应
export interface DownloadResponse {
  taskId: string
}

// 运行中任务响应
export interface RunningTasksResponse {
  message: string
  runningTasks: TvTask[]
  total: number
}

// 统计数据
export interface TvStats {
  totalTasks: number
  successTasks: number
  failedTasks: number
  runningTasks: number
  pendingTasks: number
  totalDownloadSize?: number
}

// ==================== 管理员日志相关类型 ====================

// 管理员日志
export interface AdminLog {
  id: string
  name: string
  address: string
  created_at: string
}

// 创建管理员日志请求
export interface CreateAdminLogDto {
  name: string
  address: string
}

// 更新管理员日志请求
export interface UpdateAdminLogDto {
  name?: string
  address?: string
}

// 管理员日志查询参数
export interface AdminLogQueryParams {
  page?: number
  pageSize?: number
  name?: string
  address?: string
}
