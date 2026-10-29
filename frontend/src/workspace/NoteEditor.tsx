import { lazy, Suspense, useCallback, useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from 'react'
import { NotePencil } from '@phosphor-icons/react'
import type { Editor } from '@tiptap/react'
import type { Category } from '../categories/types'
import { toneStyle } from '../categories/tone'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useAutosave } from '../lib/useAutosave'
import type { Note, NoteImage, NoteInput } from '../notes/types'
import { EditorTopbar } from './EditorTopbar'
import { NoteProperties } from './NoteProperties'
import { NoteImages } from './NoteImages'
import { IMAGE_TYPES } from '../lib/imageRules'
import { FormatBar } from './FormatBar'
import { EmojiPicker } from '../emoji/EmojiPicker'

const RichEditor = lazy(() => import('./RichEditor').then(({ RichEditor: Component }) => ({ default: Component })))

const TITLE_MAX_LENGTH = 120

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
  const editor = useRef<Editor | null>(null)
  const [editorState, setEditorState] = useState<Editor | null>(null)
  const saveRef = useRef(onSave)
  const savedRef = useRef({ title: note.title, content: note.content })
  const titleRef = useRef(title)
  const contentRef = useRef(content)
  const imagePicker = useRef<HTMLInputElement>(null)

  const hasTitle = title.trim().length > 0
  const accent = note.categories[0]?.color

  useEffect(() => {
    saveRef.current = onSave
  }, [onSave])

  const saveSnapshot = useCallback(async (input: NoteInput) => {
    await saveRef.current(input)
    savedRef.current = input
  }, [])

  const status = useAutosave({ title: title.trim(), content }, saveSnapshot, { enabled: hasTitle })

  const changeContent = useCallback((markdown: string) => {
    contentRef.current = markdown
    setContent(markdown)
  }, [])
  const toggleNoteCategory = useCallback((category: Category) => onToggleCategory(category), [onToggleCategory])
  const createNoteCategory = useCallback((name: string) => onCreateCategory(name), [onCreateCategory])
  const addNoteImages = useCallback((files: File[]) => onAddImages(files), [onAddImages])
  const removeNoteImage = useCallback((image: NoteImage) => onRemoveImage(image), [onRemoveImage])

  function imageFiles(files: FileList | null) {
    return Array.from(files ?? []).filter((file) => IMAGE_TYPES.includes(file.type))
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    setDraggingFiles(false)
    const files = imageFiles(event.dataTransfer.files)
    if (files.length) void onAddImages(files)
  }

  function handleImagePick(files: FileList | null) {
    const picked = Array.from(files ?? [])
    if (picked.length) void onAddImages(picked)
  }

  const setEditor = useCallback((current: Editor | null) => {
    editor.current = current
    setEditorState(current)
  }, [])
  const focusEditor = useCallback(() => setBodyFocused(true), [])
  const blurEditor = useCallback(() => setBodyFocused(false), [])

  useEffect(() => () => {
    const nextTitle = titleRef.current.trim()
    const nextContent = contentRef.current
    if (nextTitle && (nextTitle !== savedRef.current.title || nextContent !== savedRef.current.content)) {
      void saveSnapshot({ title: nextTitle, content: nextContent }).catch(() => undefined)
    }
  }, [saveSnapshot])

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
          onChange={(event) => {
            const value = event.target.value.replace(/\n/g, '')
            titleRef.current = value
            setTitle(value)
          }}
          onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              editor.current?.chain().focus('start').run()
            }
          }}
          onFocus={(event) => fresh && event.target.select()}
          autoFocus={fresh}
        />

        <NoteProperties
          note={note}
          categories={categories}
          onToggleCategory={toggleNoteCategory}
          onCreateCategory={createNoteCategory}
        />

        <NoteImages note={note} onAddImages={addNoteImages} onRemoveImage={removeNoteImage} />

        <Suspense fallback={<div className="rich-editor" />}>
          <RichEditor
            initialContent={note.content}
            onChange={changeContent}
            onPasteImages={(files) => void onAddImages(files)}
            onReady={setEditor}
            onFocus={focusEditor}
            onBlur={blurEditor}
          />
        </Suspense>
      </article>

      {bodyFocused && (
        <FormatBar
          editor={editorState}
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
