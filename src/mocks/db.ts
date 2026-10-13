import { cmp } from '@/lib/money'
import type { CatalogSearch, Nft, NftList } from '@/features/catalog/schemas'
import { COLLECTIONS, NETWORKS, nftFixtures } from './fixtures/nfts'

export const PAGE_SIZE = 12
const NEW_SINCE = '2026-09-17T00:00:00.000Z'

type Skip = 'collection' | 'network' | undefined

function filterNfts(q: CatalogSearch, skip?: Skip): Nft[] {
  const term = q.q?.trim().toLowerCase()
  return nftFixtures.filter((n) => {
    if (term && !n.name.toLowerCase().includes(term)) return false
    if (skip !== 'collection' && q.collection && n.collection !== q.collection) return false
    if (skip !== 'network' && q.network && n.network !== q.network) return false
    if (q.minPrice && cmp(n.price, q.minPrice) < 0) return false
    if (q.maxPrice && cmp(n.price, q.maxPrice) > 0) return false
    if (q.tab === 'new' && n.createdAt < NEW_SINCE) return false
    if (q.tab === 'trending' && n.popularity < 70) return false
    return true
  })
}

const sorters: Record<CatalogSearch['sort'], (a: Nft, b: Nft) => number> = {
  recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
  price_asc: (a, b) => cmp(a.price, b.price),
  price_desc: (a, b) => cmp(b.price, a.price),
  popular: (a, b) => b.popularity - a.popularity,
}

function count(list: Nft[], key: 'collection' | 'network', names: readonly string[]) {
  return names.map((name) => ({ name, count: list.filter((n) => n[key] === name).length }))
}

export function queryNfts(q: CatalogSearch): NftList {
  const filtered = filterNfts(q).sort((a, b) => sorters[q.sort](a, b) || a.id.localeCompare(b.id))
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(q.page, totalPages)
  const prices = nftFixtures.map((n) => n.price).sort(cmp)
  return {
    items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    page,
    pageSize: PAGE_SIZE,
    total: filtered.length,
    totalPages,
    facets: {
      collections: count(filterNfts(q, 'collection'), 'collection', COLLECTIONS),
      networks: count(filterNfts(q, 'network'), 'network', NETWORKS),
      priceRange: { min: prices[0], max: prices[prices.length - 1] },
    },
  }
}

export const findNft = (id: string) => nftFixtures.find((n) => n.id === id)