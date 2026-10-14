import { clearToken } from '@/features/auth/token'
import { SCENARIOS, setScenario, type ScenarioName } from './scenarios'
import { getDb, persist, resetDb } from './fixtures/store'

declare global {
  interface Window {
    __kurio?: {
      reset: () => void
      expireSession: () => void
      setScenario: (scenario: ScenarioName) => void
      scenarios: readonly ScenarioName[]
    }
  }
}

function reset() {
  resetDb()
  clearToken()
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
    scenarios: SCENARIOS,
  }
}