import { useState } from 'react'
import { ArrowLeft, Trash } from '@phosphor-icons/react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { formatDate } from '../lib/format'
import { useAutosave, type SaveStatus } from '../lib/useAutosave'
import type { Note, NoteInput } from '../notes/types'

const TITLE_MAX_LENGTH = 120

const STATUS_LABEL: Record<SaveStatus, string> = {
  saved: 'Saved',
  saving: 'Saving...',
  error: 'Not saved',
}

type Props = {
  note: Note
  fresh: boolean
  onSave: (input: NoteInput) => Promise<void>
  onDelete: () => Promise<void>
  onBack: () => void
}

export function NoteEditor({ note, fresh, onSave, onDelete, onBack }: Props) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const hasTitle = title.trim().length > 0
  const status = useAutosave({ title: title.trim(), content }, onSave, { enabled: hasTitle })

  return (
    <article className="document">
      <div className="document-bar">
        <button className="icon-button back-button" aria-label="Back to notes" onClick={onBack}>
          <ArrowLeft size={16} weight="bold" />
        </button>
        <time className="document-date" dateTime={note.updatedAt}>
          {formatDate(note.updatedAt)}
        </time>
        <div className="document-tools">
          <span className={`save-status is-${hasTitle ? status : 'error'}`} aria-live="polite">
            {hasTitle ? STATUS_LABEL[status] : 'Title required'}
          </span>
          <button
            className="icon-button icon-button-danger"
            aria-label="Delete note"
            title="Delete note"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash size={16} weight="bold" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this note?"
        description={`"${note.title}" will be deleted for good. This can't be undone.`}
        confirmLabel="Delete note"
        onConfirm={onDelete}
        onClose={() => setConfirmingDelete(false)}
      />

      <textarea
        className="document-title"
        aria-label="Title"
        placeholder="Untitled"
        rows={1}
        maxLength={TITLE_MAX_LENGTH}
        value={title}
        onChange={(event) => setTitle(event.target.value.replace(/\n/g, ''))}
        onFocus={(event) => fresh && event.target.select()}
        autoFocus={fresh}
      />

      <textarea
        className="document-body"
        aria-label="Content"
        placeholder="Start writing..."
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
    </article>
  )
}
