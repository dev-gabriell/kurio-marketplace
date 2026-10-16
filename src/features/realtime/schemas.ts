import { z } from 'zod'
import { ethString } from '@/features/catalog/schemas'
import { orderSchema } from '@/features/checkout/schemas'

export const nftUpdatedSchema = z.object({
  id: z.string(),
  type: z.literal('nft.updated'),
  resource: z.object({ type: z.literal('nft'), id: z.string() }),
  version: z.number().int(),
  occurredAt: z.string(),
  data: z.object({
    price: ethString,
    originalPrice: ethString.nullable(),
    availability: z.record(z.string(), z.number().int()), // edição → disponível
  }),
})
export type NftUpdatedEvent = z.infer<typeof nftUpdatedSchema>

export const orderUpdatedSchema = z.object({
  id: z.string(),
  type: z.literal('order.updated'),
  resource: z.object({ type: z.literal('order'), id: z.string() }),
  userId: z.string(),
  version: z.number().int(),
  occurredAt: z.string(),
  data: orderSchema,
})
export type OrderUpdatedEvent = z.infer<typeof orderUpdatedSchema>