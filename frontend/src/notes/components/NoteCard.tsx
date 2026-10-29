import { useState } from 'react'
import { PencilSimple, Trash } from '@phosphor-icons/react'
import { formatDate } from '../../lib/format'
import type { Note, NoteInput } from '../types'
import { NoteForm } from './NoteForm'

type Props = {
  note: Note
  onUpdate: (input: NoteInput) => Promise<void>
  onDelete: () => Promise<void>
}

type Mode = 'view' | 'edit' | 'confirm-delete'

export function NoteCard({ note, onUpdate, onDelete }: Props) {
  const [mode, setMode] = useState<Mode>('view')

  async function update(input: NoteInput) {
    await onUpdate(input)
    setMode('view')
  }

  if (mode === 'edit') {
    return (
      <NoteForm
        initial={note}
        submitLabel="Save"
        onSubmit={update}
        onCancel={() => setMode('view')}
      />
    )
  }

  return (
    <article className="note-card">
      <h2 className="note-title">{note.title}</h2>
      {note.content && <p className="note-content">{note.content}</p>}
      <footer className="note-footer">
        {mode === 'confirm-delete' ? (
          <div className="note-confirm">
            <span>Delete this note?</span>
            <button className="button button-ghost" onClick={() => setMode('view')}>
              Keep
            </button>
            <button className="button button-danger" onClick={() => void onDelete()}>
              Delete
            </button>
          </div>
        ) : (
          <>
            <time className="note-date" dateTime={note.updatedAt}>
              {formatDate(note.updatedAt)}
            </time>
            <div className="note-actions">
              <button
                className="icon-button"
                aria-label="Edit note"
                onClick={() => setMode('edit')}
              >
                <PencilSimple size={16} weight="bold" />
              </button>
              <button
                className="icon-button icon-button-danger"
                aria-label="Delete note"
                onClick={() => setMode('confirm-delete')}
              >
                <Trash size={16} weight="bold" />
              </button>
            </div>
          </>
        )}
      </footer>
    </article>
  )
}
