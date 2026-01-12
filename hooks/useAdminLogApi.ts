'use client'

import { useState, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import type { AdminLog, CreateAdminLogDto, UpdateAdminLogDto, ApiResponse } from '@/types'

export function useAdminLogApi() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 获取所有管理员日志
    const getAdminLogs = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiGet<AdminLog[]>('/api/tv/admin-log')
            return response
        } catch (err) {
            const message = err instanceof Error ? err.message : '获取管理员日志失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // 获取单个管理员日志
    const getAdminLog = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiGet<AdminLog>(`/api/tv/admin-log/${id}`)
            return response
        } catch (err) {
            const message = err instanceof Error ? err.message : '获取管理员日志详情失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // 创建管理员日志
    const createAdminLog = useCallback(async (data: CreateAdminLogDto) => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiPost<AdminLog>('/api/tv/admin-log', data)
            return response
        } catch (err) {
            const message = err instanceof Error ? err.message : '创建管理员日志失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // 更新管理员日志
    const updateAdminLog = useCallback(async (id: string, data: UpdateAdminLogDto) => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiPut<AdminLog>(`/api/tv/admin-log/${id}`, data)
            return response
        } catch (err) {
            const message = err instanceof Error ? err.message : '更新管理员日志失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // 删除管理员日志
    const deleteAdminLog = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiDelete<{ success: boolean }>(`/api/tv/admin-log/${id}`)
            return response
        } catch (err) {
            const message = err instanceof Error ? err.message : '删除管理员日志失败'
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        loading,
        error,
        getAdminLogs,
        getAdminLog,
        createAdminLog,
        updateAdminLog,
        deleteAdminLog,
    }
}
