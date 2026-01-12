'use client'

import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNetworkStore } from '@/store/networkStore'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const { mode, health } = useNetworkStore()

  const isHealthy = mode === 'public'
    ? health.tv.public && health.dv.public
    : health.tv.private && health.dv.private

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">TV Admin 后台管理系统</h1>
        <Badge variant={isHealthy ? 'success' : 'destructive'}>
          {mode === 'public' ? '公网' : '内网'}
          {isHealthy ? ' - 正常' : ' - 异常'}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
