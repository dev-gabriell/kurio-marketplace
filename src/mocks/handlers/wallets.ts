import { http, HttpResponse } from 'msw'
import { connectInputSchema } from '@/features/checkout/schemas'
import { authorize } from '../authorize'
import { getScenario } from '../scenarios'
import { getDb, persist } from '../fixtures/store'

export const walletHandlers = [
  http.get('/api/wallets', async ({ request }) => {
    const who = await authorize(request)
    if (who instanceof Response) return who
    return HttpResponse.json({ items: getDb().wallets[who.id] ?? [] })
  }),

  http.get('/api/wallet/connection', async ({ request }) => {
    const who = await authorize(request)
    if (who instanceof Response) return who
    return HttpResponse.json({ connection: getDb().connections[who.id] ?? null })
  }),

  http.post('/api/wallet/connection', async ({ request }) => {
    const who = await authorize(request)
    if (who instanceof Response) return who

    if (getScenario() === 'wallet-rejected') {
      return HttpResponse.json(
        { code: 'wallet_rejected', message: 'A conexão foi recusada na carteira. Nenhum valor foi cobrado.' },
        { status: 403 },
      )
    }

    const parsed = connectInputSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return HttpResponse.json({ code: 'validation_error', message: 'Dados da carteira inválidos.' }, { status: 422 })
    }
    const connection = { ...parsed.data, connectedAt: new Date().toISOString() }
    getDb().connections[who.id] = connection
    persist()
    return HttpResponse.json({ connection })
  }),

  http.delete('/api/wallet/connection', async ({ request }) => {
    const who = await authorize(request)
    if (who instanceof Response) return who
    delete getDb().connections[who.id]
    persist()
    return HttpResponse.json({ connection: null })
  }),
]