import { useSyncExternalStore } from 'react'

export type User = {
  id: string
  name: string
  email: string
}

export type Session = {
  token: string
  user: User
}

const STORAGE_KEY = 'nook-session'
const subscribers = new Set<() => void>()
const endListeners = new Set<() => void>()
let session = readSession()
let expired = false

function readSession(): Session | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Partial<Session>
    return parsed.token && parsed.user ? (parsed as Session) : null
  } catch {
    return null
  }
}

function writeSession(next: Session | null) {
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}

function notify() {
  subscribers.forEach((subscriber) => subscriber())
}

export function getToken() {
  return session?.token ?? null
}

export function startSession(next: Session) {
  session = next
  expired = false
  writeSession(next)
  notify()
}

export function updateUser(user: User) {
  if (!session) return
  session = { ...session, user }
  writeSession(session)
  notify()
}

export function endSession(reason: 'signed-out' | 'expired' = 'signed-out') {
  if (!session) return
  session = null
  expired = reason === 'expired'
  writeSession(null)
  endListeners.forEach((listener) => listener())
  notify()
}

export function onSessionEnd(listener: () => void) {
  endListeners.add(listener)
  return () => endListeners.delete(listener)
}

export function sessionExpired() {
  return expired
}

function subscribe(callback: () => void) {
  subscribers.add(callback)
  return () => subscribers.delete(callback)
}

export function useSession() {
  return useSyncExternalStore(subscribe, () => session)
}
