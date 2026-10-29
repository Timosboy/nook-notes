import { BASE_URL } from './http'

export function storedImagePath(noteId: string, imageId: string) {
  return `/api/notes/${noteId}/images/${imageId}`
}

export function resolveImageUrl(path: string) {
  const base = BASE_URL.replace(/\/$/, '')
  const storedPrefix = '/api/notes/'

  if (path.startsWith(storedPrefix)) {
    return `${base}/notes/${path.slice(storedPrefix.length)}`
  }

  return new URL(path, `${new URL(BASE_URL).origin}/`).toString()
}
