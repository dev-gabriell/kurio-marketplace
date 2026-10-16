import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isApiError } from '@/lib/http'
import { addCartItem, applyCoupon, removeCartItem, removeCoupon, updateCartItem } from './api'
import { cartRoot } from './queries'
import type { AddItemInput } from './schemas'

function reportError(error: unknown) {
  // 401 já é tratado pelo fluxo global de sessão expirada (aviso + login)
  if (isApiError(error) && error.status === 401) return
  toast.error(isApiError(error) ? error.message : 'Algo deu errado. Tente novamente.')
}

/** Depois de qualquer alteração, carrinho e cotação são rebuscados do servidor. */
function useRefreshCart() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: cartRoot })
}

export function useAddToCart() {
  const refresh = useRefreshCart()
  return useMutation({
    mutationFn: (input: AddItemInput) => addCartItem(input),
    onError: reportError,
    onSettled: refresh,
  })
}

export function useUpdateCartItem(itemId: string) {
  const refresh = useRefreshCart()
  return useMutation({
    mutationFn: (quantity: number) => updateCartItem(itemId, quantity),
    scope: { id: `cart-item:${itemId}` }, // cliques rápidos chegam ao servidor em ordem
    onError: reportError,
    onSettled: refresh,
  })
}

export function useRemoveCartItem() {
  const refresh = useRefreshCart()
  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onError: reportError,
    onSettled: refresh,
  })
}

// Os erros de cupom aparecem no próprio formulário, então não disparam aviso global
export function useApplyCoupon() {
  const refresh = useRefreshCart()
  return useMutation({ mutationFn: (code: string) => applyCoupon(code), onSettled: refresh })
}

export function useRemoveCoupon() {
  const refresh = useRefreshCart()
  return useMutation({ mutationFn: () => removeCoupon(), onError: reportError, onSettled: refresh })
}