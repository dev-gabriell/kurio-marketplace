import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/features/auth/queries'
import { fetchCart, fetchQuote } from './api'

export const cartRoot = ['cart'] as const
export const cartKey = (owner: string) => ['cart', owner] as const
export const quoteKey = (owner: string) => ['cart', owner, 'quote'] as const

/** Dono do carrinho: id do usuário ou "guest". Só consulta depois que a sessão foi resolvida. */
function useCartOwner() {
  const { user, isPending } = useSession()
  return { owner: user?.id ?? 'guest', ready: !isPending }
}

export function useCart() {
  const { owner, ready } = useCartOwner()
  return useQuery({
    queryKey: cartKey(owner),
    queryFn: ({ signal }) => fetchCart(signal),
    enabled: ready,
  })
}

export function useCartQuote() {
  const { owner, ready } = useCartOwner()
  return useQuery({
    queryKey: quoteKey(owner),
    queryFn: ({ signal }) => fetchQuote(signal),
    enabled: ready,
    staleTime: 0, // a cotação é sempre revalidada ao abrir o carrinho
  })
}

export function useCartCount() {
  const { data } = useCart()
  return data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0
}