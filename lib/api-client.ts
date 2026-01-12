// API 客户端封装
export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public data?: unknown
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

interface FetchOptions extends RequestInit {
    timeout?: number
}

export async function apiFetch<T = unknown>(
    path: string,
    options?: FetchOptions
): Promise<T> {
    const { timeout = 30000, ...fetchOptions } = options || {}

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const res = await fetch(path, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...(fetchOptions?.headers || {}),
            },
        })

        clearTimeout(timeoutId)

        if (!res.ok) {
            const errorData = await res.json().catch(() => null)
            throw new ApiError(
                errorData?.message || `Request failed with status ${res.status}`,
                res.status,
                errorData
            )
        }

        return res.json()
    } catch (error) {
        clearTimeout(timeoutId)

        if (error instanceof ApiError) {
            throw error
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new ApiError('Request timeout', 408)
            }
            throw new ApiError(error.message)
        }

        throw new ApiError('Unknown error occurred')
    }
}

// GET 请求
export function apiGet<T = unknown>(
    path: string,
    params?: Record<string, string | number | undefined>,
    options?: FetchOptions
): Promise<T> {
    const url = new URL(path, window.location.origin)

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.append(key, String(value))
            }
        })
    }

    return apiFetch<T>(url.toString(), {
        method: 'GET',
        ...options,
    })
}

// POST 请求
export function apiPost<T = unknown>(
    path: string,
    data?: unknown,
    options?: FetchOptions
): Promise<T> {
    return apiFetch<T>(path, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
    })
}

// DELETE 请求
export function apiDelete<T = unknown>(
    path: string,
    data?: unknown,
    options?: FetchOptions
): Promise<T> {
    return apiFetch<T>(path, {
        method: 'DELETE',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
    })
}

// PUT 请求
export function apiPut<T = unknown>(
    path: string,
    data?: unknown,
    options?: FetchOptions
): Promise<T> {
    return apiFetch<T>(path, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
    })
}
