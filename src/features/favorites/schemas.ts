import { z } from 'zod'

export const favoriteSchema = z.object({ nftId: z.string(), addedAt: z.string() })
export const favoritesResponseSchema = z.object({ items: z.array(favoriteSchema) })

export type Favorite = z.infer<typeof favoriteSchema>
export type FavoritesResponse = z.infer<typeof favoritesResponseSchema>