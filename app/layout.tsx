import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Sidebar, Header } from '@/components/layout'

export const metadata: Metadata = {
  title: 'TV Admin - 后台管理系统',
  description: '视频下载和语音转文字任务管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
