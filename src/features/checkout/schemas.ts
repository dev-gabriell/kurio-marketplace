import { z } from 'zod'
import { ethString } from '@/features/catalog/schemas'

export const WALLET_TYPES = ['metamask', 'coinbase', 'walletconnect'] as const
export const NETWORKS = ['Ethereum', 'Polygon', 'Base'] as const
export type WalletType = (typeof WALLET_TYPES)[number]
export type NetworkName = (typeof NETWORKS)[number]

export const WALLET_LABEL: Record<WalletType, string> = {
  metamask: 'MetaMask',
  coinbase: 'Coinbase Wallet',
  walletconnect: 'WalletConnect',
}

// Links de exploração simulados: a transação não existe de verdade
export const EXPLORER: Record<NetworkName, { name: string; url: string }> = {
  Ethereum: { name: 'Etherscan', url: 'https://etherscan.io/tx/' },
  Polygon: { name: 'Polygonscan', url: 'https://polygonscan.com/tx/' },
  Base: { name: 'Basescan', url: 'https://basescan.org/tx/' },
}

export const walletSchema = z.object({
  id: z.string(),
  role: z.enum(['primary', 'secondary']),
  type: z.enum(WALLET_TYPES),
  network: z.enum(NETWORKS),
  address: z.string(),
})
export type Wallet = z.infer<typeof walletSchema>
export const walletsResponseSchema = z.object({ items: z.array(walletSchema) })

export const connectionSchema = z.object({
  type: z.enum(WALLET_TYPES),
  network: z.enum(NETWORKS),
  address: z.string(),
  connectedAt: z.string(),
})
export type Connection = z.infer<typeof connectionSchema>
export const connectionResponseSchema = z.object({ connection: connectionSchema.nullable() })
export const connectInputSchema = connectionSchema.pick({ type: true, network: true, address: true })
export type ConnectInput = z.infer<typeof connectInputSchema>

// ---------- Formulário do colecionador (compartilhado entre tela e servidor) ----------

const oneOf = (list: readonly string[], message: string) =>
  z.string().min(1, message).refine((v) => list.includes(v), message)

const ADDRESS = /^0x[a-fA-F0-9]{40}$/

export const checkoutFormSchema = z.object({
  displayName: z.string().trim().min(2, 'Informe seu nome de exibição.'),
  username: z
    .string()
    .trim()
    .min(3, 'O nome de usuário deve ter ao menos 3 caracteres.')
    .max(24, 'O nome de usuário deve ter no máximo 24 caracteres.')
    .regex(/^[\w.-]+$/, 'Use apenas letras, números, ponto, hífen ou sublinhado.'),
  network: oneOf(NETWORKS, 'Selecione uma rede.'),
  profileName: z.string().trim().min(2, 'Informe o nome do perfil.'),
  walletAddress: z.string().trim().regex(ADDRESS, 'Informe um endereço 0x válido (42 caracteres).'),
  secondaryWallet: z
    .string()
    .trim()
    .refine(
      (v) => v === '' || ADDRESS.test(v) || /^[a-z0-9-]+\.eth$/i.test(v),
      'Informe um endereço 0x ou um nome ENS (.eth).',
    ),
  walletType: oneOf(WALLET_TYPES, 'Selecione uma carteira.'),
  referralCode: z.string().trim().regex(/^[A-Za-z0-9-]{4,16}$/, 'Use de 4 a 16 letras, números ou hífen.'),
  email: z.string().trim().min(1, 'Informe seu e-mail.').email('Digite um e-mail válido.'),
  ensName: z.string().trim().regex(/^[a-z0-9-]{3,}$/i, 'Use ao menos 3 letras, números ou hífen.'),
  notes: z.string().max(280, 'Use no máximo 280 caracteres.'),
})
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

export const orderInputSchema = checkoutFormSchema.extend({ quoteId: z.string().min(1) })
export type OrderInput = z.infer<typeof orderInputSchema>

// ---------- Pedido e recibo ----------

export const orderLineSchema = z.object({
  nftId: z.string(),
  tokenId: z.string(),
  name: z.string(),
  image: z.string(),
  editionLabel: z.string(),
  quantity: z.number().int(),
  unitPrice: ethString,
  lineTotal: ethString,
})

export const orderSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'confirmed', 'refused']),
  version: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  refusalReason: z.string().nullable(),
  txHash: z.string().nullable(),
  receipt: z.object({
    lines: z.array(orderLineSchema),
    subtotal: ethString,
    discount: ethString,
    networkFee: ethString,
    total: ethString,
    couponCode: z.string().nullable(),
    wallet: z.object({ type: z.enum(WALLET_TYPES), network: z.enum(NETWORKS), address: z.string() }),
    displayName: z.string(),
    email: z.string(),
  }),
})
export type Order = z.infer<typeof orderSchema>