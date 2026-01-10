// 服务器配置
export interface ServerConfig {
  name: string
  publicUrl: string
  internalUrl: string
}

export const config = {
  tv: {
    name: 'TV API (下载服务)',
    publicUrl: 'http://43.139.236.50:8686/tv',
    internalUrl: 'http://192.168.191.168:6789',
  } as ServerConfig,
  
  dv: {
    name: 'DV API (转译服务)',
    publicUrl: 'http://43.139.236.50:8686/dv',
    internalUrl: 'http://192.168.191.168:3456',
  } as ServerConfig,
  
  // 日志服务器配置
  logs: [
    {
      name: 'TV 下载服务',
      url: 'http://192.168.191.168:6789/logs',
    },
    {
      name: 'DV 转译服务',
      url: 'http://192.168.191.168:3456/logs',
    },
  ],
}

// 超时配置
export const TIMEOUT = {
  healthCheck: 3000,  // 健康检查超时 3秒
  apiRequest: 30000,  // API 请求超时 30秒
}
