import { delay, HttpResponse } from 'msw'

export const SCENARIOS = [
  'default',
  'slow',
  'random-latency',
  'error-500',
  'offline',
  'empty',
  'favorite-error',
  'wallet-rejected', // a carteira recusa a conexão
  'payment-declined', // o pedido é criado e depois recusado
  'timeout-after-create', // o pedido é criado, mas a resposta nunca chega
] as const
export type ScenarioName = (typeof SCENARIOS)[number]

const KEY = 'kurio:scenario'

/** Lê ?scenario=... da URL uma vez, na inicialização, e persiste. */
export function initScenario() {
  const fromUrl = new URLSearchParams(window.location.search).get('scenario')
  if (fromUrl && (SCENARIOS as readonly string[]).includes(fromUrl)) {
    localStorage.setItem(KEY, fromUrl)
  }
}

export function getScenario(): ScenarioName {
  const v = localStorage.getItem(KEY)
  return (SCENARIOS as readonly string[]).includes(v ?? '') ? (v as ScenarioName) : 'default'
}

export const setScenario = (s: ScenarioName) => localStorage.setItem(KEY, s)

// Latência determinística por URL: a mesma busca sempre demora o mesmo tempo
function hash(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Aplica latência/falha do cenário ativo. Retorna uma Response se a requisição deve falhar. */
export async function applyScenario(request: Request): Promise<Response | null> {
  switch (getScenario()) {
    case 'slow':
      await delay(2500)
      return null
    case 'random-latency':
      await delay(200 + (hash(request.url) % 1800))
      return null
    case 'error-500':
      await delay(300)
      return HttpResponse.json(
        { code: 'server_error', message: 'Falha temporária no servidor simulado.' },
        { status: 500 },
      )
    case 'offline':
      return HttpResponse.error()
    default:
      await delay(250)
      return null
  }
}