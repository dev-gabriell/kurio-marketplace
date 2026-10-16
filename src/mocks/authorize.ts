import type { StoredUser } from './fixtures/users'
import { applyScenario } from './scenarios'
import { authenticate } from '../mocks/fixtures/session'

/** Cenário → autenticação. Devolve a resposta de erro ou o usuário. */
export async function authorize(request: Request): Promise<Response | StoredUser> {
  const failure = await applyScenario(request)
  if (failure) return failure
  const auth = authenticate(request)
  return auth.ok ? auth.user : auth.response
}