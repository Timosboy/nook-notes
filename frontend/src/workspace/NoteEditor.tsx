import { useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent, type ReactNode } from 'react'
import { NotePencil } from '@phosphor-icons/react'
import type { Category } from '../categories/types'
import { toneStyle } from '../categories/tone'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { applyEdit, type Edit } from '../lib/applyEdit'
import { wrapSelection } from '../lib/formatting'
import { continueList, shiftIndent, toggleLinePrefix } from '../lib/listEditing'
import { useAutosave } from '../lib/useAutosave'
import type { Note, NoteImage, NoteInput } from '../notes/types'
import { EditorTopbar } from './EditorTopbar'
import { NoteProperties } from './NoteProperties'
import { NoteImages } from './NoteImages'
import { IMAGE_TYPES } from '../lib/imageRules'
import { FormatBar } from './FormatBar'
import { EmojiPicker } from '../emoji/EmojiPicker'

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
  leading?: ReactNode
  note: Note
  section: string
  fresh: boolean
  onSave: (input: NoteInput) => Promise<void>
  onDelete: () => Promise<void>
  onToggleArchive: () => void
  onTogglePin: () => void
  onBack: () => void
  categories: Category[]
  onToggleCategory: (category: Category) => void
  onCreateCategory: (name: string) => Promise<void>
  onAddImages: (files: File[]) => Promise<void>
  onRemoveImage: (image: NoteImage) => Promise<void>
  onChangeEmoji: (emoji: string | null) => void
}

export function NoteEditor({
  leading,
  note,
  section,
  fresh,
  onSave,
  onDelete,
  onToggleArchive,
  onTogglePin,
  onBack,
  categories,
  onToggleCategory,
  onCreateCategory,
  onAddImages,
  onRemoveImage,
  onChangeEmoji,
}: Props) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [draggingFiles, setDraggingFiles] = useState(false)
  const [bodyFocused, setBodyFocused] = useState(false)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const body = useRef<HTMLTextAreaElement>(null)
  const imagePicker = useRef<HTMLInputElement>(null)

  const hasTitle = title.trim().length > 0
  const status = useAutosave({ title: title.trim(), content }, onSave, { enabled: hasTitle })
  const accent = note.categories[0]?.color

  function imageFiles(files: FileList | null) {
    return Array.from(files ?? []).filter((file) => IMAGE_TYPES.includes(file.type))
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    setDraggingFiles(false)
    const files = imageFiles(event.dataTransfer.files)
    if (files.length) void onAddImages(files)
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const files = imageFiles(event.clipboardData.files)
    if (!files.length) return
    event.preventDefault()
    void onAddImages(files)
  }

  function applyBodyFormat(edit: Edit) {
    const textarea = body.current
    if (!textarea) return
    applyEdit(textarea, edit)
    textarea.focus()
  }

  function handleList(kind: 'bullet' | 'number' | 'check') {
    const textarea = body.current
    if (!textarea) return
    const { value, selectionStart, selectionEnd } = textarea
    applyBodyFormat(toggleLinePrefix(value, selectionStart, selectionEnd, kind))
  }

  function handleWrap(marker: string) {
    const textarea = body.current
    if (!textarea) return
    const { value, selectionStart, selectionEnd } = textarea
    applyBodyFormat(wrapSelection(value, selectionStart, selectionEnd, marker))
  }

  function handleImagePick(files: FileList | null) {
    const picked = Array.from(files ?? [])
    if (picked.length) void onAddImages(picked)
  }

  return (
    <>
      <EditorTopbar
        leading={leading}
        note={note}
        title={title}
        content={content}
        section={section}
        status={hasTitle ? status : 'invalid'}
        onBack={onBack}
        onToggleArchive={onToggleArchive}
        onTogglePin={onTogglePin}
        onDelete={() => setConfirmingDelete(true)}
      />

      <article
        className={`document${draggingFiles ? ' is-dragging-files' : ''}${bodyFocused ? ' has-format-bar' : ''}`}
        onDragEnter={(event) => {
          if (event.dataTransfer.types.includes('Files')) setDraggingFiles(true)
        }}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes('Files')) event.preventDefault()
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDraggingFiles(false)
        }}
        onDrop={handleDrop}
      >
        <div className="document-icon-wrap">
          <button
            className="document-icon tone-tile"
            style={toneStyle(accent)}
            aria-label="Change icon"
            aria-haspopup="dialog"
            aria-expanded={emojiPickerOpen}
            onClick={() => setEmojiPickerOpen((open) => !open)}
          >
            {note.emoji ? <span className="document-emoji">{note.emoji}</span> : <NotePencil size={26} weight="duotone" />}
          </button>
          <EmojiPicker
            open={emojiPickerOpen}
            hasEmoji={Boolean(note.emoji)}
            onChoose={onChangeEmoji}
            onClose={() => setEmojiPickerOpen(false)}
          />
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

        <NoteProperties
          note={note}
          categories={categories}
          onToggleCategory={onToggleCategory}
          onCreateCategory={onCreateCategory}
        />

        <NoteImages note={note} onAddImages={onAddImages} onRemoveImage={onRemoveImage} />

        <textarea
          ref={body}
          className="document-body"
          aria-label="Content"
          placeholder="Start writing..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleBodyKeyDown}
          onPaste={handlePaste}
          onFocus={() => setBodyFocused(true)}
          onBlur={() => setBodyFocused(false)}
        />
      </article>

      {bodyFocused && (
        <FormatBar
          onBold={() => handleWrap('**')}
          onItalic={() => handleWrap('_')}
          onList={handleList}
          onImage={() => imagePicker.current?.click()}
        />
      )}

      <input
        ref={imagePicker}
        hidden
        type="file"
        accept={IMAGE_TYPES.join(',')}
        multiple
        onChange={(event) => {
          handleImagePick(event.currentTarget.files)
          event.currentTarget.value = ''
        }}
      />

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
