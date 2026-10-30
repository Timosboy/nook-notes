import { request } from '../lib/http'
import type { Session, User } from '../lib/session'

export const DEMO_ACCOUNT = { email: 'demo@nook.app', password: 'nook-demo-2026' }

export const authApi = {
  login: (email: string, password: string) =>
    request<Session>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (name: string, email: string, password: string) =>
    request<Session>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  me: () => request<User>('/auth/me'),
}
