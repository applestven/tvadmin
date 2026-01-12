'use client'

import { useState, useCallback } from 'react'
import { apiGet, apiPost } from '@/lib/api-client'
import type { TvTask, TvTaskStats, TvTaskQueryRequest, ApiResponse, PaginatedResponse } from '@/types'

export function useTvApi() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 获取任务列表
    const getTasks = useCallback(async (params?: TvTaskQueryRequest) => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiPost<PaginatedResponse<TvTask>>('/api/dv/tasks/query', params)
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
            // 接口直接返回 TvTask 对象
            const response = await apiGet<TvTask>(`/api/dv/task/${id}`)
            return response
        } catch (err) {
            const message = err instanceof Error ? err.message : '获取任务详情失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // 创建下载任务
    const createTask = useCallback(async (url: string, quality: string = 'video_best') => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiPost<ApiResponse<{ taskId: string }>>('/api/dv/download', {
                url,
                quality,
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

    // 获取统计数据
    const getStats = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            // 获取各状态的任务数量
            const response = await apiGet<ApiResponse<{ runningTasks: TvTask[]; total: number }>>('/api/dv/c')

            const stats: TvTaskStats = {
                total: response.data?.total || 0,
                pending: 0,
                running: response.data?.runningTasks?.length || 0,
                success: 0,
                failed: 0,
            }

            return stats
        } catch (err) {
            const message = err instanceof Error ? err.message : '获取统计数据失败'
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
        getStats,
    }
}
