// TV 任务类型定义
export type TvTaskStatus = 'pending' | 'running' | 'success' | 'failed'

export type VideoQuality = 'video_best' | 'audio_best' | 'video_worst' | 'audio_worst' | 'audio_low' | 'video_low'

export interface TvTask {
    id: string
    url: string
    quality: VideoQuality | string
    status: TvTaskStatus
    location?: string
    createdAt: number
    startedAt?: number
    finishedAt?: number
    strategy?: string
    output?: string
    outputName?: string
    fullPath?: string  // 完整的下载文件访问地址
    error?: string | null
}

export interface TvTaskStats {
    total: number
    pending: number
    running: number
    success: number
    failed: number
}

export interface TvTaskQueryFilters {
    id?: string
    url?: string
    quality?: VideoQuality | VideoQuality[]
    status?: TvTaskStatus | TvTaskStatus[]
    location?: string
    createdAt?: number | { min?: number; max?: number }
    startedAt?: number | { min?: number; max?: number }
    finishedAt?: number | { min?: number; max?: number }
}

export interface TvTaskQueryRequest {
    filters?: TvTaskQueryFilters
    page?: number
    limit?: number
}
