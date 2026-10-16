import { delay, http, HttpResponse } from 'msw'
import type { ZodError } from 'zod'
import { orderInputSchema } from '@/features/checkout/schemas'
import { authorize } from '../authorize'
import { buildQuote } from '../cart'
import { createOrderRecord, fingerprintOf, settleIfDue, toPublic } from '../orders'
import { getScenario } from '../scenarios'
import { getDb, persist } from '../fixtures/store'

const fail = (status: number, code: string, message: string, fields?: Record<string, string>) =>
  HttpResponse.json({ code, message, fields }, { status })

function fieldErrors(error: ZodError) {
  const out: Record<string, string> = {}
  for (const issue of error.issues) out[String(issue.path[0] ?? 'form')] ??= issue.message
  return out
}

export const orderHandlers = [
  http.post('/api/orders', async ({ request }) => {
    const who = await authorize(request)
    if (who instanceof Response) return who

    const key = request.headers.get('Idempotency-Key')
    if (!key) return fail(400, 'idempotency_key_required', 'Chave de idempotência obrigatória.')

    const parsed = orderInputSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return fail(422, 'validation_error', 'Verifique os campos informados.', fieldErrors(parsed.error))
    }
    const input = parsed.data
    const fingerprint = fingerprintOf(input)
    const db = getDb()
    const idemKey = `${who.id}:${key}`

    // Mesma chave: mesmo conteúdo recupera o mesmo pedido; conteúdo diferente é conflito
    const known = db.idempotency[idemKey]
    if (known) {
      if (known.fingerprint !== fingerprint) {
        return fail(409, 'idempotency_conflict', 'Esta chave de idempotência já foi usada com outro conteúdo.')
      }
      return HttpResponse.json(toPublic(settleIfDue(db.orders[known.orderId])), {
        headers: { 'Idempotent-Replayed': 'true' },
      })
    }

    const connection = db.connections[who.id]
    if (
      !connection ||
      connection.address.toLowerCase() !== input.walletAddress.toLowerCase() ||
      connection.type !== input.walletType ||
      connection.network !== input.network
    ) {
      return fail(409, 'wallet_not_connected', 'Conecte sua carteira para confirmar a compra.')
    }

    const cart = db.carts[`user:${who.id}`]
    if (!cart || cart.items.length === 0) return fail(409, 'cart_empty', 'Seu carrinho está vazio.')

    // Revalida preço, estoque, cupom e taxas: a cotação revisada precisa ser a vigente
    const quote = buildQuote(cart)
    if (quote.quoteId !== input.quoteId) {
      return fail(409, 'quote_changed', 'Os valores do pedido mudaram. Revise o novo total e confirme novamente.')
    }
    if (!quote.canCheckout) return fail(409, 'unavailable', 'Há itens indisponíveis no carrinho.')

    const order = await createOrderRecord({
      userId: who.id,
      input,
      quote,
      outcome: getScenario() === 'payment-declined' ? 'refused' : 'confirmed',
    })
    db.idempotency[idemKey] = { fingerprint, orderId: order.id }
    persist()

    // O pedido já existe, mas a resposta nunca chega: o cliente expira e recupera pela chave
    if (getScenario() === 'timeout-after-create') await delay('infinite')

    return HttpResponse.json(toPublic(order), { status: 201 })
  }),

  http.get('/api/orders/:id', async ({ request, params }) => {
    const who = await authorize(request)
    if (who instanceof Response) return who

    const order = getDb().orders[String(params.id)]
    if (!order) return fail(404, 'not_found', 'Pedido não encontrado.')
    if (order.userId !== who.id) return fail(403, 'forbidden', 'Você não tem acesso a este pedido.')
    return HttpResponse.json(toPublic(settleIfDue(order)))
  }),
]