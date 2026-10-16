import { queryOptions, useQuery } from '@tanstack/react-query'
import { useSession } from '@/features/auth/queries'
import { fetchFavorites } from './api'

/** O id do usuário na chave isola o cache de cada conta. */
export const favoritesKey = (userId: string) => ['favorites', userId] as const

export const favoritesQuery = (userId: string) =>
  queryOptions({
    queryKey: favoritesKey(userId),
    queryFn: ({ signal }) => fetchFavorites(signal),
  })

/** Conjunto de ids favoritados pelo usuário logado (vazio e desligado para visitantes). */
export function useFavoriteIds() {
  const { user } = useSession()
  return useQuery({
    ...favoritesQuery(user?.id ?? ''),
    enabled: !!user,
    select: (data) => new Set(data.items.map((item) => item.nftId)),
  })
}