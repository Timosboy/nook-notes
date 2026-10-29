import type { ReactNode } from 'react'
import type { Note } from '../notes/types'
import { NoteRow } from './NoteRow'

type Props = {
  title: string
  notes: Note[]
  selectedId: string | null
  onSelect: (id: string) => void
  children?: ReactNode
}

export function NoteListPane({ title, notes, selectedId, onSelect, children }: Props) {
  return (
    <section className="list-pane" aria-label={title}>
      <header className="list-header">
        <h1 className="list-title">{title}</h1>
        <span className="list-count">{notes.length}</span>
      </header>

      {children ?? (
        <ul className="note-rows">
          {notes.map((note) => (
            <NoteRow
              key={note.id}
              note={note}
              selected={note.id === selectedId}
              onSelect={() => onSelect(note.id)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
