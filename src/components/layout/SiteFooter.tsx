import type { FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'

const soon = () => toast('Indisponível nesta demo.')

const FEATURES = [
  { letter: 'W', title: 'Segurança da carteira', text: 'Proteja sua carteira e colecione arte digital verificada com confiança.' },
  { letter: 'C', title: 'Criadores em destaque', text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.' },
  { letter: 'D', title: 'Alertas de lançamentos', text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.' },
]
const PROFILE = ['Meu perfil', 'Minha coleção', 'Atividade', 'Estúdio do criador', 'Lista de interesse']
const HELP = ['Central de ajuda', 'Como comprar NFTs', 'Carteira e segurança', 'Política do mercado', 'Denunciar item']
const COLLECTIONS = ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade']
const SOCIALS = [
  { label: 'Facebook', glyph: 'f' }, { label: 'Instagram', glyph: 'ig' },
  { label: 'Twitter', glyph: 'x' }, { label: 'LinkedIn', glyph: 'in' }, { label: 'YouTube', glyph: 'yt' },
]

const linkClass = 'block py-1 text-xs hover:text-primary'

export function SiteFooter() {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    toast.success('Inscrição simulada. Nenhum e-mail foi enviado.')
    e.currentTarget.reset()
  }

  return (
    <footer className="mx-auto w-full max-w-6xl px-6 pb-4">
      <div className="bg-card">
        <div className="grid gap-6 p-8 md:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="border-primary/40 md:border-r md:pr-4">
              <div className="grid size-14 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                {f.letter}
              </div>
              <h3 className="mt-4 text-sm font-bold">{f.title}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{f.text}</p>
            </div>
          ))}
          <form onSubmit={onSubmit}>
            <h3 className="text-sm font-bold">Antecipe-se ao próximo lançamento</h3>
            <div className="mt-3 flex">
              <label htmlFor="newsletter" className="sr-only">E-mail</label>
              <input
                id="newsletter"
                type="email"
                required
                placeholder="digite seu e-mail..."
                className="min-w-0 flex-1 bg-band px-3 py-2 text-xs placeholder:text-muted-foreground"
              />
              <button type="submit" className="bg-primary px-4 text-sm font-bold text-primary-foreground">Enviar</button>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
            </p>
          </form>
        </div>

        <div className="grid gap-3 bg-band px-8 py-5 text-xs md:grid-cols-4">
          <span className="font-bold">KURIO</span>
          <span>Feito para colecionadores, criadores e cultura</span>
          <span>contato@email.com</span>
          <span>+55 11 4002 8922</span>
        </div>

        <div className="grid gap-8 p-8 md:grid-cols-4">
          <nav aria-label="Meu perfil">
            <h3 className="mb-2 font-bold">Meu perfil</h3>
            {PROFILE.map((l) => <button key={l} type="button" onClick={soon} className={linkClass}>{l}</button>)}
          </nav>
          <nav aria-label="Central de ajuda">
            <h3 className="mb-2 font-bold">Central de ajuda</h3>
            {HELP.map((l) => <button key={l} type="button" onClick={soon} className={linkClass}>{l}</button>)}
          </nav>
          <nav aria-label="Coleções">
            <h3 className="mb-2 font-bold">Coleções</h3>
            {COLLECTIONS.map((c) => (
              <Link key={c} to="/" search={{ collection: c }} hash="catalogo" className={linkClass}>{c}</Link>
            ))}
          </nav>
          <div>
            <h3 className="mb-2 font-bold">Redes sociais</h3>
            <div className="flex gap-2">
              {SOCIALS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  aria-label={s.label}
                  onClick={soon}
                  className="grid size-7 place-items-center rounded border border-primary/70 text-[10px] font-bold text-primary"
                >
                  {s.glyph}
                </button>
              ))}
            </div>
            <h3 className="mb-2 mt-6 font-bold">Carteiras compatíveis</h3>
            <span className="inline-block rounded bg-band px-3 py-2 text-[9px] tracking-wider text-primary">
              METAMASK · WALLETCONNECT · COINBASE
            </span>
          </div>
        </div>
      </div>
      <p className="py-3 text-center text-[11px]">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  )
}