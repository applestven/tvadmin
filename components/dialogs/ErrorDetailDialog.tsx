'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AlertCircle } from 'lucide-react'

interface ErrorDetailDialogProps {
  error: string
  taskId?: string
}

export function ErrorDetailDialog({ error, taskId }: ErrorDetailDialogProps) {
  const [open, setOpen] = useState(false)

  // 截断显示的错误文本
  const truncatedError = error.length > 20 ? `${error.slice(0, 20)}...` : error

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 text-destructive hover:text-destructive hover:bg-destructive/10 font-normal text-xs max-w-[150px] truncate"
          title="点击查看完整错误信息"
        >
          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{truncatedError}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            错误详情
          </DialogTitle>
          {taskId && (
            <DialogDescription>
              任务 ID: {taskId}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="mt-4">
          <pre className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive overflow-auto max-h-[400px] whitespace-pre-wrap break-words">
            {error}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  )
}
