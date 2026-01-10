import type { 
  TvTask, 
  TvTaskQueryParams, 
  DownloadRequest, 
  DownloadResponse,
  RunningTasksResponse,
  TvStats 
} from '~/types/tv'
import type { ApiResponse } from '~/types/api'

/**
 * TV API (下载服务) 封装
 */
export function useTvApi() {
  const api = useApi()
  
  /**
   * 获取任务列表 (多条件查询)
   */
  async function queryTasks(params: TvTaskQueryParams = {}) {
    return await api.post<ApiResponse<TvTask[]>>('/tv/tasks/query', params)
  }
  
  /**
   * 获取任务详情
   */
  async function getTask(id: string) {
    return await api.get<TvTask>(`/tv/task/${id}`)
  }
  
  /**
   * 提交下载任务
   */
  async function submitDownload(data: DownloadRequest) {
    return await api.post<DownloadResponse>('/tv/download', data)
  }
  
  /**
   * 获取运行中的任务
   */
  async function getRunningTasks() {
    return await api.get<RunningTasksResponse>('/tv/c')
  }
  
  /**
   * 获取统计数据
   */
  async function getStats(): Promise<TvStats> {
    // 通过查询不同状态的任务来统计
    const [successRes, failedRes, runningRes, pendingRes] = await Promise.all([
      queryTasks({ filters: { status: 'success' }, page: 1, limit: 1 }),
      queryTasks({ filters: { status: 'failed' }, page: 1, limit: 1 }),
      queryTasks({ filters: { status: 'running' }, page: 1, limit: 1 }),
      queryTasks({ filters: { status: 'pending' }, page: 1, limit: 1 }),
    ])
    
    // 从响应中获取 total 或使用 data 长度
    const getTotal = (res: any) => res?.total ?? res?.data?.length ?? 0
    
    return {
      totalTasks: getTotal(successRes) + getTotal(failedRes) + getTotal(runningRes) + getTotal(pendingRes),
      successTasks: getTotal(successRes),
      failedTasks: getTotal(failedRes),
      runningTasks: getTotal(runningRes),
      pendingTasks: getTotal(pendingRes),
    }
  }
  
  return {
    queryTasks,
    getTask,
    submitDownload,
    getRunningTasks,
    getStats,
  }
}
