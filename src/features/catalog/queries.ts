import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { fetchNft, fetchNfts } from './api'
import type { CatalogSearch } from './schemas'

export const nftKeys = {
  all: ['nfts'] as const,
  list: (params: CatalogSearch) => [...nftKeys.all, 'list', params] as const,
  detail: (id: string) => [...nftKeys.all, 'detail', id] as const,
}

export const nftListQuery = (params: CatalogSearch) =>
  queryOptions({
    queryKey: nftKeys.list(params),
    queryFn: ({ signal }) => fetchNfts(params, signal), // signal cancela respostas obsoletas
    placeholderData: keepPreviousData,
  })

export const nftDetailQuery = (id: string) =>
  queryOptions({
    queryKey: nftKeys.detail(id),
    queryFn: ({ signal }) => fetchNft(id, signal),
  })