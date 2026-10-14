import { http, HttpResponse } from 'msw'
import type { ZodError } from 'zod'
import { loginSchema, registerBodySchema } from '@/features/auth/schemas'
import { hashPassword } from '../fixtures/crypto'
import type { StoredUser } from '../fixtures/users'
import { applyScenario } from '../scenarios'
import { authenticate, bearer, createSession, toPublicUser } from '../fixtures/session'
import { getDb, persist } from '../fixtures/store'

function fieldErrors(error: ZodError) {
  const out: Record<string, string> = {}
  for (const issue of error.issues) out[String(issue.path[0] ?? 'form')] ??= issue.message
  return out
}

const validationError = (error: ZodError) =>
  HttpResponse.json(
    { code: 'validation_error', message: 'Verifique os campos informados.', fields: fieldErrors(error) },
    { status: 422 },
  )

export const authHandlers = [
  http.post('/api/auth/register', async ({ request }) => {
    const failure = await applyScenario(request)
    if (failure) return failure

    const parsed = registerBodySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return validationError(parsed.error)

    const { username, email, password } = parsed.data
    const db = getDb()
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      const message = 'Este e-mail já está cadastrado.'
      return HttpResponse.json({ code: 'email_taken', message, fields: { email: message } }, { status: 409 })
    }

    const salt = crypto.randomUUID()
    const user: StoredUser = {
      id: `user-${crypto.randomUUID().slice(0, 8)}`,
      username,
      email,
      salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
    persist()

    const session = createSession(user.id)
    return HttpResponse.json(
      { user: toPublicUser(user), token: session.token, expiresAt: session.expiresAt },
      { status: 201 },
    )
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const failure = await applyScenario(request)
    if (failure) return failure

    const parsed = loginSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return validationError(parsed.error)

    const { email, password } = parsed.data
    const user = getDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    const hash = user ? await hashPassword(password, user.salt) : null

    // Mesma resposta para e-mail inexistente e senha errada: não revela quais e-mails existem
    if (!user || hash !== user.passwordHash) {
      return HttpResponse.json(
        { code: 'invalid_credentials', message: 'E-mail ou senha incorretos.' },
        { status: 401 },
      )
    }

    const session = createSession(user.id)
    return HttpResponse.json({
      user: toPublicUser(user),
      token: session.token,
      expiresAt: session.expiresAt,
    })
  }),

  http.get('/api/auth/session', async ({ request }) => {
    const failure = await applyScenario(request)
    if (failure) return failure

    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    return HttpResponse.json({ user: toPublicUser(auth.user), expiresAt: auth.expiresAt })
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    const failure = await applyScenario(request)
    if (failure) return failure

    const token = bearer(request)
    const db = getDb()
    db.sessions = db.sessions.filter((s) => s.token !== token)
    persist()
    return new HttpResponse(null, { status: 204 })
  }),
]