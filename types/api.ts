// 通用 API 类型定义
export interface ApiResponse<T = unknown> {
    code?: number
    data?: T
    message?: string
}

export interface PaginatedResponse<T> {
    code: number
    data: T[]
    total: number
    page: number
    pageSize: number
    message?: string
}

export interface HealthStatus {
    tv: {
        public: boolean
        private: boolean
    }
    dv: {
        public: boolean
        private: boolean
    }
}

export type NetworkMode = 'public' | 'private'

export interface AdminLog {
    id: string
    name: string
    address: string
    created_at: string
}

export interface CreateAdminLogDto {
    name: string
    address: string
}

export interface FileInfo {
    name: string
    size: number
    modifiedAt: string
}
