import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
        return `${hours}小时${minutes % 60}分钟`
    }
    if (minutes > 0) {
        return `${minutes}分钟${seconds % 60}秒`
    }
    return `${seconds}秒`
}

export function truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str
    return str.slice(0, maxLength - 3) + '...'
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        queued: 'bg-blue-100 text-blue-800',
        running: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusText(status: string): string {
    const texts: Record<string, string> = {
        pending: '等待中',
        queued: '排队中',
        running: '运行中',
        success: '成功',
        failed: '失败',
    }
    return texts[status] || status
}
