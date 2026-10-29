import type { ReactNode, Ref } from 'react'
import { AnimatePresence } from 'motion/react'
import { PushPin } from '@phosphor-icons/react'
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
  inert?: boolean
}

function partitionNotes(notes: Note[]) {
  return {
    pinned: notes.filter((note) => note.pinned),
    others: notes.filter((note) => !note.pinned),
  }
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
  inert,
}: Props) {
  const { pinned: pinnedNotes, others: otherNotes } = partitionNotes(notes)
  const hasPinned = pinnedNotes.length > 0

  const renderRow = (note: Note, order: number) => (
    <NoteRow
      key={note.id}
      note={note}
      order={order}
      selected={note.id === selectedId}
      onSelect={() => onSelect(note.id)}
    />
  )

  return (
    <section className="list-pane" aria-label={title} inert={inert}>
      <div className="list-pane-content">
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
              {hasPinned && (
                <li className="note-section-heading" role="presentation" key="pinned-heading">
                  <PushPin size={12} weight="fill" aria-hidden="true" />
                  <span>Pinned</span>
                </li>
              )}
              {pinnedNotes.map((note, index) => renderRow(note, index))}
              {hasPinned && otherNotes.length > 0 && (
                <li className="note-section-heading" role="presentation" key="others-heading">
                  Others
                </li>
              )}
              {otherNotes.map((note, index) => renderRow(note, pinnedNotes.length + index))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </section>
  )
}
