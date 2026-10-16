import { cmp } from '@/lib/money'
import type { CatalogSearch, Nft, NftDetail, NftList } from '@/features/catalog/schemas'
import { COLLECTIONS, NETWORKS, nftFixtures } from './fixtures/nfts'
import { getDb } from '../mocks/fixtures/store'

export const PAGE_SIZE = 12
const NEW_SINCE = '2026-09-17T00:00:00.000Z'

/** Fixture + alterações em tempo de execução: fonte única de verdade dos mocks. */
function withOverride(n: Nft): Nft {
  const o = getDb().overrides[n.id]
  if (!o) return n
  return {
    ...n,
    price: o.price ?? n.price,
    originalPrice: o.originalPrice !== undefined ? o.originalPrice : n.originalPrice,
    editions: { ...n.editions, available: o.stock?.['e-1-50'] ?? n.editions.available },
    version: o.version,
  }
}

export const allNfts = (): Nft[] => nftFixtures.map(withOverride)

export function findNft(id: string): Nft | undefined {
  const n = nftFixtures.find((f) => f.id === id)
  return n ? withOverride(n) : undefined
}

type Skip = 'collection' | 'network' | undefined

function filterNfts(q: CatalogSearch, skip?: Skip): Nft[] {
  const term = q.q?.trim().toLowerCase()
  return allNfts().filter((n) => {
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
  const prices = allNfts().map((n) => n.price).sort(cmp)
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

// ---------- Detalhe (determinístico: derivado do id + alterações de estoque) ----------

const ATTRIBUTES = ['Óculos', 'Esmeralda', 'Raro', 'Chapéu', 'Fones', 'Dourado', 'Jaqueta', 'Neon', 'Único']
const REVIEWERS = ['Marina C.', 'Lucas P.', 'Aiko T.']
const REVIEW_TEXTS = [
  'Arte linda e entrega rápida. O registro de procedência deu confiança na compra.',
  'Os detalhes da obra ficam ainda melhores em alta resolução. Recomendo.',
  'Boa coleção e comunidade ativa. Já estou de olho nos próximos lançamentos.',
]

export function toDetail(n: Nft): NftDetail {
  const fixture = nftFixtures.find((f) => f.id === n.id) ?? n
  const seed = Number(n.id.replace('nft-', ''))
  const soldOut = fixture.editions.available === 0
  const tokenNumber = n.name.split('#')[1] ?? String(seed)

  const base = [
    { id: 'e-1-1', label: '1/1', available: soldOut || seed % 5 === 0 ? 0 : 1 },
    { id: 'e-1-10', label: '1/10', available: soldOut || seed % 3 === 0 ? 0 : 1 + (seed % 9) },
    { id: 'e-1-50', label: '1/50', available: soldOut ? 0 : fixture.editions.available },
    { id: 'e-open', label: 'ABERTA', available: soldOut ? 0 : 25 },
  ]
  const stock = getDb().overrides[n.id]?.stock ?? {}

  return {
    ...n,
    tokenId: `#${tokenNumber.padStart(4, '0')}`,
    description: `Um colecionável digital finalizado à mão da coleção ${n.collection}, verificado na ${n.network}, com arte desbloqueável e acesso para colecionadores.`,
    creator: 'Nova Sato',
    attributes: [...new Set([0, 3, 5].map((k) => ATTRIBUTES[(seed * (k + 1) + k) % ATTRIBUTES.length]))],
    gallery: [n.image, n.image, n.image, n.image],
    editionOptions: base.map((e) => ({ ...e, available: stock[e.id] ?? e.available })),
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