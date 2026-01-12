# TV Admin 后台管理系统设计文档（Next.js + shadcn/ui 版本）

---

## 项目概述

TV Admin 是一个基于 **Next.js（App Router）** 的后台管理系统，用于管理视频下载（TV）和语音转文字（DV）任务，支持公网与内网 API 自动切换。

系统专为运维人员和系统管理员设计，提供统一的 Web 界面来管理：

- TV 下载服务任务状态
- DV 转译服务任务状态
- 实时日志监控
- 系统健康检查

该版本专门针对 **AI 辅助开发优化**，强调：

- 组件可读性强
- 事件模型简单
- 样式零冲突
- 可维护性高

---

## 技术架构

### 技术栈

| 分类     | 技术选型                          |
| -------- | --------------------------------- |
| 框架     | Next.js 14+（App Router）         |
| UI 组件  | shadcn/ui（基于 Radix UI）        |
| 样式系统 | TailwindCSS 3+                    |
| 图表     | ECharts 5.5.1 + echarts-for-react |
| 语言     | TypeScript 5.7+                   |
| 状态管理 | Zustand                           |
| 表单     | React Hook Form + Zod             |
| 构建工具 | Turbopack / Webpack（Next 内置）  |
| 包管理   | pnpm                              |

---

### 架构图

```
浏览器 (Next.js SSR/CSR)
        ↓
Next.js Server (Route Handlers)
        ↓
TV / DV 服务
        ↑
   代理转发 (Proxy)
```

所有 API 请求统一通过 **Next.js Route Handlers** 转发，实现：

- 规避 CORS
- API 地址隔离
- 公网 / 内网自动切换

---

## 网络配置

系统支持公网 / 内网双 API 自动切换机制：

| 服务 | 公网                         | 内网                        |
| ---- | ---------------------------- | --------------------------- |
| TV   | http://43.139.236.50:8686/tv | http://192.168.191.168:6789 |
| DV   | http://43.139.236.50:8686/dv | http://192.168.191.168:3456 |

切换策略：

1. 优先使用公网
2. 公网超时或不可达 → 自动切换内网
3. 定时健康检测恢复公网

---

## 代理配置（Next.js Route Handlers）

| 前端请求    | 代理目标    |
| ----------- | ----------- |
| /api/tv/*   | TV 下载服务 |
| /api/dv/*   | DV 转译服务 |
| /api/health | 健康检查    |

实现位置：

```
app/api/tv/[...path]/route.ts
app/api/dv/[...path]/route.ts
app/api/health/route.ts
```

---

## 项目结构（Next.js App Router）

```
admin-panel/
├── app/
│   ├── api/
│   │   ├── tv/[...path]/route.ts
│   │   ├── dv/[...path]/route.ts
│   │   └── health/route.ts
│   ├── dashboard/page.tsx
│   ├── download/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── transcode/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── logs/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── charts/
│   │   ├── StatsCards.tsx
│   │   └── TrafficChart.tsx
│   ├── logs/
│   │   └── LogContainer.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ui/ (shadcn/ui components)
├── hooks/
│   ├── useNetworkStatus.ts
│   ├── useTvApi.ts
│   └── useDvApi.ts
├── lib/
│   ├── api-client.ts
│   ├── api-config.ts
│   ├── proxy.ts
│   └── error-handler.ts
├── store/
│   └── networkStore.ts
├── types/
│   ├── api.ts
│   ├── tv.ts
│   └── dv.ts
├── styles/
│   └── globals.css
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

---

## 页面设计

### 仪表盘（Dashboard）

功能：

- TV / DV 任务统计卡片
- 饼图展示任务分布
- 实时运行任务列表
- 30 秒自动刷新

组件：

- StatsCards
- TrafficChart

---

### 下载管理页面（TV）

功能：

- 任务筛选（ID / URL / 状态 / 质量）
- 列表展示
- 任务详情页
- 状态实时刷新

---

### 转译管理页面（DV）

功能：

- 状态筛选
- 模型质量筛选
- 队列监控
- 详情页

---

### 日志监控页面

功能：

- 多容器日志布局
- 实时滚动
- 底部控制面板
- 服务器选择

布局规则：

| 容器数量 | 布局  |
| -------- | ----- |
| 1        | 100%  |
| 2        | 50%   |
| 3        | 25%   |
| 5        | 16.6% |
| 7        | 11.1% |
| ≥12      | 8.3%  |

通过 Tailwind Grid 动态计算列数。

---

## 类型定义

### TV 任务类型

```ts
export type TvTaskStatus = 'pending' | 'running' | 'success' | 'failed'

export type VideoQuality = 'video_best' | 'audio_best' | 'video_worst' | 'audio_worst'

export interface TvTask {
  id: string
  url: string
  quality: VideoQuality
  status: TvTaskStatus
  location?: string
  createdAt: number
  startedAt?: number
  finishedAt?: number
  strategy?: string
  output?: string
  outputName?: string
  error?: string
}
```

---

### DV 任务类型

```ts
export type DvTaskStatus = 'pending' | 'queued' | 'running' | 'success' | 'failed'

export type ModelQuality = 'tiny' | 'base' | 'small' | 'medium' | 'large'

export interface DvTask {
  id: string
  url: string
  quality: ModelQuality
  status: DvTaskStatus
  location?: string
  languageArray?: string
  createdAt?: number
  startedAt?: number
  finishedAt?: number
  progress?: number
  output?: string
  error?: string
}
```

---

### 通用 API 类型

```ts
export interface ApiResponse<T = any> {
  code?: number
  data?: T
  message?: string
}

export interface PaginatedResponse<T> {
  code: number
  data: T[]
  total: number
  page: number
  pageSize: number
  message?: string
}
```

---

## 网络与 API Hook 设计

### useNetworkStatus

功能：

- 健康检查
- 公网 / 内网切换
- 状态存入 Zustand
- 30 秒轮询

---

### useTvApi

功能：

- getTasks
- getTaskDetail
- getStats
- retryTask

统一调用：

```ts
apiFetch('/api/tv/...')
```

---

### useDvApi

同 TV API 封装规范。

---

## API 客户端封装

```ts
export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  })

  if (!res.ok) throw new Error('Request failed')

  return res.json()
}
```

---

## 运行命令

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm lint
```

默认端口：3000

---

## 部署配置

支持：

- Node SSR 部署
- Docker 部署
- Vercel / 自建服务器

需要配置：

- 公网 / 内网 API 地址
- 健康检测超时

---

## 安全设计

- 所有真实 API 仅存在于服务端
- 前端仅访问 /api/*
- 防止内网地址泄露
- 可加入 Token 鉴权

---

## 性能优化

- React Server Components
- 动态 import
- 数据缓存
- 图表懒加载
- 日志分页 / 虚拟滚动

---

## AI 开发规范（强烈建议）

> 技术栈：Next.js App Router + TypeScript + Tailwind + shadcn/ui
>
> 规则：
> - 只允许使用 shadcn/ui 组件
> - 禁止使用其他 UI 库
> - 禁止内联事件函数
> - 所有请求使用 apiFetch
> - 不允许写死 API 地址

---

## 结论

该技术方案具备：

- 高稳定性
- 高 AI 代码正确率
- 零样式冲突
- 易维护
- 易扩展

非常适合：

- 运维平台
- AI 工具后台
- 日志系统
- 多服务调度平台

---

如需：

- 项目初始化脚本
- 目录模板
- API 代理示例代码
- 网络切换完整实现
- shadcn 后台 UI Layout 示例

可继续提出，我可以提供完整工程级模板。

