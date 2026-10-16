import { authHandlers } from './auth'
import { cartHandlers } from './cart'
import { favoritesHandlers } from './favorites'
import { nftHandlers } from './nfts'

export const handlers = [...nftHandlers, ...authHandlers, ...favoritesHandlers, ...cartHandlers]