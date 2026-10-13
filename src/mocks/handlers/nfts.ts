// src/mocks/handlers/nfts.ts
import { http, HttpResponse } from 'msw'
import { catalogSearchSchema } from '@/features/catalog/schemas'
import { findNft, queryNfts } from '../db'
import { applyScenario, getScenario } from '../scenarios'

export const nftHandlers = [
  http.get('/api/nfts', async ({ request }) => {
    const failure = await applyScenario(request)
    if (failure) return failure

    const params = Object.fromEntries(new URL(request.url).searchParams)
    const result = queryNfts(catalogSearchSchema.parse(params))
    if (getScenario() === 'empty') {
      return HttpResponse.json({ ...result, items: [], total: 0, page: 1, totalPages: 1 })
    }
    return HttpResponse.json(result)
  }),

  http.get('/api/nfts/:id', async ({ request, params }) => {
    const failure = await applyScenario(request)
    if (failure) return failure

    const nft = findNft(String(params.id))
    if (!nft) {
      return HttpResponse.json({ code: 'not_found', message: 'NFT não encontrado.' }, { status: 404 })
    }
    return HttpResponse.json(nft)
  }),
]