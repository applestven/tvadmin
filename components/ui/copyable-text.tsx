'use client'

import { useState, useCallback } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CopyableTextProps {
  text: string
  displayText?: string
  className?: string
  maxLength?: number
}

export function CopyableText({ text, displayText, className, maxLength = 8 }: CopyableTextProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }, [text])

  // 截断显示文本
  const truncatedText = displayText || (text.length > maxLength ? `${text.slice(0, maxLength)}...` : text)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 cursor-pointer hover:text-primary transition-colors group relative',
        className
      )}
      onClick={handleCopy}
      title={`点击复制: ${text}`}
    >
      <span className="truncate">{truncatedText}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-50 flex-shrink-0 transition-opacity" />
      )}
      {copied && (
        <span className="absolute -top-7 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
          已复制
        </span>
      )}
    </span>
  )
}
