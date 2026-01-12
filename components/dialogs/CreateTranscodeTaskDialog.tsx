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

interface CreateTranscodeTaskDialogProps {
  onSubmit: (url: string, quality: string, language: string) => Promise<void>
  loading?: boolean
}

const QUALITY_OPTIONS = [
  { value: 'tiny', label: 'Tiny (最快)' },
  { value: 'base', label: 'Base' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium (推荐)' },
  { value: 'large', label: 'Large (最准确)' },
]

const LANGUAGE_OPTIONS = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英语' },
  { value: 'ja', label: '日语' },
  { value: 'ko', label: '韩语' },
  { value: 'auto', label: '自动检测' },
]

export function CreateTranscodeTaskDialog({ onSubmit, loading }: CreateTranscodeTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState('small')
  const [language, setLanguage] = useState('zh')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('请输入音视频文件链接')
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
      await onSubmit(url.trim(), quality, language)
      // 成功后重置表单并关闭对话框
      setUrl('')
      setQuality('small')
      setLanguage('zh')
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
      setQuality('small')
      setLanguage('zh')
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
          <DialogTitle>新建转写任务</DialogTitle>
          <DialogDescription>
            输入音视频文件链接，选择模型质量和语言，系统将自动进行语音转文字
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">音视频文件链接</Label>
            <Input
              id="url"
              placeholder="http://192.168.191.168:3456/downloads/example.mp3"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError(null)
              }}
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              支持 MP3、MP4、WAV 等常见音视频格式
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quality">模型质量</Label>
              <Select value={quality} onValueChange={setQuality} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue placeholder="选择模型质量" />
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
            <div className="space-y-2">
              <Label htmlFor="language">语言</Label>
              <Select value={language} onValueChange={setLanguage} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue placeholder="选择语言" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
