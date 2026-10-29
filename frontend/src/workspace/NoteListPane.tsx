import type { ReactNode, Ref } from 'react'
import type { Note } from '../notes/types'
import { NoteRow } from './NoteRow'
import { SearchField } from './SearchField'

type Props = {
  title: string
  notes: Note[]
  selectedId: string | null
  query: string
  searchRef: Ref<HTMLInputElement>
  onQueryChange: (query: string) => void
  onSelect: (id: string) => void
  children?: ReactNode
}

export function NoteListPane({
  title,
  notes,
  selectedId,
  query,
  searchRef,
  onQueryChange,
  onSelect,
  children,
}: Props) {
  return (
    <section className="list-pane" aria-label={title}>
      <header className="list-header">
        <h1 className="list-title">{title}</h1>
        <span className="list-count">{notes.length}</span>
      </header>

      <div className="list-search">
        <SearchField ref={searchRef} value={query} onChange={onQueryChange} />
      </div>

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
