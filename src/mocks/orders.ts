import type { Quote } from '@/features/cart/schemas'
import type { NetworkName, Order, OrderInput, WalletType } from '@/features/checkout/schemas'
import { sha256Hex } from './fixtures/crypto'
import { findNft, toDetail } from './db'
import { getDb, getOverride, persist, type OrderRecord } from './fixtures/store'

export const SETTLE_MS = 3000

export const fingerprintOf = (input: OrderInput) =>
  JSON.stringify(Object.entries(input).sort(([a], [b]) => a.localeCompare(b)))

export async function createOrderRecord(args: {
  userId: string
  input: OrderInput
  quote: Quote
  outcome: 'confirmed' | 'refused'
}): Promise<OrderRecord> {
  const { userId, input, quote, outcome } = args
  const db = getDb()
  const id = `ord_${String(++db.orderSeq).padStart(4, '0')}` // sequencial: recibos estáveis entre execuções
  const now = Date.now()

  const record: OrderRecord = {
    id,
    userId,
    status: 'pending',
    version: 1,
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    settleAt: new Date(now + SETTLE_MS).toISOString(),
    outcome,
    refusalReason: null,
    txHash: null,
    txRef: `0x${await sha256Hex(`kurio:${id}`)}`,
    purchased: quote.lines.map((l) => ({
      itemId: l.itemId,
      nftId: l.nftId,
      editionId: l.editionId,
      quantity: l.payableQuantity,
    })),
    // Snapshot: o recibo nunca muda, mesmo que o catálogo mude depois
    receipt: {
      lines: quote.lines.map((l) => ({
        nftId: l.nftId,
        tokenId: l.tokenId,
        name: l.name,
        image: l.image,
        editionLabel: l.editionLabel,
        quantity: l.payableQuantity,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
      })),
      subtotal: quote.subtotal,
      discount: quote.discount,
      networkFee: quote.networkFee,
      total: quote.total,
      couponCode: quote.coupon?.code ?? null,
      wallet: {
        type: input.walletType as WalletType,
        network: input.network as NetworkName,
        address: input.walletAddress,
      },
      displayName: input.displayName,
      email: input.email,
    },
  }
  db.orders[id] = record
  persist()
  return record
}

/** Liquidação preguiçosa: vale em refresh, aba fechada ou reconexão. Estados finais são terminais. */
export function settleIfDue(order: OrderRecord): OrderRecord {
  if (order.status !== 'pending' || Date.now() < Date.parse(order.settleAt)) return order

  const now = new Date().toISOString()
  order.status = order.outcome
  order.version += 1
  order.updatedAt = now

  if (order.outcome === 'confirmed') {
    order.txHash = order.txRef
    const cart = getDb().carts[`user:${order.userId}`]
    for (const p of order.purchased) {
      const nft = findNft(p.nftId)
      const edition = nft && toDetail(nft).editionOptions.find((e) => e.id === p.editionId)
      if (edition) {
        const override = getOverride(p.nftId)
        override.stock = { ...override.stock, [p.editionId]: Math.max(0, edition.available - p.quantity) }
        override.version += 1
      }
      const item = cart?.items.find((i) => i.id === p.itemId)
      if (item) item.quantity -= p.quantity // só o que foi comprado sai do carrinho
    }
    if (cart) {
      cart.items = cart.items.filter((i) => i.quantity > 0)
      if (cart.items.length === 0) cart.couponCode = null
      cart.updatedAt = now
    }
  } else {
    order.refusalReason = 'Pagamento recusado pela carteira. Nenhum valor foi cobrado.'
  }
  persist()
  return order
}

export const toPublic = (o: OrderRecord): Order => ({
  id: o.id,
  status: o.status,
  version: o.version,
  createdAt: o.createdAt,
  updatedAt: o.updatedAt,
  refusalReason: o.refusalReason,
  txHash: o.txHash,
  receipt: o.receipt,
})