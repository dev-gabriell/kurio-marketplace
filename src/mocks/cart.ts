import Decimal from 'decimal.js'
import { MAX_PER_LINE, type Quote } from '@/features/cart/schemas'
import { findNft, toDetail } from './db'
import { coupons, type Coupon } from './fixtures/coupons'
import type { CartRecord } from './fixtures/store'

// Taxa de rede estimada: 0,06% do valor após o desconto, em 3 casas, mínimo 0,001 ETH
const FEE_RATE = '0.0006'
const MIN_FEE = '0.001'

const round = (value: Decimal.Value, places: number) =>
  new Decimal(value).toDecimalPlaces(places, Decimal.ROUND_HALF_UP).toFixed()
const eth = (value: Decimal.Value) => round(value, 4)

export const newItemId = () => crypto.randomUUID().slice(0, 8)

export const emptyCart = (): CartRecord => ({
  items: [],
  couponCode: null,
  updatedAt: new Date().toISOString(),
})

function editionOf(nftId: string, editionId: string) {
  const nft = findNft(nftId)
  const detail = nft ? toDetail(nft) : undefined
  const edition = detail?.editionOptions.find((e) => e.id === editionId)
  return { nft, edition, tokenId: detail?.tokenId ?? '' }
}

/** Quantidade máxima comprável: disponibilidade da edição limitada por pedido. null = não existe. */
export function limitFor(nftId: string, editionId: string): number | null {
  const { nft, edition } = editionOf(nftId, editionId)
  if (!nft || !edition) return null
  return Math.min(edition.available, MAX_PER_LINE)
}

type CouponCheck =
  | { ok: true; coupon: Coupon }
  | { ok: false; code: 'coupon_invalid' | 'coupon_expired'; message: string }

export function checkCoupon(raw: string): CouponCheck {
  const coupon = coupons.find((c) => c.code === raw.trim().toUpperCase())
  if (!coupon) return { ok: false, code: 'coupon_invalid', message: 'Cupom inválido.' }
  if (Date.parse(coupon.expiresAt) <= Date.now()) {
    return { ok: false, code: 'coupon_expired', message: 'Este cupom expirou.' }
  }
  return { ok: true, coupon }
}

// Hash simples e estável: identifica o conteúdo da cotação (preço, estoque, cupom, total)
function hash(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return Math.abs(h).toString(16)
}

export function buildQuote(cart: CartRecord): Quote {
  const lines = cart.items.map((item) => {
    const { nft, edition, tokenId } = editionOf(item.nftId, item.editionId)
    const available = edition?.available ?? 0
    const payableQuantity = Math.min(item.quantity, available)
    const issue = !nft || !edition
      ? ('unavailable' as const)
      : available === 0
        ? ('sold_out' as const)
        : item.quantity > available
          ? ('insufficient_stock' as const)
          : null
    const unitPrice = nft?.price ?? '0'
    return {
      itemId: item.id,
      nftId: item.nftId,
      tokenId,
      editionId: item.editionId,
      editionLabel: edition?.label ?? item.editionId,
      name: nft?.name ?? 'NFT indisponível',
      image: nft?.image ?? '',
      collection: nft?.collection ?? '',
      unitPrice,
      originalPrice: nft?.originalPrice ?? null,
      quantity: item.quantity,
      available,
      payableQuantity,
      lineTotal: eth(new Decimal(unitPrice).times(payableQuantity)),
      issue,
    }
  })

  const subtotal = eth(lines.reduce((sum, l) => sum.plus(l.lineTotal), new Decimal(0)))
  const check = cart.couponCode ? checkCoupon(cart.couponCode) : null
  const discount = check?.ok ? eth(new Decimal(subtotal).times(check.coupon.percent).dividedBy(100)) : '0'
  const base = new Decimal(subtotal).minus(discount)
  const networkFee = base.isZero() ? '0' : round(Decimal.max(base.times(FEE_RATE), MIN_FEE), 3)
  const total = eth(base.plus(networkFee)) // soma dos valores já arredondados: as parcelas sempre fecham

  return {
    quoteId: `q_${hash(JSON.stringify({ l: lines.map((x) => [x.itemId, x.unitPrice, x.payableQuantity, x.issue]), c: check?.ok ? check.coupon.code : null, total }))}`,
    lines,
    subtotal,
    discount,
    networkFee,
    total,
    coupon: check?.ok
      ? { code: check.coupon.code, percent: check.coupon.percent, description: check.coupon.description }
      : null,
    couponError: check && !check.ok ? { code: check.code, message: check.message } : null,
    canCheckout: lines.length > 0 && lines.every((l) => l.issue === null),
    quotedAt: new Date().toISOString(),
  }
}