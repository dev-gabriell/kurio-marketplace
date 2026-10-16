export interface Coupon {
  code: string
  percent: number
  description: string
  expiresAt: string
}

// Datas fixas: o cenário "expirado" não depende do relógio do avaliador
export const coupons: Coupon[] = [
  { code: 'KURIO10', percent: 10, description: '10% de desconto', expiresAt: '2030-12-31T23:59:59.000Z' },
  { code: 'WELCOME5', percent: 5, description: '5% de desconto', expiresAt: '2030-12-31T23:59:59.000Z' },
  { code: 'EXPIRADO', percent: 15, description: '15% de desconto', expiresAt: '2025-12-31T23:59:59.000Z' },
]