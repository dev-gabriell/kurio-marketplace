import { Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { useRemoveCartItem, useUpdateCartItem } from '@/features/cart/mutations'
import { MAX_PER_LINE, type QuoteLine } from '@/features/cart/schemas'
import { QuantityStepper } from '@/features/nft/QuantityStepper'
import { formatEth } from '@/lib/money'

// Mesmas larguras no cabeçalho e nas linhas, para as colunas alinharem
const GRID = 'md:grid-cols-[minmax(0,1fr)_96px_100px_100px_32px]'

function issueText(line: QuoteLine) {
  if (line.issue === 'sold_out') return 'Esgotado: este item não entra no total.'
  if (line.issue === 'unavailable') return 'Indisponível: este item não entra no total.'
  if (line.issue === 'insufficient_stock') {
    return `Só há ${line.available} disponível(is). O total considera ${line.payableQuantity}.`
  }
  return null
}

function CartRow({ line }: { line: QuoteLine }) {
  const update = useUpdateCartItem(line.itemId)
  const remove = useRemoveCartItem()
  // Mostra a quantidade pedida na hora; se a alteração falhar, volta ao valor do servidor
  const shownQuantity = update.isPending ? update.variables : line.quantity
  const issue = issueText(line)

  return (
    <li className={`relative grid grid-cols-3 items-center gap-3 bg-card p-3 md:gap-4 ${GRID}`}>
      <div className="col-span-3 flex items-center gap-4 pr-8 md:col-span-1 md:pr-0">
        <img src={line.image} alt="" width={48} height={48} className="size-12 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 text-xs">
          <Link
            to="/nft/$id"
            params={{ id: line.nftId }}
            className="block truncate text-sm font-bold hover:text-primary"
          >
            {line.name}
          </Link>
          <p className="truncate text-muted-foreground">
            ID do token: {line.tokenId} · {line.editionLabel}
          </p>
        </div>
      </div>

      <p className="text-sm font-bold text-primary">
        <span className="sr-only">Preço: </span>
        {formatEth(line.unitPrice)}
      </p>
      <div className="justify-self-center">
        <QuantityStepper
          compact
          label={`Quantidade de ${line.name}`}
          value={shownQuantity}
          max={Math.min(line.available, MAX_PER_LINE)}
          disabled={remove.isPending}
          onChange={(quantity) => update.mutate(quantity)}
        />
      </div>
      <p className="justify-self-end text-sm font-bold text-primary md:justify-self-start">
        <span className="sr-only">Total: </span>
        {formatEth(line.lineTotal)}
      </p>

      <button
        type="button"
        aria-label={`Remover ${line.name} do carrinho`}
        disabled={remove.isPending}
        onClick={() => remove.mutate(line.itemId)}
        className="absolute right-3 top-3 grid size-6 place-items-center text-primary md:static md:justify-self-end"
      >
        <Trash2 className="size-4" />
      </button>

      {issue && (
        <p role="status" className="col-span-3 text-xs text-destructive md:col-span-5">
          {issue}
        </p>
      )}
    </li>
  )
}

export function CartTable({ lines }: { lines: QuoteLine[] }) {
  return (
    <div>
      <div
        aria-hidden="true"
        className={`hidden border-b border-primary/40 pb-2 text-sm font-bold md:grid md:gap-4 md:px-3 ${GRID}`}
      >
        <span>NFTs</span>
        <span>Preço</span>
        <span>Edições</span>
        <span>Total</span>
        <span />
      </div>
      <ul aria-label="Itens do carrinho" className="mt-3 space-y-3">
        {lines.map((line) => <CartRow key={line.itemId} line={line} />)}
      </ul>
    </div>
  )
}