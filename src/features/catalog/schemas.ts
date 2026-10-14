import { z } from 'zod'

export const ethString = z.string().regex(/^\d+(\.\d+)?$/, 'Valor em ETH inválido')

export const nftSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  collection: z.string(),
  network: z.string(),
  price: ethString,
  originalPrice: ethString.nullable(),
  editions: z.object({ total: z.number().int(), available: z.number().int() }),
  popularity: z.number().int(),
  featured: z.boolean(),
  createdAt: z.string(),
  version: z.number().int(), // usado na reconciliação com Socket.IO
})
export type Nft = z.infer<typeof nftSchema>

export const editionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  available: z.number().int().min(0),
})
export type EditionOption = z.infer<typeof editionOptionSchema>

export const reviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string(),
  date: z.string(),
})

export const nftDetailSchema = nftSchema.extend({
  tokenId: z.string(),
  description: z.string(),
  creator: z.string(),
  attributes: z.array(z.string()),
  gallery: z.array(z.string()).min(1),
  editionOptions: z.array(editionOptionSchema).min(1),
  rating: z.object({ average: z.number().min(0).max(5), count: z.number().int().min(0) }),
  reviews: z.array(reviewSchema),
  contract: z.object({
    address: z.string(),
    standard: z.string(),
    royaltyPercent: z.number(),
  }),
})
export type NftDetail = z.infer<typeof nftDetailSchema>

const facetSchema = z.object({ name: z.string(), count: z.number().int() })

export const nftListSchema = z.object({
  items: z.array(nftSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
  facets: z.object({
    collections: z.array(facetSchema),
    networks: z.array(facetSchema),
    priceRange: z.object({ min: ethString, max: ethString }),
  }),
})
export type NftList = z.infer<typeof nftListSchema>

/** Estado do catálogo na URL (e parâmetros enviados à API). */
export const catalogSearchSchema = z.object({
  q: z.coerce.string().optional(),
  collection: z.coerce.string().optional(),
  network: z.coerce.string().optional(),
  minPrice: z.coerce.string().optional(),
  maxPrice: z.coerce.string().optional(),
  tab: z.enum(['all', 'new', 'trending']).default('all').catch('all'),
  sort: z.enum(['recent', 'price_asc', 'price_desc', 'popular']).default('recent').catch('recent'),
  page: z.coerce.number().int().min(1).default(1).catch(1),
})
export type CatalogSearch = z.infer<typeof catalogSearchSchema>