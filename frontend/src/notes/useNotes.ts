import { useCallback, useEffect, useState } from 'react'
import { notesApi } from './api'
import type { Note } from './types'

type Result = {
  archived: boolean
  notes: Note[]
  error: string | null
}

const messageOf = (err: unknown) => (err instanceof Error ? err.message : 'Something went wrong')

export function useNotes(archived: boolean) {
  const [result, setResult] = useState<Result | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let ignore = false

    notesApi
      .list(archived)
      .then((notes) => !ignore && setResult({ archived, notes, error: null }))
      .catch((err) => !ignore && setResult({ archived, notes: [], error: messageOf(err) }))

    return () => {
      ignore = true
    }
  }, [archived, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  const current = result?.archived === archived ? result : null

  return {
    notes: current?.notes ?? [],
    loading: !current,
    error: current?.error ?? null,
    reload,
  }
}
