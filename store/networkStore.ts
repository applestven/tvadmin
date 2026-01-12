import { create } from 'zustand'
import type { NetworkMode, HealthStatus } from '@/types'

interface NetworkState {
    mode: NetworkMode
    health: HealthStatus
    lastCheck: number | null
    isChecking: boolean
    setMode: (mode: NetworkMode) => void
    setHealth: (health: HealthStatus) => void
    setLastCheck: (time: number) => void
    setIsChecking: (checking: boolean) => void
}

export const useNetworkStore = create<NetworkState>((set) => ({
    mode: 'public',
    health: {
        tv: { public: false, private: false },
        dv: { public: false, private: false },
    },
    lastCheck: null,
    isChecking: false,
    setMode: (mode) => set({ mode }),
    setHealth: (health) => set({ health }),
    setLastCheck: (time) => set({ lastCheck: time }),
    setIsChecking: (checking) => set({ isChecking: checking }),
}))
