import { proxyRequest } from '../../utils/proxy'

export default defineEventHandler(async (event) => {
  const method = event.method
  const path = '/' + (getRouterParam(event, '_') || '')
  const query = getQuery(event) as Record<string, string>
  
  let body = undefined
  if (!['GET', 'HEAD'].includes(method)) {
    body = await readBody(event)
  }
  
  const result = await proxyRequest({
    service: 'dv',
    path,
    method,
    body,
    query,
  })
  
  setResponseStatus(event, result.status)
  return result.data
})
