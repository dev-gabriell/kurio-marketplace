import type { QueryClient } from '@tanstack/react-query'

/** Só o catálogo é público. Todo o resto (sessão, favoritos, carrinho, pedidos…) é privado. */
const PUBLIC_KEYS = new Set(['nfts'])

export function clearPrivateCache(queryClient: QueryClient) {
  queryClient.removeQueries({ predicate: (q) => !PUBLIC_KEYS.has(String(q.queryKey[0])) })
}