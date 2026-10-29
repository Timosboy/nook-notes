import { request } from '../lib/http'
import type { Category, CategoryColor } from './types'

export const categoriesApi = {
  list: () => request<Category[]>('/categories'),

  create: (name: string, color: CategoryColor) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify({ name, color }) }),

  remove: (id: string) => request<void>(`/categories/${id}`, { method: 'DELETE' }),
}
