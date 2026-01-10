import { useApi } from '~/composables/useApi'

/**
 * 创建 API 客户端实例
 * 可以用于在 Nuxt 外部使用 API
 */
export function createApiClient() {
  return useApi()
}

export type ApiClient = ReturnType<typeof createApiClient>
