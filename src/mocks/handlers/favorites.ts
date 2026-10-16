import { delay, http, HttpResponse } from 'msw'
import { findNft } from '../db'
import type { StoredUser } from '../fixtures/users'
import { applyScenario, getScenario } from '../scenarios'
import { authenticate } from '../fixtures/session'
import { getDb, persist } from '../fixtures/store'

/** Cenário → falha simulada → autenticação. Devolve a resposta de erro ou o usuário. */
async function authorize(request: Request, isMutation = false): Promise<Response | StoredUser> {
  const failure = await applyScenario(request)
  if (failure) return failure

  if (isMutation && getScenario() === 'favorite-error') {
    await delay(300)
    return HttpResponse.json(
      { code: 'server_error', message: 'Falha simulada ao atualizar favoritos.' },
      { status: 500 },
    )
  }

  const auth = authenticate(request)
  return auth.ok ? auth.user : auth.response
}

export const favoritesHandlers = [
  http.get('/api/favorites', async ({ request }) => {
    const who = await authorize(request)
    if (who instanceof Response) return who

    const items = [...(getDb().favorites[who.id] ?? [])].sort((a, b) => a.addedAt.localeCompare(b.addedAt))
    return HttpResponse.json({ items })
  }),

  http.put('/api/favorites/:nftId', async ({ request, params }) => {
    const who = await authorize(request, true)
    if (who instanceof Response) return who

    const nftId = String(params.nftId)
    if (!findNft(nftId)) {
      return HttpResponse.json({ code: 'not_found', message: 'NFT não encontrado.' }, { status: 404 })
    }

    const db = getDb()
    const list = (db.favorites[who.id] ??= [])
    let item = list.find((f) => f.nftId === nftId)
    if (!item) {
      item = { nftId, addedAt: new Date().toISOString() }
      list.push(item)
      persist()
    }
    return HttpResponse.json(item) // idempotente: favoritar duas vezes não duplica
  }),

  http.delete('/api/favorites/:nftId', async ({ request, params }) => {
    const who = await authorize(request, true)
    if (who instanceof Response) return who

    const db = getDb()
    db.favorites[who.id] = (db.favorites[who.id] ?? []).filter((f) => f.nftId !== String(params.nftId))
    persist()
    return new HttpResponse(null, { status: 204 }) // idempotente: remover o que não existe também dá 204
  }),
]