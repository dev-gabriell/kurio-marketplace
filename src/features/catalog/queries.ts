import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { isApiError } from '@/lib/http'
import { fetchFeaturedNft, fetchNft, fetchNfts } from './api'
import type { CatalogSearch } from './schemas'

export const nftKeys = {
  all: ['nfts'] as const,
  list: (params: CatalogSearch) => [...nftKeys.all, 'list', params] as const,
  featured: () => [...nftKeys.all, 'featured'] as const,
  detail: (id: string) => [...nftKeys.all, 'detail', id] as const,
}

export const nftListQuery = (params: CatalogSearch) =>
  queryOptions({
    queryKey: nftKeys.list(params),
    queryFn: ({ signal }) => fetchNfts(params, signal),
    placeholderData: keepPreviousData,
  })

export const featuredNftQuery = () =>
  queryOptions({
    queryKey: nftKeys.featured(),
    queryFn: ({ signal }) => fetchFeaturedNft(signal),
  })

export const nftDetailQuery = (id: string) =>
  queryOptions({
    queryKey: nftKeys.detail(id),
    queryFn: ({ signal }) => fetchNft(id, signal),
    // 404 é definitivo: não adianta tentar de novo
    retry: (failureCount, error) =>
      !(isApiError(error) && error.status === 404) && failureCount < 1,
  })