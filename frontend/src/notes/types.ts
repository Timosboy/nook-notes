import type { Category } from '../categories/types'

export type Note = {
  id: string
  title: string
  content: string
  archived: boolean
  categories: Category[]
  createdAt: string
  updatedAt: string
}

export type NoteInput = {
  title: string
  content: string
}
