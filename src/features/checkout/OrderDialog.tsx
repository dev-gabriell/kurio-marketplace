import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { formatEth } from '@/lib/money'
import { EXPLORER, WALLET_LABEL, type Order } from './schemas'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function formatReceiptDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}

export const shortHash = (hash: string) => `0x${hash.slice(2, 6).toUpperCase()}…${hash.slice(-4).toUpperCase()}`

function Envelope() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Agradecimento" className="mx-auto size-16 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="22" width="52" height="34" rx="3" />
      <path d="M6 26l26 18 26-18" />
      <rect x="18" y="8" width="28" height="24" rx="2" />
      <text x="32" y="19" textAnchor="middle" fontSize="6" fontWeight="700" fill="currentColor" stroke="none">THANK</text>
      <text x="32" y="27" textAnchor="middle" fontSize="6" fontWeight="700" fill="currentColor" stroke="none">YOU</text>
    </svg>
  )
}

function Confirmed({ order }: { order: Order }) {
  const { receipt } = order
  const explorer = EXPLORER[receipt.wallet.network]
  const meta = [
    ['ID da transação', order.txHash ? shortHash(order.txHash) : '—'],
    ['Data', formatReceiptDate(order.updatedAt)],
    ['Total', formatEth(receipt.total)],
    ['Carteira', WALLET_LABEL[receipt.wallet.type]],
  ]
  const row = 'grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4'

  return (
    <>
      <Envelope />
      <DialogTitle className="mt-3 text-center text-sm font-normal text-primary">
        Seus NFTs agora estão na sua carteira
      </DialogTitle>
      <DialogDescription className="sr-only">Recibo do pedido {order.id}</DialogDescription>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-b border-border pb-4 text-[11px] sm:grid-cols-4">
        {meta.map(([term, value]) => (
          <div key={term}>
            <dt className="font-bold text-primary">{term}</dt>
            <dd className="mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="detalhes" className="mt-4">
        <h3 id="detalhes" className="text-xs font-bold">Detalhes da transação</h3>
        <div aria-hidden="true" className={`${row} mt-2 border-b border-border pb-1 text-[11px] font-bold`}>
          <span>NFTs</span><span>Edições</span><span className="text-right">Subtotal</span>
        </div>
        <ul aria-label="NFTs comprados">
          {receipt.lines.map((l) => (
            <li key={`${l.nftId}-${l.editionLabel}`} className={`${row} py-2 text-xs`}>
              <div className="flex min-w-0 items-center gap-3">
                <img src={l.image} alt="" width={40} height={40} className="size-10 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-bold">{l.name}</p>
                  <p className="truncate text-muted-foreground">ID do token: {l.tokenId}</p>
                </div>
              </div>
              <span>(x {l.quantity})</span>
              <span className="text-right font-bold text-primary">{formatEth(l.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-2 space-y-1 border-t border-border pt-2 text-xs">
          {Number(receipt.discount) > 0 && (
            <div className="flex justify-end gap-6"><dt>Desconto</dt><dd>(-) {formatEth(receipt.discount)}</dd></div>
          )}
          <div className="flex justify-end gap-6"><dt>Taxa de rede</dt><dd>{formatEth(receipt.networkFee)}</dd></div>
          <div className="flex justify-end gap-6 text-sm font-bold">
            <dt>Total</dt><dd className="text-primary">{formatEth(receipt.total)}</dd>
          </div>
        </dl>
      </section>

      <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">
        Transação confirmada na {receipt.wallet.network}. A propriedade foi transferida para sua carteira
        conectada e registrada na rede.
      </p>
      {order.txHash && (
        <div className="mt-4 text-center">
          <Button asChild>
            <a href={`${explorer.url}${order.txHash}`} target="_blank" rel="noopener noreferrer">
              Ver no {explorer.name}
              <span className="sr-only"> (abre em nova aba; transação simulada)</span>
            </a>
          </Button>
        </div>
      )}
    </>
  )
}

function Pending({ order }: { order: Order }) {
  return (
    <div className="py-6 text-center">
      <Loader2 className="mx-auto size-10 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
      <DialogTitle className="mt-4 text-base">Processando seu pagamento</DialogTitle>
      <DialogDescription className="mt-2 text-xs leading-5">
        Aguardando a confirmação na rede. Você pode recarregar a página: o pedido {order.id} está salvo e não será cobrado duas vezes.
      </DialogDescription>
      <p role="status" className="sr-only">Pedido pendente</p>
    </div>
  )
}

function Refused({ order }: { order: Order }) {
  return (
    <div className="py-6 text-center">
      <DialogTitle className="text-base text-destructive">Pagamento recusado</DialogTitle>
      <DialogDescription className="mt-2 text-xs leading-5">
        {order.refusalReason ?? 'O pagamento não foi aprovado.'} Seus itens continuam no carrinho.
      </DialogDescription>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button asChild><Link to="/pagamento">Voltar ao pagamento</Link></Button>
        <Button asChild variant="outline"><Link to="/carrinho">Ver carrinho</Link></Button>
      </div>
    </div>
  )
}

export function OrderDialog({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto border-0 bg-card sm:max-w-[520px]">
        {order.status === 'confirmed' && <Confirmed order={order} />}
        {order.status === 'pending' && <Pending order={order} />}
        {order.status === 'refused' && <Refused order={order} />}
      </DialogContent>
    </Dialog>
  )
}