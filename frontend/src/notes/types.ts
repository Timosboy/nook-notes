export type Note = {
  id: string
  title: string
  content: string
  archived: boolean
  createdAt: string
  updatedAt: string
}

export type NoteInput = {
  title: string
  content: string
}
