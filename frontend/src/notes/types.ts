import type { Category } from '../categories/types'

export type Note = {
  id: string
  title: string
  content: string
  archived: boolean
  pinned: boolean
  categories: Category[]
  images: NoteImage[]
  createdAt: string
  updatedAt: string
}

export type NoteImage = {
  id: string
  filename: string
  mimeType: string
  size: number
  createdAt: string
}

export type NoteInput = {
  title: string
  content: string
}
