// API 配置
export const API_CONFIG = {
    tv: {
        public: 'http://43.139.236.50:8686/tv',
        private: 'http://192.168.191.168:6789',
    },
    dv: {
        public: 'http://43.139.236.50:8686/dv',
        private: 'http://192.168.191.168:3456',
    },
    timeout: 5000, // 健康检查超时时间
    healthCheckInterval: 30000, // 健康检查间隔 30 秒
}

export type ServiceType = 'tv' | 'dv'
export type NetworkType = 'public' | 'private'

export function getApiUrl(service: ServiceType, network: NetworkType): string {
    return API_CONFIG[service][network]
}
