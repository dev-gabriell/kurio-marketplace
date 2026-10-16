import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/auth/queries'
import { fetchQuote } from '@/features/cart/api'
import { quoteKey } from '@/features/cart/queries'
import { isApiError } from '@/lib/http'
import { attemptFor, rememberOrder } from './attempt'
import {
  connectWallet,
  createOrder,
  disconnectWallet,
  fetchConnection,
  fetchOrder,
  fetchWallets,
} from './api'
import type { ConnectInput, OrderInput } from './schemas'

// O id do usuário nas chaves isola o cache de cada conta
export const walletsKey = (userId: string) => ['wallets', userId] as const
export const connectionKey = (userId: string) => ['wallet-connection', userId] as const
export const orderKey = (userId: string, id: string) => ['orders', userId, id] as const

export function useWallets() {
  const { user } = useSession()
  return useQuery({
    queryKey: walletsKey(user?.id ?? ''),
    queryFn: ({ signal }) => fetchWallets(signal),
    enabled: !!user,
  })
}

export function useConnection() {
  const { user } = useSession()
  return useQuery({
    queryKey: connectionKey(user?.id ?? ''),
    queryFn: ({ signal }) => fetchConnection(signal),
    enabled: !!user,
  })
}

/** Mesma chave da cotação do carrinho, mas sempre revalidada ao voltar para a aba. */
export function useCheckoutQuote() {
  const { user } = useSession()
  return useQuery({
    queryKey: quoteKey(user?.id ?? ''),
    queryFn: ({ signal }) => fetchQuote(signal),
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}

export function useOrder(id: string) {
  const { user } = useSession()
  return useQuery({
    queryKey: orderKey(user?.id ?? '', id),
    queryFn: ({ signal }) => fetchOrder(id, signal),
    enabled: !!user,
    // Enquanto pendente, consulta até chegar a um estado final (terminal)
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 1500 : false),
    retry: (count, error) =>
      !(isApiError(error) && (error.status === 403 || error.status === 404)) && count < 2,
  })
}

export function useConnectWallet(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ConnectInput) => connectWallet(input),
    onSuccess: (connection) => queryClient.setQueryData(connectionKey(userId), connection),
  })
}

export function useDisconnectWallet(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => disconnectWallet(),
    onSuccess: () => queryClient.setQueryData(connectionKey(userId), null),
  })
}

export function useCreateOrder(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: OrderInput) => {
      const attempt = attemptFor(userId, input)
      const order = await createOrder(input, attempt.key)
      rememberOrder(userId, attempt, order.id)
      return order
    },
    onSuccess: (order) => queryClient.setQueryData(orderKey(userId, order.id), order),
    retry: false, // nunca reenvia sozinho: quem decide é o usuário, pela mesma chave
  })
}