'use client'

import { useState, useCallback } from 'react'
import { apiGet, apiPost } from '@/lib/api-client'
import type { TvTask, TvTaskStats, TvTaskQueryRequest, ApiResponse, PaginatedResponse } from '@/types'

export function useTvApi() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 获取任务列表 (DV 下载任务)
    const getTasks = useCallback(async (params?: TvTaskQueryRequest) => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiPost<PaginatedResponse<TvTask>>('/api/dv/tasks/query', params)
            // DV 下载接口返回 { code, data, pagination: { page, pageSize, total, totalPages }, message }
            // 转换为统一格式
            return {
                data: response.data,
                total: response.pagination?.total || response.total || response.data?.length || 0,
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

    // 获取统计数据 (DV /stats 接口)
    const getStats = useCallback(async (): Promise<TvTaskStats> => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiGet<ApiResponse<{ total: number; downloading: number; failed: number }>>('/api/dv/stats')

            const stats: TvTaskStats = {
                total: response.data?.total || 0,
                pending: 0,
                running: response.data?.downloading || 0,
                success: (response.data?.total || 0) - (response.data?.downloading || 0) - (response.data?.failed || 0),
                failed: response.data?.failed || 0,
            }

            return stats
        } catch (err) {
            const message = err instanceof Error ? err.message : '获取统计数据失败'
            setError(message)
            // 返回空统计
            return {
                total: 0,
                pending: 0,
                running: 0,
                success: 0,
                failed: 0,
            }
        } finally {
            setLoading(false)
        }
    }, [])

    // 重试任务（使用原任务的 URL 和 quality 重新创建）
    const retryTask = useCallback(async (url: string, quality: string) => {
        return createTask(url, quality)
    }, [createTask])

    return {
        loading,
        error,
        getTasks,
        getTaskDetail,
        createTask,
        retryTask,
        getStats,
    }
}
