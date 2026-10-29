import { useState, type FormEvent, type KeyboardEvent } from 'react'
import type { NoteInput } from '../types'

const TITLE_MAX_LENGTH = 120
const EMPTY_NOTE: NoteInput = { title: '', content: '' }

type Props = {
  initial?: NoteInput
  submitLabel: string
  onSubmit: (input: NoteInput) => Promise<void>
  onCancel: () => void
}

export function NoteForm({ initial = EMPTY_NOTE, submitLabel, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial.title)
  const [content, setContent] = useState(initial.content)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = title.trim().length > 0 && !saving

  async function save() {
    if (!canSave) return

    setSaving(true)
    setError(null)

    try {
      await onSubmit({ title: title.trim(), content })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void save()
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') onCancel()
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) void save()
  }

  return (
    <form className="note-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <input
        className="note-form-title"
        placeholder="Title"
        aria-label="Title"
        maxLength={TITLE_MAX_LENGTH}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        autoFocus
      />
      <textarea
        className="note-form-content"
        placeholder="Write something..."
        aria-label="Content"
        rows={5}
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="note-form-actions">
        <span className="hint">
          <kbd>Ctrl</kbd> <kbd>Enter</kbd> to save
        </span>
        <button type="button" className="button button-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button-primary" disabled={!canSave}>
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
