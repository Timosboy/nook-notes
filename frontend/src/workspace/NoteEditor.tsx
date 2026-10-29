import { useState } from 'react'
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
}

export function NoteEditor({ note, fresh, onSave }: Props) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)

  const hasTitle = title.trim().length > 0
  const status = useAutosave({ title: title.trim(), content }, onSave, { enabled: hasTitle })

  return (
    <article className="document">
      <div className="document-bar">
        <time className="document-date" dateTime={note.updatedAt}>
          {formatDate(note.updatedAt)}
        </time>
        <span className={`save-status is-${hasTitle ? status : 'error'}`} aria-live="polite">
          {hasTitle ? STATUS_LABEL[status] : 'Title required'}
        </span>
      </div>

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
