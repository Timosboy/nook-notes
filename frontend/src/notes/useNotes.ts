import { useCallback, useEffect, useState } from 'react'
import { notesApi } from './api'
import type { Note } from './types'

type Result = {
  archived: boolean
  notes: Note[]
  error: string | null
}

const messageOf = (err: unknown) => (err instanceof Error ? err.message : 'Something went wrong')

const byPinnedAndLatest = (a: Note, b: Note) =>
  Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)

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

  const updateNotes = useCallback((change: (notes: Note[]) => Note[]) => {
    setResult((current) => current && { ...current, notes: change(current.notes) })
  }, [])

  const upsert = useCallback(
    (note: Note) =>
      updateNotes((notes) => [note, ...notes.filter(({ id }) => id !== note.id)].sort(byPinnedAndLatest)),
    [updateNotes],
  )

  const patch = useCallback(
    (id: string, change: (note: Note) => Note) =>
      updateNotes((notes) => notes.map((note) => (note.id === id ? change(note) : note))),
    [updateNotes],
  )

  const drop = useCallback(
    (id: string) => updateNotes((notes) => notes.filter((note) => note.id !== id)),
    [updateNotes],
  )

  const current = result?.archived === archived ? result : null

  return {
    notes: current?.notes ?? [],
    loading: !current,
    error: current?.error ?? null,
    reload,
    upsert,
    patch,
    drop,
  }
}
