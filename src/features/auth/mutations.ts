import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mergeGuestCart } from '@/features/cart/merge'
import { clearAttempts } from '@/features/checkout/attempt'
import { login, logout, register } from './api'
import { clearPrivateCache } from './cache'
import { sessionKey } from './queries'
import type { AuthResponse } from './schemas'
import { clearToken, setToken } from './token'

function useStartSession() {
  const queryClient = useQueryClient()
  return async ({ user, token }: AuthResponse) => {
    clearPrivateCache(queryClient) // nada do usuário anterior sobrevive
    setToken(token)
    queryClient.setQueryData(sessionKey, user)
    await mergeGuestCart(queryClient) // o modal só fecha depois de o carrinho estar mesclado
  }
}

export function useLogin() {
  const start = useStartSession()
  return useMutation({ mutationFn: login, onSuccess: start })
}

export function useRegister() {
  const start = useStartSession()
  return useMutation({ mutationFn: register, onSuccess: start })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => logout(),
    // Mesmo que a API falhe, o usuário sai localmente
    onSettled: () => {
      clearToken()
      clearAttempts()
      clearPrivateCache(queryClient)
      queryClient.setQueryData(sessionKey, null)
    },
  })
}