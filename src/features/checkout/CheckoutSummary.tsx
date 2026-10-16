import { Link } from '@tanstack/react-router'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import type { Quote } from '@/features/cart/schemas'
import { cn } from '@/lib/utils'
import { formatEth } from '@/lib/money'
import {
  WALLET_LABEL,
  type CheckoutFormValues,
  type Connection,
  type WalletType,
} from './schemas'

export type Phase = 'idle' | 'connecting' | 'submitting'
export type Banner = { kind: 'error' | 'unknown'; message: string }

const PROVIDERS: { type: WalletType; chips?: boolean }[] = [
  { type: 'walletconnect', chips: true },
  { type: 'metamask' },
  { type: 'coinbase' },
]

interface Props {
  quote: Quote
  phase: Phase
  banner?: Banner
  changed: boolean
  connection?: Connection | null
  disconnecting: boolean
  onAcknowledge: () => void
  onRecover: () => void
  onDisconnect: () => void
}

export function CheckoutSummary(p: Props) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>()
  const walletType = watch('walletType')
  const busy = p.phase !== 'idle'
  const blocked = busy || p.changed || p.banner?.kind === 'unknown' || !p.quote.canCheckout

  const label =
    p.phase === 'connecting'
      ? `Conectando à ${WALLET_LABEL[walletType as WalletType] ?? 'carteira'}…`
      : p.phase === 'submitting'
        ? 'Enviando pedido…'
        : 'Confirmar compra'

  return (
    <aside aria-labelledby="seus-nfts" className="text-xs">
      <h2 id="seus-nfts" className="text-base font-bold">Seus NFTs</h2>
      <div aria-hidden="true" className="mt-4 flex justify-between border-b border-primary/40 pb-2 text-xs font-bold">
        <span>NFTs</span>
        <span>Subtotal</span>
      </div>

      <ul aria-label="Itens do pedido" className="mt-3 space-y-2">
        {p.quote.lines.map((l) => (
          <li key={l.itemId} className="flex items-center gap-3 bg-card p-2">
            <img src={l.image} alt="" width={40} height={40} className="size-10 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                {l.name} <span className="font-normal text-muted-foreground">(x {l.quantity})</span>
              </p>
              <p className="truncate text-muted-foreground">ID do token: {l.tokenId}</p>
            </div>
            <p className="text-sm font-bold text-primary">{formatEth(l.lineTotal)}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center">
        Tem um código promocional?{' '}
        <Link to="/carrinho" hash="cupom" className="text-primary underline">Aplique aqui</Link>
      </p>

      <dl className="mt-4 space-y-3 border-b border-primary/40 pb-4">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatEth(p.quote.subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt>Desconto do lançamento</dt>
          <dd>{Number(p.quote.discount) === 0 ? '(-) 00.00' : `(-) ${formatEth(p.quote.discount)}`}</dd>
        </div>
        <div>
          <div className="flex justify-between"><dt>Taxa de rede</dt><dd>{formatEth(p.quote.networkFee)}</dd></div>
          <p className="mt-1 text-center text-[10px] text-primary">Taxa estimada</p>
        </div>
      </dl>
      <p className="mt-3 flex justify-center gap-6 text-sm font-bold">
        <span>Total</span>
        <span className="text-primary">{formatEth(p.quote.total)}</span>
      </p>

      <fieldset className="mt-5">
        <legend className="mb-3 w-full text-center text-sm font-bold">Carteira e rede</legend>
        <div className="space-y-2">
          {PROVIDERS.map(({ type, chips }) => {
            const checked = walletType === type
            return (
              <label
                key={type}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded border border-border bg-background px-3 py-3',
                  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring',
                  checked && 'border-primary',
                )}
              >
                <input
                  type="radio"
                  name="provider"
                  value={type}
                  checked={checked}
                  onChange={() => setValue('walletType', type, { shouldValidate: true })}
                  className="sr-only"
                />
                <span aria-hidden="true" className="grid size-3.5 place-items-center rounded-full border border-primary">
                  {checked && <span className="size-1.5 rounded-full bg-primary" />}
                </span>
                {chips ? (
                  <>
                    <span className="sr-only">WalletConnect (carteiras compatíveis)</span>
                    <span aria-hidden="true" className="rounded bg-band px-2 py-1 text-[9px] tracking-wider text-primary">
                      METAMASK · WALLETCONNECT · COINBASE
                    </span>
                  </>
                ) : (
                  WALLET_LABEL[type]
                )}
              </label>
            )
          })}
        </div>
        {errors.walletType && (
          <p role="alert" className="mt-2 text-xs text-destructive">{errors.walletType.message}</p>
        )}
      </fieldset>

      {p.connection && (
        <p role="status" className="mt-3 flex items-center justify-between gap-2 text-muted-foreground">
          <span>
            Conectada: {WALLET_LABEL[p.connection.type]} · {p.connection.network} ·{' '}
            {p.connection.address.slice(0, 6)}…{p.connection.address.slice(-4)}
          </span>
          <button
            type="button"
            className="text-primary underline"
            disabled={p.disconnecting || busy}
            onClick={p.onDisconnect}
          >
            Desconectar
          </button>
        </p>
      )}

      {p.changed && (
        <div role="alert" className="mt-4 border border-primary p-3">
          <p>Os valores do seu pedido mudaram. Revise o novo total antes de confirmar.</p>
          <Button type="button" size="sm" className="mt-2" onClick={p.onAcknowledge}>Revisar e continuar</Button>
        </div>
      )}
      {p.banner && (
        <div role="alert" className="mt-4 border border-destructive p-3">
          <p>{p.banner.message}</p>
          {p.banner.kind === 'unknown' && (
            <Button type="button" size="sm" className="mt-2" disabled={busy} onClick={p.onRecover}>
              {busy ? 'Verificando…' : 'Verificar pedido'}
            </Button>
          )}
        </div>
      )}
      {!p.quote.canCheckout && (
        <p role="status" className="mt-3 text-destructive">
          Há itens indisponíveis. <Link to="/carrinho" className="underline">Ajustar no carrinho</Link>
        </p>
      )}

      <Button type="submit" form="checkout-form" className="mt-5 w-full" disabled={blocked} aria-busy={busy || undefined}>
        {label}
      </Button>
    </aside>
  )
}