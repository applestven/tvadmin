"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDvApi } from "@/hooks";
import {
  getStatusColor,
  getStatusText,
  formatDate,
  formatDuration,
} from "@/lib/utils";
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Trash2,
  Download,
  Copy,
} from "lucide-react";
import type { DvTask } from "@/types";

export default function TranscodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<DvTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [subtitleText, setSubtitleText] = useState("");
  const [subtitleLoading, setSubtitleLoading] = useState(false);
  const [subtitleError, setSubtitleError] = useState<string | null>(null);

  const { getTaskDetail, cancelTask } = useDvApi();

  const fetchTask = async () => {
    setLoading(true);
    try {
      const data = await getTaskDetail(params?.id as string);
      if (data) {
        setTask(data);
      }
    } catch (error) {
      console.error("Failed to fetch task:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOutputName = (t?: DvTask | null) =>
    t?.output_name || (t as any)?.outputName;
  const getLocation = (t?: DvTask | null) =>
    (t?.location ?? "").replace(/\/$/, "");
  const getSrtDownloadUrl = (t?: DvTask | null) => {
    const loc = getLocation(t);
    const out = getOutputName(t);
    if (!loc || !out) return "";
    return `${loc}:6789/static/${out}`;
  };
  const getSrtToTxtUrl = (t?: DvTask | null) => {
    const loc = getLocation(t);
    const out = getOutputName(t);
    if (!loc || !out) return "";
    return `${loc}:6789/tts/srt-to-txt?file=${encodeURIComponent(out)}`;
  };

  const fetchSubtitleText = async (t?: DvTask | null) => {
    const url = getSrtToTxtUrl(t ?? task);
    if (!url) return;
    setSubtitleLoading(true);
    setSubtitleError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("srt to txt failed");
      const txt = await res.text();
      setSubtitleText(txt ?? "");
    } catch (e: any) {
      console.error("Failed to fetch subtitle text:", e);
      setSubtitleError(e?.message || "获取字幕文本失败");
    } finally {
      setSubtitleLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchTask();
    }
  }, [params?.id]);

  useEffect(() => {
    if (task?.status === "running" || task?.status === "queued") {
      const interval = setInterval(fetchTask, 5000);
      return () => clearInterval(interval);
    }
  }, [task?.status]);

  useEffect(() => {
    if (
      task?.status === "success" &&
      getOutputName(task) &&
      getLocation(task)
    ) {
      fetchSubtitleText(task);
    }
  }, [task?.status, task?.output_name, task?.location]);

  const handleCancel = async () => {
    if (!task) return;
    if (confirm("确定要取消这个任务吗？")) {
      try {
        await cancelTask(task.id);
        fetchTask();
      } catch (error) {
        console.error("Failed to cancel task:", error);
      }
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(subtitleText || "");
    } catch (e) {
      console.error("复制失败", e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground mb-4">任务不存在</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>
    );
  }

  const duration =
    task.finishedAt && task.startedAt
      ? formatDuration(task.finishedAt - task.startedAt)
      : "-";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">转译任务详情</h2>
            <p className="text-muted-foreground font-mono text-sm">{task.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(task.status === "pending" || task.status === "queued") && (
            <Button variant="destructive" onClick={handleCancel}>
              <Trash2 className="mr-2 h-4 w-4" />
              取消任务
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={fetchTask}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {task.status === "running" && task.progress !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>转译进度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={task.progress} className="h-4" />
              <p className="text-center text-sm font-medium">
                {task.progress}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>任务的基本配置信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">状态</span>
              <Badge className={getStatusColor(task.status)}>
                {getStatusText(task.status)}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">模型质量</span>
              <Badge variant="outline">{task.quality}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">执行位置</span>
              <span>{task.location || "-"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">语言</span>
              <span>{task.languageArray || "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>时间信息</CardTitle>
            <CardDescription>任务执行时间记录</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">创建时间</span>
              <span>{task.createdAt ? formatDate(task.createdAt) : "-"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">开始时间</span>
              <span>{task.startedAt ? formatDate(task.startedAt) : "-"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">完成时间</span>
              <span>{task.finishedAt ? formatDate(task.finishedAt) : "-"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">执行时长</span>
              <span>{duration}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>URL 信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-muted-foreground text-sm">源 URL</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 rounded bg-muted p-2 text-sm break-all">
                  {task.url}
                </code>
                <a href={task.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
            {task.output && (
              <div>
                <span className="text-muted-foreground text-sm">输出结果</span>
                <code className="block rounded bg-muted p-2 text-sm mt-1 break-all whitespace-pre-wrap">
                  {task.output}
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        {task.status === "success" &&
          getOutputName(task) &&
          getLocation(task) && (
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>字幕与文本</CardTitle>
                  <CardDescription>
                    下载字幕文件并查看提取的文本
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <a href={getSrtDownloadUrl(task)} download>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" /> 下载字幕
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    onClick={() => fetchSubtitleText(task)}
                    disabled={subtitleLoading}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${
                        subtitleLoading ? "animate-spin" : ""
                      }`}
                    />{" "}
                    刷新文本
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopyText}
                    disabled={!subtitleText}
                  >
                    <Copy className="mr-2 h-4 w-4" /> 复制文本
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subtitleError && (
                    <p className="text-sm text-destructive">{subtitleError}</p>
                  )}
                  <ScrollArea className="h-48 rounded border p-3 bg-muted/30">
                    <pre className="whitespace-pre-wrap text-sm">
                      {subtitleLoading
                        ? "加载中..."
                        : subtitleText || "暂无文本"}
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          )}

        {task.error && (
          <Card className="md:col-span-2 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">错误信息</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="rounded bg-destructive/10 p-4 text-sm text-destructive overflow-auto">
                {task.error}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
