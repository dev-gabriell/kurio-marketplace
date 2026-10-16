import type { QueryClient } from '@tanstack/react-query'

/** Só o catálogo é público. Todo o resto (favoritos, carrinho, pedidos…) é privado. */
const PUBLIC_KEYS = new Set(['nfts'])

/**
 * Remove os dados privados do usuário anterior.
 * A query da sessão fica de fora: quem chama atualiza o valor dela com setQueryData,
 * e assim os componentes que a observam (como o header) re-renderizam na hora.
 */
export function clearPrivateCache(queryClient: QueryClient) {
  queryClient.removeQueries({
    predicate: (query) => {
      const root = String(query.queryKey[0])
      return root !== 'session' && !PUBLIC_KEYS.has(root)
    },
  })
}