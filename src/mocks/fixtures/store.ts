import { seedFavorites, type FavoriteRecord } from '../fixtures/favorites'
import { seedUsers, type StoredUser } from '../fixtures/users'

const KEY = 'kurio:mockdb'
const VERSION = 3

export interface StoredSession {
  token: string
  userId: string
  expiresAt: string
}

/** Alterações em tempo de execução sobre as fixtures do catálogo. */
export interface NftOverride {
  price?: string
  originalPrice?: string | null
  stock?: Record<string, number> // disponibilidade absoluta por edição
  version: number
}

export interface CartRecord {
  items: { id: string; nftId: string; editionId: string; quantity: number }[]
  couponCode: string | null
  updatedAt: string
}

export interface DbState {
  version: number
  users: StoredUser[]
  sessions: StoredSession[]
  favorites: Record<string, FavoriteRecord[]>
  overrides: Record<string, NftOverride>
  carts: Record<string, CartRecord> // "user:<id>" ou "guest:<cartId>"
}

const seed = (): DbState => ({
  version: VERSION,
  users: structuredClone(seedUsers),
  sessions: [],
  favorites: structuredClone(seedFavorites),
  overrides: {},
  carts: {},
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