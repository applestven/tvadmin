import type { 
  DvTask, 
  DvTaskQueryParams, 
  CreateTaskRequest, 
  QueueStatus,
  ModelInfo,
  FileInfo,
  DvStats 
} from '~/types/dv'
import type { ApiResponse } from '~/types/api'

/**
 * DV API (转译服务) 封装
 */
export function useDvApi() {
  const api = useApi()
  
  /**
   * 获取任务列表
   */
  async function getTasks(params: DvTaskQueryParams = {}) {
    return await api.get<ApiResponse<DvTask[]>>('/dv/tts/tasks', params)
  }
  
  /**
   * 获取任务详情
   */
  async function getTask(id: string) {
    return await api.get<DvTask>(`/dv/tts/${id}`)
  }
  
  /**
   * 创建转写任务
   */
  async function createTask(data: CreateTaskRequest) {
    return await api.post('/dv/tts/task', data)
  }
  
  /**
   * 取消任务
   */
  async function cancelTask(id: string) {
    return await api.delete('/dv/tts/cancel', { id })
  }
  
  /**
   * 获取队列状态
   */
  async function getQueueStatus() {
    return await api.get<QueueStatus>('/dv/tts/queue/status')
  }
  
  /**
   * 获取模型列表
   */
  async function getModels() {
    return await api.get<ModelInfo[]>('/dv/tts/models')
  }
  
  /**
   * 获取文件列表
   */
  async function getFiles() {
    return await api.get<FileInfo[]>('/dv/file-manager/list')
  }
  
  /**
   * 删除文件
   */
  async function deleteFile(filename: string) {
    return await api.delete('/dv/file-manager/delete', { filename })
  }
  
  /**
   * 手动清理旧任务
   */
  async function cleanup() {
    return await api.post('/dv/tts/cleanup')
  }
  
  /**
   * SRT 转 TXT
   */
  async function srtToTxt(file: string) {
    return await api.get<string>('/dv/tts/srt-to-txt', { file })
  }
  
  /**
   * 获取统计数据
   */
  async function getStats(): Promise<DvStats> {
    try {
      const queueStatus = await getQueueStatus()
      return {
        totalTasks: (queueStatus?.pending || 0) + (queueStatus?.queued || 0) + 
                    (queueStatus?.running || 0) + (queueStatus?.completed || 0) + 
                    (queueStatus?.failed || 0),
        successTasks: queueStatus?.completed || 0,
        failedTasks: queueStatus?.failed || 0,
        runningTasks: queueStatus?.running || 0,
        queuedTasks: queueStatus?.queued || 0,
        pendingTasks: queueStatus?.pending || 0,
      }
    } catch (error) {
      console.error('获取 DV 统计数据失败:', error)
      return {
        totalTasks: 0,
        successTasks: 0,
        failedTasks: 0,
        runningTasks: 0,
        queuedTasks: 0,
        pendingTasks: 0,
      }
    }
  }
  
  return {
    getTasks,
    getTask,
    createTask,
    cancelTask,
    getQueueStatus,
    getModels,
    getFiles,
    deleteFile,
    cleanup,
    srtToTxt,
    getStats,
  }
}
