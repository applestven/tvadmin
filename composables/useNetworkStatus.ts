import type { HealthCheckResponse, NetworkStatus } from '~/types/api'

/**
 * 网络状态监控
 */
export function useNetworkStatus() {
  const api = useApi()
  
  const networkStatus = ref<NetworkStatus>({
    publicAvailable: false,
    lastChecked: 0,
    mode: 'internal',
  })
  
  const isChecking = ref(false)
  
  /**
   * 检查网络状态
   */
  async function checkNetwork() {
    if (isChecking.value) return
    
    isChecking.value = true
    
    try {
      const response = await api.get<HealthCheckResponse>('/health')
      networkStatus.value = response.network
    } catch (error) {
      console.error('网络检查失败:', error)
      networkStatus.value = {
        publicAvailable: false,
        lastChecked: Date.now(),
        mode: 'internal',
      }
    } finally {
      isChecking.value = false
    }
  }
  
  /**
   * 开始定时检查
   */
  function startPolling(interval = 30000) {
    checkNetwork()
    const timer = setInterval(checkNetwork, interval)
    
    // 清理函数
    onUnmounted(() => {
      clearInterval(timer)
    })
  }
  
  return {
    networkStatus: readonly(networkStatus),
    isChecking: readonly(isChecking),
    checkNetwork,
    startPolling,
  }
}
