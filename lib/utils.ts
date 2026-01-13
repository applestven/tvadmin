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
    if (typeof ms !== 'number' || isNaN(ms) || ms < 0) return '-'

    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

// 解析时间戳，支持字符串或数字
export function parseTimestamp(value: string | number | undefined | null): number | null {
    if (value === undefined || value === null) return null
    const num = typeof value === 'string' ? parseInt(value, 10) : value
    return isNaN(num) ? null : num
}

// 计算处理时间（结束时间 - 开始时间），返回格式化的时分秒
export function getProcessingTime(
    startedAt: string | number | undefined | null,
    finishedAt: string | number | undefined | null
): string {
    const start = parseTimestamp(startedAt)
    const end = parseTimestamp(finishedAt)
    if (start === null || end === null) return '-'
    return formatDuration(end - start)
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
