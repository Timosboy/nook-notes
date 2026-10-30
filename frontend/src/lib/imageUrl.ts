import { useEffect, useState } from 'react'
import { authorizedFetch, BASE_URL } from './http'
import { onSessionEnd } from './session'

const loaded = new Map<string, Promise<string>>()
const objectUrls = new Set<string>()

onSessionEnd(() => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url))
  objectUrls.clear()
  loaded.clear()
})

function isStored(path: string) {
  return path.startsWith('/api/notes/')
}

export function loadImage(path: string): Promise<string> {
  if (!isStored(path)) return Promise.resolve(resolveImageUrl(path))
  const cached = loaded.get(path)
  if (cached) return cached

  const pending = authorizedFetch(resolveImageUrl(path)).then(async (response) => {
    if (!response.ok) throw new Error('Image not available')
    const url = URL.createObjectURL(await response.blob())
    objectUrls.add(url)
    return url
  })
  pending.catch(() => loaded.delete(path))
  loaded.set(path, pending)
  return pending
}

export function useImageSource(path: string | null) {
  const [source, setSource] = useState<{ path: string, url: string } | null>(null)

  useEffect(() => {
    if (!path) return
    let active = true
    loadImage(path).then((url) => {
      if (active) setSource({ path, url })
    }).catch(() => undefined)
    return () => {
      active = false
    }
  }, [path])

  return source && source.path === path ? source.url : undefined
}

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
