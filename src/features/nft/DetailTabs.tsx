import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { NftDetail } from '@/features/catalog/schemas'
import { Stars } from './Stars'

const trigger =
  'flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-2 text-sm shadow-none ' +
  'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none'

const shortAddress = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`

export function DetailTabs({ nft, editionLabel }: { nft: NftDetail; editionLabel: string }) {
  const { contract } = nft
  return (
    <Tabs defaultValue="details" className="mt-14">
      <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-primary/40 bg-transparent p-0">
        <TabsTrigger value="details" className={trigger}>Detalhes do NFT</TabsTrigger>
        <TabsTrigger value="reviews" className={trigger}>
          Avaliações de colecionadores ({nft.rating.count})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="mt-5 space-y-4 text-xs leading-6 text-muted-foreground">
        <p>
          {nft.name} é uma obra digital {editionLabel.toLowerCase()} finalizada à mão da coleção{' '}
          {nft.collection}. Cada atributo fica armazenado nos metadados do token e verificado na{' '}
          {nft.network}. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.
        </p>
        <p>
          A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um
          registro permanente de procedência registrada na rede. {nft.creator} recebe{' '}
          {contract.royaltyPercent}% de direitos autorais nas vendas secundárias, apoiando novos trabalhos
          e lançamentos da comunidade.
        </p>
        <div>
          <h3 className="font-bold text-foreground">Rede:</h3>
          <p>Cunhado na {nft.network} com procedência imutável e metadados armazenados no IPFS.</p>
        </div>
        <div>
          <h3 className="font-bold text-foreground">Direitos autorais:</h3>
          <p>
            Direitos autorais do criador: {contract.royaltyPercent}% nas vendas secundárias, pagos
            automaticamente pelos mercados compatíveis.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-foreground">Contrato:</h3>
          <p>
            <span title={contract.address}>{shortAddress(contract.address)}</span> · Contrato inteligente{' '}
            {contract.standard} verificado.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-5">
        <p className="text-xs text-muted-foreground">
          Mostrando {nft.reviews.length} de {nft.rating.count} avaliações.
        </p>
        <ul className="mt-4 space-y-5">
          {nft.reviews.map((r) => (
            <li key={r.id} className="text-xs leading-6">
              <div className="flex items-center gap-3">
                <span className="font-bold">{r.author}</span>
                <Stars value={r.rating} />
                <time dateTime={r.date} className="text-muted-foreground">
                  {new Date(r.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </time>
              </div>
              <p className="mt-1 text-muted-foreground">{r.text}</p>
            </li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  )
}