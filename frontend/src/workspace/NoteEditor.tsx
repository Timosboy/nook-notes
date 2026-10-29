import { useState, type KeyboardEvent } from 'react'
import { NotePencil } from '@phosphor-icons/react'
import type { Category } from '../categories/types'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { applyEdit, type Edit } from '../lib/applyEdit'
import { wrapSelection } from '../lib/formatting'
import { continueList, shiftIndent } from '../lib/listEditing'
import { useAutosave } from '../lib/useAutosave'
import type { Note, NoteInput } from '../notes/types'
import { EditorTopbar } from './EditorTopbar'
import { NoteProperties } from './NoteProperties'

const TITLE_MAX_LENGTH = 120

const WRAP_MARKERS: Record<string, string> = { b: '**', i: '_' }

function editFor(event: KeyboardEvent<HTMLTextAreaElement>): Edit | null {
  const { value, selectionStart, selectionEnd } = event.currentTarget

  if (event.key === 'Enter' && !event.shiftKey) {
    return continueList(value, selectionStart, selectionEnd)
  }
  if (event.key === 'Tab') {
    return shiftIndent(value, selectionStart, selectionEnd, event.shiftKey)
  }
  return null
}

function handleBodyKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
  const { nativeEvent, metaKey, ctrlKey, altKey, shiftKey, key } = event
  if (nativeEvent.isComposing) return

  if ((metaKey || ctrlKey) && !altKey && !shiftKey) {
    const marker = WRAP_MARKERS[key.toLowerCase()]
    if (!marker) return

    const { value, selectionStart, selectionEnd } = event.currentTarget
    event.preventDefault()
    applyEdit(event.currentTarget, wrapSelection(value, selectionStart, selectionEnd, marker))
    return
  }

  if (metaKey || ctrlKey || altKey) return

  const edit = editFor(event)
  if (!edit) return

  event.preventDefault()
  applyEdit(event.currentTarget, edit)
}

type Props = {
  note: Note
  section: string
  fresh: boolean
  onSave: (input: NoteInput) => Promise<void>
  onDelete: () => Promise<void>
  onToggleArchive: () => void
  onBack: () => void
  categories: Category[]
  onToggleCategory: (category: Category) => void
  onCreateCategory: (name: string) => Promise<void>
}

export function NoteEditor({
  note,
  section,
  fresh,
  onSave,
  onDelete,
  onToggleArchive,
  onBack,
  categories,
  onToggleCategory,
  onCreateCategory,
}: Props) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const hasTitle = title.trim().length > 0
  const status = useAutosave({ title: title.trim(), content }, onSave, { enabled: hasTitle })
  const accent = note.categories[0]?.color ?? 'gray'

  return (
    <>
      <EditorTopbar
        note={note}
        title={title}
        content={content}
        section={section}
        status={hasTitle ? status : 'invalid'}
        onBack={onBack}
        onToggleArchive={onToggleArchive}
        onDelete={() => setConfirmingDelete(true)}
      />

      <article className="document">
        <span className={`document-icon chip-${accent}`} aria-hidden="true">
          <NotePencil size={26} weight="duotone" />
        </span>

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

        <NoteProperties
          note={note}
          categories={categories}
          onToggleCategory={onToggleCategory}
          onCreateCategory={onCreateCategory}
        />

        <textarea
          className="document-body"
          aria-label="Content"
          placeholder="Start writing..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleBodyKeyDown}
        />
      </article>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this note?"
        description={`"${note.title}" will be deleted for good. This can't be undone.`}
        confirmLabel="Delete note"
        onConfirm={onDelete}
        onClose={() => setConfirmingDelete(false)}
      />
    </>
  )
}
