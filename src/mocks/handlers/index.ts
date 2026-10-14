import { authHandlers } from './auth'
import { nftHandlers } from './nfts'

export const handlers = [...nftHandlers, ...authHandlers]