"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  FileAudio,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import type { TvTaskStats, DvTaskStats } from "@/types";

interface StatsCardsProps {
  tvStats: TvTaskStats | null;
  dvStats: DvTaskStats | null;
  loading?: boolean;
}

export function StatsCards({ tvStats, dvStats, loading }: StatsCardsProps) {
  // tvStats = 下载任务统计 (DV 服务)
  // dvStats = 转译任务统计 (TV 服务)
  const downloadCards = [
    {
      title: "下载总数",
      value: tvStats?.total ?? 0,
      description: "DV 视频下载任务总量",
      icon: Download,
    },
    {
      title: "下载运行中",
      value: tvStats?.running ?? 0,
      description: "当前正在下载",
      icon: Loader2,
    },
    {
      title: "下载成功",
      value: tvStats?.success ?? 0,
      description: "完成的下载任务",
      icon: CheckCircle,
    },
  ];

  const transcodeCards = [
    {
      title: "转译总数",
      value: dvStats?.total ?? 0,
      description: "TV 语音转文字任务总量",
      icon: FileAudio,
    },
    {
      title: "转译等待/队列",
      value: (dvStats?.pending ?? 0) + (dvStats?.queued ?? 0),
      description: "队列中等待处理",
      icon: Clock,
    },
    {
      title: "转译失败",
      value: dvStats?.failed ?? 0,
      description: "执行失败的转译任务",
      icon: XCircle,
    },
  ];

  // 加载态骨架屏
  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-sm font-medium text-muted-foreground">
            下载指标
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <Card
                key={`dl-skel-${index}`}
                className="border-2 border-blue-500/50"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 animate-pulse rounded bg-muted mb-1" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-muted-foreground">
            转译指标
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <Card
                key={`ts-skel-${index}`}
                className="border-2 border-green-500/50"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 animate-pulse rounded bg-muted mb-1" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 下载指标（蓝色异色框） */}
      <div>
        <div className="mb-2 text-sm font-medium">下载指标</div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {downloadCards.map((card) => (
            <Card
              key={card.title}
              className="border-2 border-blue-500 shadow-[0_4px_12px_rgba(59,130,246,0.15)]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className="rounded-lg p-2 bg-blue-100">
                  <card.icon className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 转译指标（绿色异色框） */}
      <div>
        <div className="mb-2 text-sm font-medium">转译指标</div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {transcodeCards.map((card) => (
            <Card
              key={card.title}
              className="border-2 border-green-500 shadow-[0_4px_12px_rgba(16,185,129,0.15)]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className="rounded-lg p-2 bg-green-100">
                  <card.icon className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
