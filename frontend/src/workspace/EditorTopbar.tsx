import { Archive, ArrowLeft, ArrowUUpLeft, CaretRight, PushPin, Trash } from '@phosphor-icons/react'
import { timeAgo } from '../lib/format'
import { countWords, readingMinutes } from '../lib/stats'
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
  content: string
  section: string
  status: SaveStatus | 'invalid'
  onBack: () => void
  onTogglePin: () => void
  onToggleArchive: () => void
  onDelete: () => void
}

export function EditorTopbar({
  note,
  title,
  content,
  section,
  status,
  onBack,
  onTogglePin,
  onToggleArchive,
  onDelete,
}: Props) {
  const archiveLabel = note.archived ? 'Restore note' : 'Archive note'
  const words = countWords(content)

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
        <span className="topbar-stats">
          {words} {words === 1 ? 'word' : 'words'}{words > 0 ? ` · ${readingMinutes(words)} min read` : ''}
        </span>
        <time className="topbar-edited" dateTime={note.updatedAt}>
          Edited {timeAgo(note.updatedAt).toLowerCase()}
        </time>
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
