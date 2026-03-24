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
            // TV 转译接口返回 { data, pagination: { page, pageSize, total, totalPages } }
            // 转换为统一格式
            return {
                data: response.data,
                total: response.pagination?.total || response.total || 0,
                page: response.pagination?.page || response.page || 1,
                pageSize: response.pagination?.pageSize || response.pageSize || 10,
            }
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
            const response = await apiGet<ApiResponse<DvTask> | DvTask>(`/api/tv/tts/${id}`)
            // 兼容两种返回：
            // 1) 直接返回任务对象
            // 2) 返回 { data: task }
            const task = (response as any)?.data ?? response
            return task as DvTask
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

    // 获取统计数据 (TV /tts/stats 接口)
    // 接口返回：{ totalTasks, runningTasks, failedTasks, activeSseConnections }
    const getStats = useCallback(async (): Promise<DvTaskStats> => {
        setLoading(true)
        setError(null)

        try {
            interface TtsStatsResponse {
                totalTasks: number
                runningTasks: number
                failedTasks: number
                activeSseConnections: number
            }
            const response = await apiGet<TtsStatsResponse>('/api/tv/tts/stats')

            // 计算成功数 = 总数 - 运行中 - 失败
            const successCount = (response.totalTasks || 0) - (response.runningTasks || 0) - (response.failedTasks || 0)

            const stats: DvTaskStats = {
                total: response.totalTasks || 0,
                pending: 0,
                queued: 0,
                running: response.runningTasks || 0,
                success: successCount > 0 ? successCount : 0,
                failed: response.failedTasks || 0,
            }

            return stats
        } catch (err) {
            const message = err instanceof Error ? err.message : '获取统计数据失败'
            setError(message)
            // 返回空统计
            return {
                total: 0,
                pending: 0,
                queued: 0,
                running: 0,
                success: 0,
                failed: 0,
            }
        } finally {
            setLoading(false)
        }
    }, [])

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

    // 重试任务（使用原任务的 URL 和 quality 重新创建）
    const retryTask = useCallback(async (url: string, quality: string, languageArray: string = 'zh') => {
        return createTask(url, quality, languageArray)
    }, [createTask])

    return {
        loading,
        error,
        getTasks,
        getTaskDetail,
        createTask,
        retryTask,
        cancelTask,
        getQueueStatus,
        getModels,
        getStats,
        manualCleanup,
    }
}
