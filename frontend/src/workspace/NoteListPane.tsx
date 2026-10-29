import type { ReactNode, Ref } from 'react'
import { AnimatePresence } from 'motion/react'
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
  filter?: ReactNode
  children?: ReactNode
  listKey?: string
}

export function NoteListPane({
  title,
  notes,
  selectedId,
  query,
  searchRef,
  onQueryChange,
  onSelect,
  filter,
  children,
  listKey,
}: Props) {
  return (
    <section className="list-pane" aria-label={title}>
      <header className="list-header">
        <h1 className="list-title">{title}</h1>
        <span className="list-count">{notes.length}</span>
      </header>

      <div className="list-search">
        <SearchField ref={searchRef} value={query} onChange={onQueryChange} />
        {filter && <div className="list-filter">Filtered by {filter}</div>}
      </div>

      {children ?? (
        <ul className="note-rows" key={listKey}>
          <AnimatePresence mode="popLayout">
            {notes.map((note, index) => (
              <NoteRow
                key={note.id}
                note={note}
                order={index}
                selected={note.id === selectedId}
                onSelect={() => onSelect(note.id)}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}
