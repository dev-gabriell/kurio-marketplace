import { useState, type ReactNode } from 'react'
import { Heart, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { EditionOption, NftDetail } from '@/features/catalog/schemas'
import { formatEth } from '@/lib/money'
import { EditionPicker } from './EditionPicker'
import { QuantityStepper } from './QuantityStepper'
import { Stars } from './Stars'

const MAX_PER_ORDER = 10

interface Props {
  nft: NftDetail
  selected?: EditionOption
  onEditionChange: (id: string) => void
}

interface ShareLink {
  label: string
  href: string
  content: ReactNode
}

function shareLinks(name: string): ShareLink[] {
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(`${name} na Kurio`)
  return [
    { label: 'Compartilhar no LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`, content: 'in' },
    { label: 'Compartilhar por e-mail', href: `mailto:?subject=${text}&body=${url}`, content: <Mail className="size-3.5" /> },
    { label: 'Compartilhar no X', href: `https://twitter.com/intent/tweet?text=${text}&url=${url}`, content: 'x' },
  ]
}

export function NftInfo({ nft, selected, onEditionChange }: Props) {
  const [quantity, setQuantity] = useState(1)

  const max = selected ? Math.min(selected.available, MAX_PER_ORDER) : 0
  const qty = Math.max(1, Math.min(quantity, max)) // sempre dentro do limite da edição
  const soldOut = !selected

  // TODO (passos de auth e carrinho): trocar por addToCart e toggleFavorite reais
  const onBuy = () => toast('A compra será conectada ao carrinho no próximo passo.')
  const onFavorite = () => toast('Favoritos serão conectados ao login no próximo passo.')

  return (
    <div>
      <h1 className="text-2xl font-bold">{nft.name}</h1>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-b border-primary/40 pb-3">
        <p className="text-xl font-bold text-primary">
          {formatEth(nft.price)}
          {nft.originalPrice && (
            <>
              {' '}
              <s className="text-sm font-normal text-muted-foreground">
                <span className="sr-only">preço original </span>
                {formatEth(nft.originalPrice)}
              </s>
            </>
          )}
        </p>
        <p className="flex items-center gap-2 text-xs">
          <Stars value={nft.rating.average} />
          {nft.rating.count} avaliações de colecionadores
        </p>
      </div>

      <h2 className="mt-4 text-sm font-bold">Sobre este NFT:</h2>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">{nft.description}</p>

      <div className="mt-4">
        <EditionPicker options={nft.editionOptions} value={selected?.id} onChange={onEditionChange} />
        <p className="mt-2 text-xs text-muted-foreground" role="status">
          {soldOut
            ? 'Todas as edições estão esgotadas.'
            : `${selected.available} ${selected.available === 1 ? 'disponível' : 'disponíveis'} nesta edição.`}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <QuantityStepper value={qty} max={max} disabled={soldOut} onChange={setQuantity} />
        <div className="flex gap-3">
          <Button type="button" disabled={soldOut} onClick={onBuy}>COMPRAR</Button>
          <Button type="button" variant="outline" onClick={onFavorite}>
            <Heart className="size-4" /> Favoritar
          </Button>
        </div>
      </div>
      <p className="mt-2 min-h-4 text-xs text-muted-foreground" aria-live="polite">
        {!soldOut && qty >= max
          ? `Limite de ${max} ${max === 1 ? 'unidade' : 'unidades'} para esta edição.`
          : ''}
      </p>

      <dl className="mt-4 space-y-3 text-xs text-muted-foreground">
        <div><dt className="inline">ID do token: </dt><dd className="inline">{nft.tokenId}</dd></div>
        <div><dt className="inline">Coleção: </dt><dd className="inline">{nft.collection}</dd></div>
        <div><dt className="inline">Atributos: </dt><dd className="inline">{nft.attributes.join(', ')}</dd></div>
      </dl>

      <div className="mt-3 flex items-center gap-2 text-xs font-bold">
        <span>Compartilhar este NFT:</span>
        {shareLinks(nft.name).map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.label} (abre em nova aba)`}
            className="grid size-6 place-items-center rounded border border-primary/70 text-[10px] font-bold text-primary"
          >
            {s.content}
          </a>
        ))}
      </div>
    </div>
  )
}