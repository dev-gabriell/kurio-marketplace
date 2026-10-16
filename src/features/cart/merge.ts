import type { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mergeCart } from './api'
import { clearGuestCartId, getGuestCartId } from './guest'
import { cartRoot } from './queries'

/** Traz o carrinho do visitante para a conta recém-autenticada. */
export async function mergeGuestCart(queryClient: QueryClient) {
  const guestCartId = getGuestCartId()
  if (!guestCartId) return

  try {
    const result = await mergeCart(guestCartId)
    clearGuestCartId()
    if (result.adjusted > 0) toast('Alguns itens do carrinho foram ajustados à disponibilidade.')
  } catch {
    // O login não falha por causa disso; o carrinho de visitante continua guardado
    toast.error('Não foi possível trazer o carrinho de visitante para a sua conta.')
  } finally {
    await queryClient.invalidateQueries({ queryKey: cartRoot })
  }
}