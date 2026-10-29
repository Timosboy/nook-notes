import { Archive, ArrowLeft, ArrowUUpLeft, CaretRight, Trash } from '@phosphor-icons/react'
import { timeAgo } from '../lib/format'
import type { SaveStatus } from '../lib/useAutosave'
import type { Note } from '../notes/types'

const STATUS_LABEL: Record<SaveStatus, string> = {
  saved: 'Saved',
  saving: 'Saving...',
  error: 'Not saved',
}

type Props = {
  note: Note
  title: string
  section: string
  status: SaveStatus | 'invalid'
  onBack: () => void
  onToggleArchive: () => void
  onDelete: () => void
}

export function EditorTopbar({
  note,
  title,
  section,
  status,
  onBack,
  onToggleArchive,
  onDelete,
}: Props) {
  const archiveLabel = note.archived ? 'Restore note' : 'Archive note'

  return (
    <header className="editor-topbar">
      <button className="icon-button back-button" aria-label="Back to notes" onClick={onBack}>
        <ArrowLeft size={16} weight="bold" />
      </button>

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <span className="breadcrumb-section">{section}</span>
        <CaretRight size={11} weight="bold" aria-hidden="true" />
        <span className="breadcrumb-current">{title.trim() || 'Untitled'}</span>
      </nav>

      <div className="topbar-tools">
        <span className={`save-status is-${status}`} aria-live="polite">
          <span className="save-dot" aria-hidden="true" />
          {status === 'invalid' ? 'Title required' : STATUS_LABEL[status]}
        </span>
        <time className="topbar-edited" dateTime={note.updatedAt}>
          Edited {timeAgo(note.updatedAt).toLowerCase()}
        </time>
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
