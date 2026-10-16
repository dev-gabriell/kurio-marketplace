import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import { addItemSchema, couponInputSchema, quantitySchema } from '@/features/cart/schemas'
import { buildQuote, checkCoupon, emptyCart, limitFor, newItemId } from '../cart'
import { applyScenario } from '../scenarios'
import { authenticate, bearer } from '../fixtures/session'
import { getDb, persist, type CartRecord } from '../fixtures/store'

type Owner = { key: string | null }

/** Cenário → dono do carrinho: usuário (token) ou visitante (X-Cart-Id). */
async function ownerOf(request: Request): Promise<Response | Owner> {
  const failure = await applyScenario(request)
  if (failure) return failure

  if (bearer(request)) {
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    return { key: `user:${auth.user.id}` }
  }
  const guest = request.headers.get('X-Cart-Id')
  return { key: guest ? `guest:${guest}` : null }
}

const fail = (status: number, code: string, message: string) =>
  HttpResponse.json({ code, message }, { status })

const noCart = () => fail(400, 'cart_id_required', 'Carrinho não identificado.')

const view = (cart: CartRecord) => ({ items: cart.items, couponCode: cart.couponCode })
const readCart = (key: string | null): CartRecord => (key && getDb().carts[key]) || emptyCart()
const writableCart = (key: string): CartRecord => (getDb().carts[key] ??= emptyCart())

const stockError = (limit: number) =>
  fail(
    409,
    'insufficient_stock',
    limit === 0
      ? 'Esta edição está esgotada.'
      : `Só é possível comprar ${limit} ${limit === 1 ? 'unidade' : 'unidades'} desta edição.`,
  )

const touch = (cart: CartRecord) => {
  cart.updatedAt = new Date().toISOString()
  persist()
}

export const cartHandlers = [
  http.get('/api/cart', async ({ request }) => {
    const owner = await ownerOf(request)
    if (owner instanceof Response) return owner
    return HttpResponse.json(view(readCart(owner.key)))
  }),

  http.get('/api/cart/quote', async ({ request }) => {
    const owner = await ownerOf(request)
    if (owner instanceof Response) return owner
    return HttpResponse.json(buildQuote(readCart(owner.key)))
  }),

  http.post('/api/cart/items', async ({ request }) => {
    const owner = await ownerOf(request)
    if (owner instanceof Response) return owner
    if (!owner.key) return noCart()

    const parsed = addItemSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return fail(422, 'validation_error', 'Quantidade inválida.')

    const { nftId, editionId, quantity } = parsed.data
    const limit = limitFor(nftId, editionId)
    if (limit === null) return fail(404, 'not_found', 'NFT ou edição não encontrados.')

    const cart = writableCart(owner.key)
    const existing = cart.items.find((i) => i.nftId === nftId && i.editionId === editionId)
    const wanted = (existing?.quantity ?? 0) + quantity
    if (wanted > limit) return stockError(limit)

    if (existing) existing.quantity = wanted
    else cart.items.push({ id: newItemId(), nftId, editionId, quantity })
    touch(cart)
    return HttpResponse.json(view(cart), { status: 201 })
  }),

  http.patch('/api/cart/items/:itemId', async ({ request, params }) => {
    const owner = await ownerOf(request)
    if (owner instanceof Response) return owner
    if (!owner.key) return noCart()

    const parsed = quantitySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return fail(422, 'validation_error', 'Quantidade inválida.')

    const cart = writableCart(owner.key)
    const item = cart.items.find((i) => i.id === String(params.itemId))
    if (!item) return fail(404, 'not_found', 'Item não encontrado no carrinho.')

    const limit = limitFor(item.nftId, item.editionId) ?? 0
    if (parsed.data.quantity > limit) return stockError(limit)

    item.quantity = parsed.data.quantity
    touch(cart)
    return HttpResponse.json(view(cart))
  }),

  http.delete('/api/cart/items/:itemId', async ({ request, params }) => {
    const owner = await ownerOf(request)
    if (owner instanceof Response) return owner
    if (!owner.key) return noCart()

    const cart = writableCart(owner.key)
    cart.items = cart.items.filter((i) => i.id !== String(params.itemId))
    touch(cart)
    return HttpResponse.json(view(cart))
  }),

  http.put('/api/cart/coupon', async ({ request }) => {
    const owner = await ownerOf(request)
    if (owner instanceof Response) return owner
    if (!owner.key) return noCart()

    const parsed = couponInputSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return fail(422, 'validation_error', 'Informe o código do cupom.')

    const check = checkCoupon(parsed.data.code)
    if (!check.ok) return fail(422, check.code, check.message)

    const cart = writableCart(owner.key)
    cart.couponCode = check.coupon.code
    touch(cart)
    return HttpResponse.json(view(cart))
  }),

  http.delete('/api/cart/coupon', async ({ request }) => {
    const owner = await ownerOf(request)
    if (owner instanceof Response) return owner
    if (!owner.key) return noCart()

    const cart = writableCart(owner.key)
    cart.couponCode = null
    touch(cart)
    return HttpResponse.json(view(cart))
  }),

  // Chamado logo depois do login: traz os itens do visitante para o carrinho do usuário
  http.post('/api/cart/merge', async ({ request }) => {
    const failure = await applyScenario(request)
    if (failure) return failure
    const auth = authenticate(request)
    if (!auth.ok) return auth.response

    const body = z
      .object({ guestCartId: z.string().min(1) })
      .safeParse(await request.json().catch(() => null))
    if (!body.success) return fail(422, 'validation_error', 'Carrinho de visitante inválido.')

    const db = getDb()
    const guestKey = `guest:${body.data.guestCartId}`
    const guest = db.carts[guestKey]
    const mine = writableCart(`user:${auth.user.id}`)

    let adjusted = 0
    for (const g of guest?.items ?? []) {
      const existing = mine.items.find((i) => i.nftId === g.nftId && i.editionId === g.editionId)
      const wanted = (existing?.quantity ?? 0) + g.quantity
      const applied = Math.min(wanted, limitFor(g.nftId, g.editionId) ?? 0)
      if (applied < wanted) adjusted++
      if (applied <= 0) continue
      if (existing) existing.quantity = applied
      else mine.items.push({ id: newItemId(), nftId: g.nftId, editionId: g.editionId, quantity: applied })
    }
    if (!mine.couponCode && guest?.couponCode) mine.couponCode = guest.couponCode

    delete db.carts[guestKey]
    touch(mine)
    return HttpResponse.json({ ...view(mine), adjusted })
  }),
]