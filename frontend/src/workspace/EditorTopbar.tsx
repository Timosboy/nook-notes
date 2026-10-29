import type { ReactNode } from 'react'
import { Archive, ArrowLeft, ArrowUUpLeft, CaretRight, PushPin, Trash } from '@phosphor-icons/react'
import type { Note } from '../notes/types'

type Props = {
  leading?: ReactNode
  note: Note
  title: string
  section: string
  onBack: () => void
  onTogglePin: () => void
  onToggleArchive: () => void
  onDelete: () => void
}

export function EditorTopbar({
  leading,
  note,
  title,
  section,
  onBack,
  onTogglePin,
  onToggleArchive,
  onDelete,
}: Props) {
  const archiveLabel = note.archived ? 'Restore note' : 'Archive note'

  return (
    <header className="editor-topbar">
      {leading}
      <button className="icon-button back-button" aria-label="Back to notes" onClick={onBack}>
        <ArrowLeft size={16} weight="bold" />
      </button>

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <span className="breadcrumb-section">{section}</span>
        <CaretRight size={11} weight="bold" aria-hidden="true" />
        <span className="breadcrumb-current">
          {note.emoji && <span className="breadcrumb-emoji" aria-hidden="true">{note.emoji}</span>}
          {title.trim() || 'Untitled'}
        </span>
      </nav>

      <div className="topbar-tools">
        {!note.archived && (
          <button
            className="icon-button"
            aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
            title={note.pinned ? 'Unpin note' : 'Pin note'}
            onClick={onTogglePin}
          >
            <PushPin size={16} weight={note.pinned ? 'fill' : 'bold'} />
          </button>
        )}
        <button
          className="icon-button"
          aria-label={archiveLabel}
          title={archiveLabel}
          onClick={onToggleArchive}
        >
          {note.archived ? <ArrowUUpLeft size={16} weight="bold" /> : <Archive size={16} weight="bold" />}
        </button>
        <button
          className="icon-button icon-button-danger"
          aria-label="Delete note"
          title="Delete note"
          onClick={onDelete}
        >
          <Trash size={16} weight="bold" />
        </button>
      </div>
    </header>
  )
}
