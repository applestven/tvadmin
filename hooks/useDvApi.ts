'use client'

import { useState, useCallback } from 'react'
import { apiGet, apiPost, apiDelete } from '@/lib/api-client'
import type { DvTask, DvTaskStats, DvQueueStatus, DvModel, ApiResponse, PaginatedResponse } from '@/types'

interface GetTasksParams extends Record<string, string | number | undefined> {
    page?: number
    pageSize?: number
    status?: string
    quality?: string
    location?: string
}

export function useDvApi() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 获取任务列表
    const getTasks = useCallback(async (params?: GetTasksParams) => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiGet<PaginatedResponse<DvTask>>('/api/tv/tts/tasks', params)
            return response
        } catch (err) {
            const message = err instanceof Error ? err.message : '获取任务列表失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // 获取任务详情
    const getTaskDetail = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiGet<ApiResponse<DvTask>>(`/api/tv/tts/${id}`)
            return response.data
        } catch (err) {
            const message = err instanceof Error ? err.message : '获取任务详情失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // 创建转写任务
    const createTask = useCallback(async (url: string, quality: string = 'medium', languageArray: string = 'zh') => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiPost<ApiResponse<DvTask>>('/api/tv/tts/task', {
                url,
                quality,
                languageArray,
            })
            return response.data
        } catch (err) {
            const message = err instanceof Error ? err.message : '创建任务失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // 取消任务
    const cancelTask = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            await apiDelete(`/api/tv/tts/cancel?id=${id}`)
            return true
        } catch (err) {
            const message = err instanceof Error ? err.message : '取消任务失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // 获取队列状态
    const getQueueStatus = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiGet<ApiResponse<DvQueueStatus>>('/api/tv/tts/queue/status')
            return response.data
        } catch (err) {
            const message = err instanceof Error ? err.message : '获取队列状态失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // 获取模型列表
    const getModels = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiGet<ApiResponse<DvModel[]>>('/api/tv/tts/models')
            return response.data
        } catch (err) {
            const message = err instanceof Error ? err.message : '获取模型列表失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // 获取统计数据
    const getStats = useCallback(async (): Promise<DvTaskStats> => {
        // 通过获取各状态的任务来计算统计
        const stats: DvTaskStats = {
            total: 0,
            pending: 0,
            queued: 0,
            running: 0,
            success: 0,
            failed: 0,
        }

        try {
            const queueStatus = await getQueueStatus()
            if (queueStatus) {
                stats.running = queueStatus.runningTasks
                stats.queued = queueStatus.queueLength
            }
        } catch {
            // 忽略错误
        }

        return stats
    }, [getQueueStatus])

    // 手动清理
    const manualCleanup = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            await apiPost('/api/tv/tts/cleanup')
            return true
        } catch (err) {
            const message = err instanceof Error ? err.message : '清理失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        loading,
        error,
        getTasks,
        getTaskDetail,
        createTask,
        cancelTask,
        getQueueStatus,
        getModels,
        getStats,
        manualCleanup,
    }
}
