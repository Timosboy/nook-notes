import type { ReactNode, Ref } from 'react'
import { AnimatePresence } from 'motion/react'
import { PushPin, SidebarSimple } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { ease } from '../lib/motion'
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
  onTogglePin: (note: Note) => void
  onToggleArchive: (note: Note) => void
  onDelete: (note: Note) => void
  filter?: ReactNode
  children?: ReactNode
  listKey?: string
  inert?: boolean
  sidebarOpen: boolean
  listOpen: boolean
  onHide: () => void
  onShowSidebar: () => void
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
  onTogglePin,
  onToggleArchive,
  onDelete,
  filter,
  children,
  listKey,
  inert,
  sidebarOpen,
  listOpen,
  onHide,
  onShowSidebar,
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
      onTogglePin={onTogglePin}
      onToggleArchive={onToggleArchive}
      onDelete={onDelete}
    />
  )

  return (
    <section className="list-pane" aria-label={title} inert={inert}>
      <div className="list-pane-content">
        <header className="list-header">
          <AnimatePresence initial={false}>
            {listOpen && !sidebarOpen && (
              <motion.button
                key="show-sidebar"
                className="icon-button panel-control"
                aria-label="Show sidebar"
                title="Show sidebar ([)"
                onClick={onShowSidebar}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.16, ease }}
              >
                <SidebarSimple size={16} weight="bold" />
              </motion.button>
            )}
          </AnimatePresence>
          <h1 className="list-title">{title}</h1>
          <span className="list-count">{notes.length}</span>
          <AnimatePresence initial={false}>
            {listOpen && (
              <motion.button
                key="hide-list"
                className="icon-button panel-control list-hide-control"
                aria-label="Hide note list"
                title="Hide note list (])"
                onClick={onHide}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.16, ease }}
              >
                <SidebarSimple size={16} weight="bold" />
              </motion.button>
            )}
          </AnimatePresence>
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
