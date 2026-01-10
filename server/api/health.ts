import { checkPublicNetwork, getNetworkStatus } from '../utils/network-checker'

export default defineEventHandler(async () => {
  // 主动检查一次网络状态
  await checkPublicNetwork()
  
  const status = getNetworkStatus()
  
  return {
    status: 'ok',
    timestamp: Date.now(),
    network: {
      publicAvailable: status.isPublicAvailable,
      lastChecked: status.lastChecked,
      mode: status.isPublicAvailable ? 'public' : 'internal',
    },
  }
})
