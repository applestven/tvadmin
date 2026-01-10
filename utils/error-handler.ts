import { message as AntMessage } from 'ant-design-vue'

export interface ApiError {
  statusCode: number
  message: string
  data?: any
}

/**
 * 处理 API 错误
 */
export function handleApiError(error: any): ApiError {
  // 网络错误
  if (error.name === 'FetchError' || error.message?.includes('fetch')) {
    return {
      statusCode: 0,
      message: '网络请求失败，请检查网络连接',
    }
  }
  
  // 超时错误
  if (error.name === 'AbortError') {
    return {
      statusCode: 504,
      message: '请求超时，请稍后重试',
    }
  }
  
  // 服务端错误
  if (error.statusCode) {
    const statusMessages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '没有权限访问',
      404: '请求的资源不存在',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用',
      504: '网关超时',
    }
    
    return {
      statusCode: error.statusCode,
      message: error.message || statusMessages[error.statusCode] || '未知错误',
      data: error.data,
    }
  }
  
  // 其他错误
  return {
    statusCode: -1,
    message: error.message || '未知错误',
  }
}

/**
 * 显示错误消息
 */
export function showErrorMessage(error: any) {
  const apiError = handleApiError(error)
  AntMessage.error(apiError.message)
}
