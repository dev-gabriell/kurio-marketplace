import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { NftDetail } from '@/features/catalog/schemas'
import { DetailTabs } from './DetailTabs'
import { NftGallery } from './NftGallery'
import { NftInfo } from './NftInfo'
import { RelatedCarousel } from './RelatedCarousel'

export function NftDetailView({ nft }: { nft: NftDetail }) {
  const [editionId, setEditionId] = useState<string>()

  // Só edições disponíveis podem ficar selecionadas; se a escolhida esgotar, cai na primeira disponível
  const selected =
    nft.editionOptions.find((o) => o.id === editionId && o.available > 0) ??
    nft.editionOptions.find((o) => o.available > 0)

  useEffect(() => {
    document.title = `${nft.name} · Kurio`
    return () => {
      document.title = 'Kurio'
    }
  }, [nft.name])

  return (
    <>
      <nav aria-label="Trilha de navegação" className="text-xs font-bold">
        <Link to="/" className="hover:text-primary">Início</Link>
        {' / '}
        <Link to="/" hash="catalogo" className="hover:text-primary">Mercado</Link>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <NftGallery name={nft.name} images={nft.gallery} />
        <NftInfo nft={nft} selected={selected} onEditionChange={setEditionId} />
      </div>

      <DetailTabs nft={nft} editionLabel={selected?.label ?? nft.editionOptions[0].label} />
      <RelatedCarousel nft={nft} />
    </>
  )
}