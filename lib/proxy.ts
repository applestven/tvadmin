import { API_CONFIG, ServiceType, NetworkType } from './api-config'

interface ProxyOptions {
    service: ServiceType
    network: NetworkType
    path: string
    method?: string
    body?: unknown
    timeout?: number
}

/**
 * 服务端代理请求函数
 * 用于 Next.js Route Handlers 中转发请求到实际的后端服务
 */
export async function proxyRequest(options: ProxyOptions): Promise<Response> {
    const { service, network, path, method = 'GET', body, timeout = 30000 } = options

    const baseUrl = API_CONFIG[service][network]
    const url = `${baseUrl}${path}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        })

        clearTimeout(timeoutId)
        return response
    } catch (error) {
        clearTimeout(timeoutId)
        throw error
    }
}

/**
 * 带自动故障转移的代理请求
 * 优先使用公网，失败后自动切换到内网
 */
export async function proxyWithFallback(
    service: ServiceType,
    path: string,
    method: string = 'GET',
    body?: unknown
): Promise<{ data: unknown; network: NetworkType }> {
    // 首先尝试公网
    try {
        const response = await proxyRequest({
            service,
            network: 'public',
            path,
            method,
            body,
            timeout: API_CONFIG.timeout,
        })

        if (response.ok) {
            const data = await response.json()
            return { data, network: 'public' }
        }
    } catch {
        // 公网请求失败，尝试内网
    }

    // 尝试内网
    try {
        const response = await proxyRequest({
            service,
            network: 'private',
            path,
            method,
            body,
            timeout: API_CONFIG.timeout,
        })

        if (response.ok) {
            const data = await response.json()
            return { data, network: 'private' }
        }

        throw new Error(`Request failed with status ${response.status}`)
    } catch (error) {
        throw new Error(
            `Both public and private networks failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}

/**
 * 健康检查函数
 */
export async function checkHealth(
    service: ServiceType,
    network: NetworkType
): Promise<boolean> {
    try {
        const response = await proxyRequest({
            service,
            network,
            path: '/',
            method: 'GET',
            timeout: API_CONFIG.timeout,
        })
        return response.ok
    } catch {
        return false
    }
}
