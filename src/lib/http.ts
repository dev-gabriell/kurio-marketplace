import axios, { isAxiosError } from 'axios'
import { getToken } from '@/features/auth/token'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Não dispara o fluxo global de "sessão expirada" quando a resposta é 401. */
    skipSessionExpired?: boolean
  }
}

export interface ApiError {
  status: number | null // null = falha de conexão/timeout
  code: string
  message: string
  fields?: Record<string, string>
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

let onSessionExpired: (() => void) | null = null
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler
}

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Requisição cancelada (resposta obsoleta): deixa o Query tratar
    if (axios.isCancel(error) || !isAxiosError(error)) return Promise.reject(error)

    const data = error.response?.data as
      | { code?: string; message?: string; fields?: Record<string, string> }
      | undefined

    const apiError: ApiError = {
      status: error.response?.status ?? null,
      code:
        data?.code ??
        (error.response ? 'http_error' : error.code === 'ECONNABORTED' ? 'timeout' : 'network_error'),
      message: data?.message ?? error.message,
      fields: data?.fields,
    }

    const lostSession =
      apiError.status === 401 &&
      (apiError.code === 'session_expired' || apiError.code === 'unauthenticated')
    if (lostSession && !error.config?.skipSessionExpired && getToken()) {
      onSessionExpired?.()
    }
    return Promise.reject(apiError)
  },
)

export const isApiError = (e: unknown): e is ApiError =>
  typeof e === 'object' && e !== null && 'code' in e && 'status' in e