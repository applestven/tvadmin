// DV 任务类型定义 (语音转文字)
export type DvTaskStatus = 'pending' | 'queued' | 'running' | 'success' | 'failed'

export type ModelQuality = 'tiny' | 'base' | 'small' | 'medium' | 'large'

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

export interface DvTaskStats {
    total: number
    pending: number
    queued: number
    running: number
    success: number
    failed: number
}

export interface DvQueueStatus {
    queueLength: number
    runningTasks: number
    maxConcurrent: number
}

export interface DvModel {
    name: string
    quality: ModelQuality
    size: string
    description?: string
}
