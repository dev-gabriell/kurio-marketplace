import { http } from '@/lib/http'
import { nftDetailSchema, nftListSchema, nftSchema, type CatalogSearch } from './schemas'

export async function fetchNfts(params: CatalogSearch, signal?: AbortSignal) {
  const { data } = await http.get('/nfts', { params, signal })
  return nftListSchema.parse(data)
}

export async function fetchFeaturedNft(signal?: AbortSignal) {
  const { data } = await http.get('/nfts/featured', { signal })
  return nftSchema.parse(data)
}

export async function fetchNft(id: string, signal?: AbortSignal) {
  const { data } = await http.get(`/nfts/${encodeURIComponent(id)}`, { signal })
  return nftDetailSchema.parse(data)
}