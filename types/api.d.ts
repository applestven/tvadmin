// 通用 API 响应类型
export interface ApiResponse<T = any> {
  code?: number
  data?: T
  message?: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  pageSize?: number
  limit?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  code: number
  data: T[]
  total: number
  page: number
  pageSize: number
  message?: string
}

// 网络状态
export interface NetworkStatus {
  publicAvailable: boolean
  lastChecked: number
  mode: 'public' | 'internal'
}

// 健康检查响应
export interface HealthCheckResponse {
  status: string
  timestamp: number
  network: NetworkStatus
}
