import { getApiBaseUrl } from './network-checker'
import { TIMEOUT } from './config'

export interface ProxyOptions {
  service: 'tv' | 'dv'
  path: string
  method: string
  body?: any
  query?: Record<string, string>
  headers?: Record<string, string>
}

/**
 * 统一代理逻辑
 */
export async function proxyRequest(options: ProxyOptions) {
  const { service, path, method, body, query, headers } = options
  
  const baseUrl = await getApiBaseUrl(service)
  
  // 构建完整 URL
  let url = `${baseUrl}${path}`
  
  // 添加查询参数
  if (query && Object.keys(query).length > 0) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value)
      }
    }
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }
  
  // 只有非 GET/HEAD 请求才添加 body
  if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
    fetchOptions.body = JSON.stringify(body)
  }
  
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT.apiRequest)
    
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    
    clearTimeout(timeout)
    
    const contentType = response.headers.get('content-type')
    
    // 根据响应类型处理
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      return {
        status: response.status,
        data,
      }
    } else {
      const text = await response.text()
      return {
        status: response.status,
        data: text,
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw createError({
        statusCode: 504,
        message: '请求超时',
      })
    }
    
    throw createError({
      statusCode: 502,
      message: `代理请求失败: ${error.message}`,
    })
  }
}
