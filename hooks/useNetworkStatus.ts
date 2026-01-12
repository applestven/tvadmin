'use client'

import { useEffect, useCallback } from 'react'
import { useNetworkStore } from '@/store/networkStore'
import { apiFetch } from '@/lib/api-client'
import { API_CONFIG } from '@/lib/api-config'
import type { HealthStatus } from '@/types'

export function useNetworkStatus() {
    const { mode, health, lastCheck, isChecking, setMode, setHealth, setLastCheck, setIsChecking } =
        useNetworkStore()

    const checkHealth = useCallback(async () => {
        if (isChecking) return

        setIsChecking(true)

        try {
            const response = await apiFetch<HealthStatus>('/api/health', {
                timeout: API_CONFIG.timeout,
            })

            setHealth(response)
            setLastCheck(Date.now())

            // 根据健康状态自动切换网络模式
            if (response.tv.public && response.dv.public) {
                setMode('public')
            } else if (response.tv.private && response.dv.private) {
                setMode('private')
            }
        } catch (error) {
            console.error('Health check failed:', error)
        } finally {
            setIsChecking(false)
        }
    }, [isChecking, setHealth, setIsChecking, setLastCheck, setMode])

    // 初始检查
    useEffect(() => {
        checkHealth()
    }, [checkHealth])

    // 定时检查（30秒）
    useEffect(() => {
        const interval = setInterval(checkHealth, API_CONFIG.healthCheckInterval)
        return () => clearInterval(interval)
    }, [checkHealth])

    return {
        mode,
        health,
        lastCheck,
        isChecking,
        checkHealth,
    }
}
