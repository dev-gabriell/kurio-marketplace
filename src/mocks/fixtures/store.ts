import type { Connection, Order, Wallet } from '@/features/checkout/schemas'
import { seedFavorites, type FavoriteRecord } from '../fixtures/favorites'
import { seedUsers, type StoredUser } from '../fixtures/users'
import { seedWallets } from '../fixtures/wallets'

const KEY = 'kurio:mockdb'
const VERSION = 4

export interface StoredSession {
  token: string
  userId: string
  expiresAt: string
}

export interface NftOverride {
  price?: string
  originalPrice?: string | null
  stock?: Record<string, number>
  version: number
}

export interface CartRecord {
  items: { id: string; nftId: string; editionId: string; quantity: number }[]
  couponCode: string | null
  updatedAt: string
}

/** Pedido + campos internos que a API nunca expõe. */
export interface OrderRecord extends Order {
  userId: string
  settleAt: string
  outcome: 'confirmed' | 'refused'
  txRef: string
  purchased: { itemId: string; nftId: string; editionId: string; quantity: number }[]
}

export interface DbState {
  version: number
  users: StoredUser[]
  sessions: StoredSession[]
  favorites: Record<string, FavoriteRecord[]>
  overrides: Record<string, NftOverride>
  carts: Record<string, CartRecord>
  wallets: Record<string, Wallet[]>
  connections: Record<string, Connection>
  orders: Record<string, OrderRecord>
  orderSeq: number
  idempotency: Record<string, { fingerprint: string; orderId: string }>
}

const seed = (): DbState => ({
  version: VERSION,
  users: structuredClone(seedUsers),
  sessions: [],
  favorites: structuredClone(seedFavorites),
  overrides: {},
  carts: {},
  wallets: structuredClone(seedWallets),
  connections: {},
  orders: {},
  orderSeq: 0,
  idempotency: {},
})

let cache: DbState | null = null

export function persist() {
  try {
    if (cache) localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    /* sem persistência: vale só até o refresh */
  }
}

export function getDb(): DbState {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DbState
      if (parsed.version === VERSION) {
        cache = parsed
        return cache
      }
    }
  } catch {
    /* dados corrompidos: recomeça do seed */
  }
  cache = seed()
  persist()
  return cache
}

export function resetDb() {
  cache = seed()
  persist()
}

export function getOverride(nftId: string): NftOverride {
  return (getDb().overrides[nftId] ??= { version: 1 })
}