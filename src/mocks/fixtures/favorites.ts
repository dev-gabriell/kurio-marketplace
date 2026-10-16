export interface FavoriteRecord {
  nftId: string
  addedAt: string
}

// Cada usuário tem os seus: serve para testar o isolamento entre contas
export const seedFavorites: Record<string, FavoriteRecord[]> = {
  'user-ana': [
    { nftId: 'nft-002', addedAt: '2026-09-20T10:00:00.000Z' },
    { nftId: 'nft-005', addedAt: '2026-09-22T10:00:00.000Z' },
  ],
  'user-bruno': [{ nftId: 'nft-009', addedAt: '2026-09-21T10:00:00.000Z' }],
}