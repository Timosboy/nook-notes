import { request } from '../lib/http'
import type { Note, NoteInput } from './types'

const json = (body: unknown) => JSON.stringify(body)

export const notesApi = {
  list: (archived = false) => request<Note[]>(`/notes?archived=${archived}`),

  create: (input: NoteInput) => request<Note>('/notes', { method: 'POST', body: json(input) }),

  update: (id: string, input: Partial<NoteInput>) =>
    request<Note>(`/notes/${id}`, { method: 'PATCH', body: json(input) }),

  remove: (id: string) => request<void>(`/notes/${id}`, { method: 'DELETE' }),

  archive: (id: string) => request<Note>(`/notes/${id}/archive`, { method: 'PATCH' }),

  unarchive: (id: string) => request<Note>(`/notes/${id}/unarchive`, { method: 'PATCH' }),

  addCategory: (id: string, categoryId: string) =>
    request<Note>(`/notes/${id}/categories/${categoryId}`, { method: 'PUT' }),

  removeCategory: (id: string, categoryId: string) =>
    request<Note>(`/notes/${id}/categories/${categoryId}`, { method: 'DELETE' }),
}
