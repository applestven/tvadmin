import type { ApiResponse } from '~/types/api'

/**
 * 通用 API 请求封装
 */
export function useApi() {
  const config = useRuntimeConfig()
  
  /**
   * 发起 API 请求
   */
  async function request<T = any>(
    path: string,
    options: {
      method?: string
      body?: any
      query?: Record<string, any>
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, query } = options
    
    const url = `${config.public.apiBase}${path}`
    
    const fetchOptions: any = {
      method,
    }
    
    if (body) {
      fetchOptions.body = body
    }
    
    if (query) {
      fetchOptions.query = query
    }
    
    try {
      const data = await $fetch<T>(url, fetchOptions)
      return data
    } catch (error: any) {
      console.error('API 请求失败:', error)
      throw error
    }
  }
  
  return {
    request,
    get: <T = any>(path: string, query?: Record<string, any>) => 
      request<T>(path, { method: 'GET', query }),
    post: <T = any>(path: string, body?: any) => 
      request<T>(path, { method: 'POST', body }),
    put: <T = any>(path: string, body?: any) => 
      request<T>(path, { method: 'PUT', body }),
    delete: <T = any>(path: string, query?: Record<string, any>) => 
      request<T>(path, { method: 'DELETE', query }),
  }
}
