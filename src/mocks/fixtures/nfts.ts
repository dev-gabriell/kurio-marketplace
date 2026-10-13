import type { Nft } from '@/features/catalog/schemas'

export const COLLECTIONS = [
  'Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Colecionáveis',
  'Generativa', 'Jogos', 'Assinaturas', 'Utilidade',
] as const
export const NETWORKS = ['Ethereum', 'Polygon', 'Base'] as const

// PRNG com semente fixa: mesmos dados em qualquer execução
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = ['Emerald', 'Sage', 'Neon', 'Golden', 'Cosmic', 'Violet', 'Ivory', 'Amber', 'Onyx', 'Jade']
const SECOND = ['Ape', 'Nomad', 'Vessel', 'Beat', 'Bloom', 'Signal', 'Baron', 'Echo']
const BASE_DATE = Date.UTC(2026, 9, 1)

const rnd = mulberry32(42)
const pick = <T,>(list: readonly T[]) => list[Math.floor(rnd() * list.length)]

export const nftFixtures: Nft[] = Array.from({ length: 48 }, (_, i) => {
  let cents = 2 + Math.floor(rnd() * 1228)
  if (i === 3) cents = 1230 // extremos usados pelo filtro de preço
  if (i === 11) cents = 2
  const hasDiscount = rnd() < 0.3
  const total = 1 + Math.floor(rnd() * 50)
  const soldOut = rnd() < 0.1
  return {
    id: `nft-${String(i + 1).padStart(3, '0')}`,
    name: `${pick(FIRST)} ${pick(SECOND)} #${String(1 + Math.floor(rnd() * 998)).padStart(3, '0')}`,
    image: `/nfts/ape-${(i % 4) + 1}.png`,
    collection: pick(COLLECTIONS),
    network: pick(NETWORKS),
    price: (cents / 100).toFixed(2),
    originalPrice: hasDiscount ? ((cents * 1.15) / 100).toFixed(2) : null,
    editions: { total, available: soldOut ? 0 : 1 + Math.floor(rnd() * total) },
    popularity: Math.floor(rnd() * 100),
    featured: i === 7,
    createdAt: new Date(BASE_DATE - i * 86_400_000).toISOString(), // i=0 é o mais novo
    version: 1,
  }
})