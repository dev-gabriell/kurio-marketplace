import { authHandlers } from './auth'
import { cartHandlers } from './cart'
import { favoritesHandlers } from './favorites'
import { nftHandlers } from './nfts'
import { orderHandlers } from './orders'
import { walletHandlers } from './wallets'

export const handlers = [
  ...nftHandlers,
  ...authHandlers,
  ...favoritesHandlers,
  ...cartHandlers,
  ...walletHandlers,
  ...orderHandlers,
]