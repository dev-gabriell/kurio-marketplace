import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuthNavigation } from '@/features/auth/navigation'
import { useSession } from '@/features/auth/queries'
import { useApplyCoupon, useRemoveCoupon } from '@/features/cart/mutations'
import type { Quote } from '@/features/cart/schemas'
import { isApiError } from '@/lib/http'
import { formatEth } from '@/lib/money'

// O Figma mostra o desconto zerado como "00.00" (sem unidade); com cupom, mostra o valor
const discountText = (discount: string) =>
  Number(discount) === 0 ? '(-) 00.00' : `(-) ${formatEth(discount)}`

export function OrderSummary({ quote }: { quote: Quote }) {
  const { user } = useSession()
  const { openAuth } = useAuthNavigation()
  const apply = useApplyCoupon()
  const dropCoupon = useRemoveCoupon()
  const [code, setCode] = useState('')

  function onApply(e: FormEvent) {
    e.preventDefault()
    apply.mutate(code, { onSuccess: () => setCode('') })
  }

  function onCheckout() {
    // O checkout exige login: o visitante entra e volta para o carrinho
    if (!user) return openAuth('login', { resume: true })
    // TODO (passo do pagamento): navegar para o checkout
    toast('O pagamento será conectado no próximo passo.')
  }

  return (
    <aside aria-labelledby="resumo-titulo" className="text-xs">
      <h2 id="resumo-titulo" className="border-b border-primary/40 pb-3 text-base font-bold">
        Resumo da carteira
      </h2>

      <form onSubmit={onApply} noValidate className="mt-5">
        <label htmlFor="cupom" className="font-bold">Código promocional</label>
        <div className="mt-2 flex">
          <input
            id="cupom"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Digite o código promocional..."
            autoComplete="off"
            aria-invalid={!!apply.error}
            aria-describedby={apply.error ? 'cupom-erro' : undefined}
            className="h-9 min-w-0 flex-1 rounded-l border border-primary/60 bg-background px-2 placeholder:text-muted-foreground"
          />
          <Button type="submit" className="h-9 rounded-l-none" disabled={apply.isPending || !code.trim()}>
            {apply.isPending ? 'Aplicando…' : 'Aplicar'}
          </Button>
        </div>
        {apply.error && (
          <p id="cupom-erro" role="alert" className="mt-2 text-destructive">
            {isApiError(apply.error) ? apply.error.message : 'Não foi possível aplicar o cupom.'}
          </p>
        )}
      </form>

      {quote.coupon && (
        <p className="mt-3">
          Cupom <strong>{quote.coupon.code}</strong> aplicado ({quote.coupon.description}){' '}
          <button type="button" className="text-primary underline" onClick={() => dropCoupon.mutate()}>
            Remover
          </button>
        </p>
      )}
      {quote.couponError && (
        <p role="alert" className="mt-3 text-destructive">
          {quote.couponError.message}{' '}
          <button type="button" className="underline" onClick={() => dropCoupon.mutate()}>
            Remover cupom
          </button>
        </p>
      )}

      <dl className="mt-6 space-y-3">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatEth(quote.subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt>Desconto do lançamento</dt>
          <dd>{discountText(quote.discount)}</dd>
        </div>
        <div>
          <div className="flex justify-between"><dt>Taxa de rede</dt><dd>{formatEth(quote.networkFee)}</dd></div>
          <p className="mt-1 text-right text-[10px] text-primary">Taxa estimada</p>
        </div>
        <div className="flex justify-between pt-4 text-sm font-bold">
          <dt>Total</dt>
          <dd className="text-primary">{formatEth(quote.total)}</dd>
        </div>
      </dl>

      <Button type="button" className="mt-5 w-full" disabled={!quote.canCheckout} onClick={onCheckout}>
        Conectar e finalizar
      </Button>
      {!quote.canCheckout && (
        <p role="status" className="mt-2 text-destructive">
          Ajuste os itens indisponíveis para continuar.
        </p>
      )}
      <Link to="/" hash="catalogo" className="mt-4 block text-center text-primary">
        Continuar explorando
      </Link>
    </aside>
  )
}