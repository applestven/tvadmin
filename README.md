# TV Admin 后台管理系统

基于 Next.js 14 + shadcn/ui 构建的后台管理系统，用于管理视频下载（TV）和语音转文字（DV）任务。

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式系统**: TailwindCSS 3+
- **图表**: ECharts 5.5.1 + echarts-for-react
- **语言**: TypeScript 5.7+
- **状态管理**: Zustand
- **表单**: React Hook Form + Zod

## 功能特性

- 📊 仪表盘 - 系统运行状态概览
- 📥 下载管理 - TV 视频下载任务管理
- 🎤 转译管理 - DV 语音转文字任务管理
- 📋 日志监控 - 实时服务日志查看
- 🌐 网络切换 - 公网/内网自动切换

## 开始使用

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3000

### 生产构建

```bash
pnpm build
pnpm start
```

## 项目结构

```
admin-panel/
├── app/                    # Next.js App Router 页面
│   ├── api/               # API Route Handlers (代理)
│   ├── dashboard/         # 仪表盘页面
│   ├── download/          # 下载管理页面
│   ├── transcode/         # 转译管理页面
│   └── logs/              # 日志监控页面
├── components/            # React 组件
│   ├── charts/           # 图表组件
│   ├── layout/           # 布局组件
│   ├── logs/             # 日志组件
│   └── ui/               # shadcn/ui 组件
├── hooks/                 # 自定义 Hooks
├── lib/                   # 工具库
├── store/                 # Zustand Store
├── styles/               # 全局样式
└── types/                # TypeScript 类型定义
```

## API 配置

系统支持公网/内网双 API 自动切换：

| 服务 | 公网                           | 内网                        |
| ---- | ------------------------------ | --------------------------- |
| TV   | http://139.199.192.179:8686/tv | http://192.168.191.168:6789 |
| DV   | http://139.199.192.179:8686/dv | http://192.168.191.168:3456 |

所有 API 请求通过 Next.js Route Handlers 转发，避免 CORS 问题。

## 许可证

MIT
