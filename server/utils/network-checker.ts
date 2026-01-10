import { config, TIMEOUT } from './config'

// 网络状态缓存
interface NetworkStatus {
  isPublicAvailable: boolean
  lastChecked: number
  checkInProgress: boolean
}

const networkStatus: NetworkStatus = {
  isPublicAvailable: false,
  lastChecked: 0,
  checkInProgress: false,
}

// 缓存时间 30 秒
const CACHE_DURATION = 30000

/**
 * 检查公网是否可用
 */
export async function checkPublicNetwork(): Promise<boolean> {
  const now = Date.now()
  
  // 如果缓存有效，直接返回
  if (now - networkStatus.lastChecked < CACHE_DURATION) {
    return networkStatus.isPublicAvailable
  }
  
  // 防止并发检查
  if (networkStatus.checkInProgress) {
    return networkStatus.isPublicAvailable
  }
  
  networkStatus.checkInProgress = true
  
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT.healthCheck)
    
    const response = await fetch(config.tv.publicUrl, {
      method: 'GET',
      signal: controller.signal,
    })
    
    clearTimeout(timeout)
    
    networkStatus.isPublicAvailable = response.ok
    networkStatus.lastChecked = now
    
    return networkStatus.isPublicAvailable
  } catch (error) {
    networkStatus.isPublicAvailable = false
    networkStatus.lastChecked = now
    return false
  } finally {
    networkStatus.checkInProgress = false
  }
}

/**
 * 获取当前应该使用的 API 基础地址
 */
export async function getApiBaseUrl(service: 'tv' | 'dv'): Promise<string> {
  const isPublicAvailable = await checkPublicNetwork()
  const serviceConfig = config[service]
  
  return isPublicAvailable ? serviceConfig.publicUrl : serviceConfig.internalUrl
}

/**
 * 获取网络状态（给健康检查接口用）
 */
export function getNetworkStatus() {
  return {
    isPublicAvailable: networkStatus.isPublicAvailable,
    lastChecked: networkStatus.lastChecked,
    cacheExpiry: networkStatus.lastChecked + CACHE_DURATION,
  }
}
