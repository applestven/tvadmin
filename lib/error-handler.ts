import { ApiError } from './api-client'

export interface ErrorInfo {
    message: string
    code?: number
    details?: unknown
}

export function handleApiError(error: unknown): ErrorInfo {
    if (error instanceof ApiError) {
        return {
            message: error.message,
            code: error.status,
            details: error.data,
        }
    }

    if (error instanceof Error) {
        return {
            message: error.message,
        }
    }

    return {
        message: '发生未知错误',
    }
}

export function formatErrorMessage(error: ErrorInfo): string {
    if (error.code) {
        return `错误 ${error.code}: ${error.message}`
    }
    return error.message
}
