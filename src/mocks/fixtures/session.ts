import { HttpResponse } from 'msw'
import type { User } from '@/features/auth/schemas'
import { randomToken } from './crypto'
import type { StoredUser } from './users'
import { getDb, persist } from './store'

export const SESSION_TTL_MS = 30 * 60 * 1000 // 30 min, renovados a cada requisição autenticada
const expiresIn = () => new Date(Date.now() + SESSION_TTL_MS).toISOString()

export const toPublicUser = ({ id, username, email, createdAt }: StoredUser): User => ({
  id,
  username,
  email,
  createdAt,
})

export const bearer = (request: Request) =>
  request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? null

export function createSession(userId: string) {
  const session = { token: randomToken(), userId, expiresAt: expiresIn() }
  const db = getDb()
  db.sessions.push(session)
  persist()
  return session
}

type AuthResult =
  | { ok: true; user: StoredUser; expiresAt: string }
  | { ok: false; response: Response }

const unauthorized = (code: 'unauthenticated' | 'session_expired', message: string): AuthResult => ({
  ok: false,
  response: HttpResponse.json({ code, message }, { status: 401 }),
})

/** Reutilizado por todos os handlers privados (favoritos, carrinho, pedidos…). */
export function authenticate(request: Request): AuthResult {
  const token = bearer(request)
  const db = getDb()
  const session = token ? db.sessions.find((s) => s.token === token) : undefined
  if (!session) return unauthorized('unauthenticated', 'Faça login para continuar.')

  if (Date.parse(session.expiresAt) <= Date.now()) {
    db.sessions = db.sessions.filter((s) => s !== session)
    persist()
    return unauthorized('session_expired', 'Sua sessão expirou. Entre novamente.')
  }

  const user = db.users.find((u) => u.id === session.userId)
  if (!user) return unauthorized('unauthenticated', 'Faça login para continuar.')

  session.expiresAt = expiresIn()
  persist()
  return { ok: true, user, expiresAt: session.expiresAt }
}