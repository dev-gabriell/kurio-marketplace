import { http } from '@/lib/http'
import { favoriteSchema, favoritesResponseSchema } from './schemas'

export async function fetchFavorites(signal?: AbortSignal) {
  const { data } = await http.get('/favorites', { signal })
  return favoritesResponseSchema.parse(data)
}

export async function addFavorite(nftId: string) {
  const { data } = await http.put(`/favorites/${encodeURIComponent(nftId)}`)
  return favoriteSchema.parse(data)
}

export async function removeFavorite(nftId: string) {
  await http.delete(`/favorites/${encodeURIComponent(nftId)}`)
}