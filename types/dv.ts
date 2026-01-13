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
    created_at?: string
    startedAt?: number
    started_at?: string
    finishedAt?: number
    finished_at?: string
    progress?: number
    output?: string
    output_name?: string
    error?: string | null
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
