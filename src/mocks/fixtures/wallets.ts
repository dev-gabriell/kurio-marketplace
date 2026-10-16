import type { Wallet } from '@/features/checkout/schemas'

export const seedWallets: Record<string, Wallet[]> = {
  'user-ana': [
    { id: 'wal-ana-1', role: 'primary', type: 'metamask', network: 'Ethereum', address: '0x7a42f1c9d3b5e8a0c2d4f6a8b0c2d4e6f8a1b3c5' },
    { id: 'wal-ana-2', role: 'secondary', type: 'coinbase', network: 'Base', address: '0x91bd05a7c3e1f9d7b5a3c1e0f2d4b6a8c0e2f4a6' },
  ],
  'user-bruno': [
    { id: 'wal-bruno-1', role: 'primary', type: 'coinbase', network: 'Polygon', address: '0x3c8e2a6f4b1d9c7e5a3f1b9d7c5e3a1f0b8d6c4e' },
  ],
}