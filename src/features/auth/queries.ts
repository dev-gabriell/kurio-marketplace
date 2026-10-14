import { queryOptions, useQuery } from '@tanstack/react-query'
import { isApiError } from '@/lib/http'
import { fetchSession } from './api'
import { clearToken, getToken } from './token'

export const sessionKey = ['session'] as const

export const sessionQuery = () =>
  queryOptions({
    queryKey: sessionKey,
    queryFn: async ({ signal }) => {
      if (!getToken()) return null
      try {
        const { user } = await fetchSession(signal)
        return user
      } catch (error) {
        // Token inválido ou expirado: volta a ser visitante, sem alarde
        if (isApiError(error) && error.status === 401) {
          clearToken()
          return null
        }
        throw error // falha de rede/servidor não derruba a sessão
      }
    },
    staleTime: 5 * 60_000,
    retry: (count, error) => !(isApiError(error) && error.status === 401) && count < 1,
  })

export function useSession() {
  const { data, isPending } = useQuery(sessionQuery())
  return { user: data ?? null, isPending }
}