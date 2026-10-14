import { seedUsers, type StoredUser } from './users'

const KEY = 'kurio:mockdb'
const VERSION = 1

export interface StoredSession {
  token: string
  userId: string
  expiresAt: string
}

export interface DbState {
  version: number
  users: StoredUser[]
  sessions: StoredSession[]
}

const seed = (): DbState => ({
  version: VERSION,
  users: structuredClone(seedUsers),
  sessions: [],
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