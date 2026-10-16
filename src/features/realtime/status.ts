import { useSyncExternalStore } from 'react'

export type SocketStatus = 'connecting' | 'connected' | 'disconnected'

let status: SocketStatus = 'disconnected'
const listeners = new Set<() => void>()

export function setSocketStatus(next: SocketStatus) {
  if (next === status) return
  status = next
  listeners.forEach((l) => l())
}

export function useSocketStatus() {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    () => status,
  )
}