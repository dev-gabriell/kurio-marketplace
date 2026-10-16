import { clearToken } from '@/features/auth/token'
import { clearGuestCartId } from '@/features/cart/guest'
import { SCENARIOS, setScenario, type ScenarioName } from './scenarios'
import { getDb, getOverride, persist, resetDb } from './fixtures/store'

declare global {
  interface Window {
    __kurio?: {
      reset: () => void
      expireSession: () => void
      setScenario: (scenario: ScenarioName) => void
      setPrice: (nftId: string, price: string) => void
      setStock: (nftId: string, editionId: string, available: number) => void
      scenarios: readonly ScenarioName[]
    }
  }
}

function reset() {
  resetDb()
  clearToken()
  clearGuestCartId()
  setScenario('default')
}

export function installDevTools() {
  const url = new URL(window.location.href)
  if (url.searchParams.has('reset')) {
    reset() // ?reset=1 volta ao cenário conhecido
    url.searchParams.delete('reset')
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
  }

  window.__kurio = {
    reset,
    expireSession() {
      getDb().sessions.forEach((s) => {
        s.expiresAt = new Date(0).toISOString()
      })
      persist()
    },
    setScenario,
    // Ex.: __kurio.setPrice('nft-001', '2.50')
    setPrice(nftId, price) {
      const o = getOverride(nftId)
      o.price = price
      o.version += 1
      persist()
    },
    // Ex.: __kurio.setStock('nft-001', 'e-1-50', 0)
    setStock(nftId, editionId, available) {
      const o = getOverride(nftId)
      o.stock = { ...o.stock, [editionId]: available }
      o.version += 1
      persist()
    },
    scenarios: SCENARIOS,
  }
}