import { request } from '../lib/http'
import type { Category } from './types'

export type CategoryPatch = { name?: string; color?: string }

export const categoriesApi = {
  list: () => request<Category[]>('/categories'),

  create: (name: string, color?: string) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify({ name, color }) }),

  update: (id: string, patch: CategoryPatch) =>
    request<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  remove: (id: string) => request<void>(`/categories/${id}`, { method: 'DELETE' }),
}
