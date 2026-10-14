import { cmp } from '@/lib/money'
import type { CatalogSearch, Nft, NftDetail, NftList } from '@/features/catalog/schemas'
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

// ---------- Detalhe (determinístico: derivado do id) ----------

const ATTRIBUTES = ['Óculos', 'Esmeralda', 'Raro', 'Chapéu', 'Fones', 'Dourado', 'Jaqueta', 'Neon', 'Único']
const REVIEWERS = ['Marina C.', 'Lucas P.', 'Aiko T.']
const REVIEW_TEXTS = [
  'Arte linda e entrega rápida. O registro de procedência deu confiança na compra.',
  'Os detalhes da obra ficam ainda melhores em alta resolução. Recomendo.',
  'Boa coleção e comunidade ativa. Já estou de olho nos próximos lançamentos.',
]

export function toDetail(n: Nft): NftDetail {
  const seed = Number(n.id.replace('nft-', ''))
  const soldOut = n.editions.available === 0
  const tokenNumber = n.name.split('#')[1] ?? String(seed)

  return {
    ...n,
    tokenId: `#${tokenNumber.padStart(4, '0')}`,
    description: `Um colecionável digital finalizado à mão da coleção ${n.collection}, verificado na ${n.network}, com arte desbloqueável e acesso para colecionadores.`,
    creator: 'Nova Sato',
    attributes: [...new Set([0, 3, 5].map((k) => ATTRIBUTES[(seed * (k + 1) + k) % ATTRIBUTES.length]))],
    gallery: [n.image, n.image, n.image, n.image],
    editionOptions: [
      { id: 'e-1-1', label: '1/1', available: soldOut || seed % 5 === 0 ? 0 : 1 },
      { id: 'e-1-10', label: '1/10', available: soldOut || seed % 3 === 0 ? 0 : 1 + (seed % 9) },
      { id: 'e-1-50', label: '1/50', available: soldOut ? 0 : n.editions.available },
      { id: 'e-open', label: 'ABERTA', available: soldOut ? 0 : 25 },
    ],
    rating: { average: 4 + (seed % 10) / 10, count: 5 + ((seed * 7) % 40) },
    reviews: REVIEWERS.map((author, i) => ({
      id: `${n.id}-r${i + 1}`,
      author,
      rating: 5 - ((seed + i) % 2),
      text: REVIEW_TEXTS[i],
      date: new Date(Date.UTC(2026, 8, 20 - i)).toISOString(),
    })),
    contract: {
      address: `0x${`7A42${seed.toString(16).padStart(32, '0')}19E8`.toUpperCase()}`,
      standard: 'ERC-721',
      royaltyPercent: 5,
    },
  }
}