import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/auth/queries'
import { createRealtime } from './client'

/** Uma conexão por sessão: login, logout, troca de usuário ou expiração a recriam do zero. */
export function useRealtime() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { user, isPending } = useSession()
  const userId = user?.id ?? null

  useEffect(() => {
    if (isPending) return
    const realtime = createRealtime({
      queryClient,
      userId,
      openOrder: (id) => void router.navigate({ to: '/pedido/$id', params: { id } }),
    })
    return () => realtime.stop()
  }, [queryClient, router, userId, isPending])
}