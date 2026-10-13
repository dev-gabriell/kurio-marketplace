import Decimal from 'decimal.js'

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

/** Valores em ETH sempre trafegam como string decimal ("1.19"). Nunca como number. */
export type EthString = string

export const add = (a: EthString, b: EthString): EthString => new Decimal(a).plus(b).toFixed()
export const sub = (a: EthString, b: EthString): EthString => new Decimal(a).minus(b).toFixed()
export const mul = (a: EthString, qty: number): EthString => new Decimal(a).times(qty).toFixed()
export const cmp = (a: EthString, b: EthString): number => new Decimal(a).comparedTo(b)

/** "1.19 ETH": mínimo 2 casas, máximo 4, sem perder precisão no cálculo. */
export function formatEth(value: EthString, withUnit = true): string {
  const s = new Decimal(value).toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toFixed()
  const [int, frac = ''] = s.split('.')
  const text = `${int}.${frac.padEnd(2, '0')}`
  return withUnit ? `${text} ETH` : text
}