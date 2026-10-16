import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSession } from '@/features/auth/queries'
import { isApiError } from '@/lib/http'
import { addFavorite, removeFavorite } from './api'
import { favoritesKey } from './queries'
import type { FavoritesResponse } from './schemas'

const MUTATION_KEY = ['favorites', 'toggle'] as const

function withFavorite(old: FavoritesResponse, nftId: string, favorite: boolean): FavoritesResponse {
  const items = old.items.filter((item) => item.nftId !== nftId)
  return { items: favorite ? [...items, { nftId, addedAt: new Date().toISOString() }] : items }
}

export function useToggleFavorite(nftId: string) {
  const queryClient = useQueryClient()
  const { user } = useSession()
  const userId = user?.id

  const patch = (favorite: boolean) => {
    if (!userId) return
    queryClient.setQueryData<FavoritesResponse>(favoritesKey(userId), (old) =>
      old ? withFavorite(old, nftId, favorite) : old,
    )
  }

  return useMutation({
    mutationKey: MUTATION_KEY,
    scope: { id: `favorite:${nftId}` }, // cliques rápidos no mesmo NFT chegam ao servidor em ordem
    mutationFn: async ({ favorite }: { favorite: boolean }) => {
      if (favorite) await addFavorite(nftId)
      else await removeFavorite(nftId)
    },

    onMutate: async ({ favorite }) => {
      if (userId) {
        // Evita que uma consulta em andamento sobrescreva o estado otimista
        await queryClient.cancelQueries({ queryKey: favoritesKey(userId) })
      }
      patch(favorite) // atualização otimista: a tela muda antes da resposta
    },

    onError: (error, { favorite }) => {
      patch(!favorite) // rollback: desfaz só este item, sem mexer nos outros
      // 401 já é tratado pelo fluxo global de sessão expirada (aviso + login)
      if (!(isApiError(error) && error.status === 401)) {
        toast.error('Não foi possível atualizar seus favoritos. A alteração foi desfeita.')
      }
    },

    onSettled: () => {
      // Reconcilia com o servidor, mas só quando esta é a última alteração em andamento
      if (userId && queryClient.isMutating({ mutationKey: MUTATION_KEY }) === 1) {
        void queryClient.invalidateQueries({ queryKey: favoritesKey(userId) })
      }
    },
  })
}