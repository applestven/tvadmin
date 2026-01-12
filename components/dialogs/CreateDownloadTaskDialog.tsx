'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'

interface CreateDownloadTaskDialogProps {
  onSubmit: (url: string, quality: string) => Promise<void>
  loading?: boolean
}

const QUALITY_OPTIONS = [
  { value: 'video_best', label: '最佳视频' },
  { value: 'video_low', label: '低质量视频' },
  { value: 'audio_best', label: '最佳音频' },
  { value: 'audio_low', label: '低质量音频' },
]

export function CreateDownloadTaskDialog({ onSubmit, loading }: CreateDownloadTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState('audio_best')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('请输入视频链接')
      return
    }

    // 简单的 URL 验证
    try {
      new URL(url)
    } catch {
      setError('请输入有效的 URL')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await onSubmit(url.trim(), quality)
      // 成功后重置表单并关闭对话框
      setUrl('')
      setQuality('audio_best')
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建任务失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // 关闭时重置表单
      setUrl('')
      setQuality('audio_best')
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建任务
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新建下载任务</DialogTitle>
          <DialogDescription>
            输入视频链接，选择下载质量，系统将自动下载视频
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">视频链接</Label>
            <Input
              id="url"
              placeholder="https://www.bilibili.com/video/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError(null)
              }}
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              支持 B站、YouTube 等主流视频平台
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quality">下载质量</Label>
            <Select value={quality} onValueChange={setQuality} disabled={submitting}>
              <SelectTrigger>
                <SelectValue placeholder="选择下载质量" />
              </SelectTrigger>
              <SelectContent>
                {QUALITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || loading}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                创建中...
              </>
            ) : (
              '创建任务'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
