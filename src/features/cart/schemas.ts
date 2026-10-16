import { z } from 'zod'
import { ethString } from '@/features/catalog/schemas'

export const MAX_PER_LINE = 10 // limite por pedido, por edição

export const cartItemSchema = z.object({
  id: z.string(),
  nftId: z.string(),
  editionId: z.string(),
  quantity: z.number().int().min(1),
})

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  couponCode: z.string().nullable(),
})
export type Cart = z.infer<typeof cartSchema>

export const mergeResponseSchema = cartSchema.extend({ adjusted: z.number().int() })

export const addItemSchema = z.object({
  nftId: z.string().min(1),
  editionId: z.string().min(1),
  quantity: z.number().int().min(1).max(MAX_PER_LINE),
})
export type AddItemInput = z.infer<typeof addItemSchema>

export const quantitySchema = z.object({ quantity: z.number().int().min(1).max(MAX_PER_LINE) })
export const couponInputSchema = z.object({ code: z.string().trim().min(1, 'Informe o código do cupom.') })

export const quoteLineSchema = z.object({
  itemId: z.string(),
  nftId: z.string(),
  tokenId: z.string(),
  editionId: z.string(),
  editionLabel: z.string(),
  name: z.string(),
  image: z.string(),
  collection: z.string(),
  unitPrice: ethString,
  originalPrice: ethString.nullable(),
  quantity: z.number().int(),
  available: z.number().int(),
  payableQuantity: z.number().int(),
  lineTotal: ethString,
  issue: z.enum(['unavailable', 'sold_out', 'insufficient_stock']).nullable(),
})
export type QuoteLine = z.infer<typeof quoteLineSchema>

export const quoteSchema = z.object({
  quoteId: z.string(),
  lines: z.array(quoteLineSchema),
  subtotal: ethString,
  discount: ethString,
  networkFee: ethString,
  total: ethString,
  coupon: z.object({ code: z.string(), percent: z.number(), description: z.string() }).nullable(),
  couponError: z.object({ code: z.string(), message: z.string() }).nullable(),
  canCheckout: z.boolean(),
  quotedAt: z.string(),
})
export type Quote = z.infer<typeof quoteSchema>