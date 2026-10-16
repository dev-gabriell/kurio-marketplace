import type { OrderInput } from './schemas'

export interface Attempt {
  key: string
  fingerprint: string
  payload: OrderInput
  orderId?: string
}

const PREFIX = 'kurio:checkout:'

const fingerprintOf = (payload: OrderInput) =>
  JSON.stringify(Object.entries(payload).sort(([a], [b]) => a.localeCompare(b)))

export function loadAttempt(userId: string): Attempt | null {
  try {
    const raw = localStorage.getItem(PREFIX + userId)
    return raw ? (JSON.parse(raw) as Attempt) : null
  } catch {
    return null
  }
}

function save(userId: string, attempt: Attempt) {
  try {
    localStorage.setItem(PREFIX + userId, JSON.stringify(attempt))
  } catch {
    /* sem armazenamento: perde a recuperação após refresh */
  }
}

/** Mesmo conteúdo → mesma chave (reenviar recupera o mesmo pedido). Conteúdo novo → chave nova. */
export function attemptFor(userId: string, payload: OrderInput): Attempt {
  const fingerprint = fingerprintOf(payload)
  const current = loadAttempt(userId)
  if (current && current.fingerprint === fingerprint) return current
  const next: Attempt = { key: crypto.randomUUID(), fingerprint, payload }
  save(userId, next) // salvo ANTES de enviar: sobrevive a timeout e refresh
  return next
}

export const rememberOrder = (userId: string, attempt: Attempt, orderId: string) =>
  save(userId, { ...attempt, orderId })

export function clearAttempt(userId: string) {
  try {
    localStorage.removeItem(PREFIX + userId)
  } catch {
    /* ignore */
  }
}

/** Logout: apaga as tentativas de todos os usuários deste navegador (têm dados pessoais). */
export function clearAttempts() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}