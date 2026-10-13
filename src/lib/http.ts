import axios, { isAxiosError } from 'axios'

export interface ApiError {
  status: number | null // null = falha de conexão/timeout
  code: string
  message: string
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      const data = error.response?.data as { code?: string; message?: string } | undefined
      const apiError: ApiError = {
        status: error.response?.status ?? null,
        code: data?.code ?? (error.response ? 'http_error' : 'network_error'),
        message: data?.message ?? error.message,
      }
      return Promise.reject(apiError)
    }
    return Promise.reject(error)
  },
)

export const isApiError = (e: unknown): e is ApiError =>
  typeof e === 'object' && e !== null && 'code' in e && 'status' in e