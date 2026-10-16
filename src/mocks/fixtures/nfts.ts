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

// Os 9 mais recentes reproduzem o Figma (nomes, preços e imagens), com estoque garantido
const PINNED: Record<number, Pick<Nft, 'name' | 'image' | 'price' | 'originalPrice'>> = {
  0: { name: 'Emerald Ape #042', image: '/nfts/ape-1.png', price: '1.19', originalPrice: null },
  1: { name: 'Sage Nomad #009', image: '/nfts/ape-2.png', price: '1.69', originalPrice: null },
  2: { name: 'Neon Vessel #552', image: '/nfts/ape-3.png', price: '1.99', originalPrice: '2.29' },
  3: { name: 'Cosmic Bloom #118', image: '/nfts/ape-2.png', price: '1.29', originalPrice: null },
  4: { name: 'Violet Nomad #314', image: '/nfts/ape-2.png', price: '1.39', originalPrice: null },
  5: { name: 'Ivory Baron #088', image: '/nfts/ape-3.png', price: '1.79', originalPrice: null },
  6: { name: 'Golden Beat #207', image: '/nfts/ape-4.png', price: '0.99', originalPrice: null },
  7: { name: 'Amber Echo #071', image: '/nfts/ape-4.png', price: '0.79', originalPrice: null },
  8: { name: 'Golden Signal #160', image: '/nfts/ape-4.png', price: '0.39', originalPrice: null },
}

export const nftFixtures: Nft[] = Array.from({ length: 48 }, (_, i) => {
  // A ordem das chamadas ao PRNG não muda: o restante do catálogo continua igual
  let cents = 2 + Math.floor(rnd() * 1228)
  if (i === 9) cents = 1230 // extremos usados pelo filtro de preço (0,02 – 12,30)
  if (i === 11) cents = 2
  const hasDiscount = rnd() < 0.3
  const total = 1 + Math.floor(rnd() * 50)
  const soldOut = rnd() < 0.1

  const generated: Nft = {
    id: `nft-${String(i + 1).padStart(3, '0')}`,
    name: `${pick(FIRST)} ${pick(SECOND)} #${String(1 + Math.floor(rnd() * 998)).padStart(3, '0')}`,
    image: `/nfts/ape-${(i % 4) + 1}.png`,
    collection: pick(COLLECTIONS),
    network: pick(NETWORKS),
    price: (cents / 100).toFixed(2),
    originalPrice: hasDiscount ? ((cents * 1.15) / 100).toFixed(2) : null,
    editions: { total, available: soldOut ? 0 : 1 + Math.floor(rnd() * total) },
    popularity: Math.floor(rnd() * 100),
    featured: false,
    createdAt: new Date(BASE_DATE - i * 86_400_000).toISOString(), // i=0 é o mais novo
    version: 1,
  }

  const pinned = PINNED[i]
  return pinned
    ? { ...generated, ...pinned, editions: { total: 50, available: 30 }, featured: i === 1 }
    : generated
})