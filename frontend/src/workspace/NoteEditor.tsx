import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ImageSquare, NotePencil } from '@phosphor-icons/react'
import type { Editor } from '@tiptap/react'
import type { Category } from '../categories/types'
import { toneStyle } from '../categories/tone'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useAutosave } from '../lib/useAutosave'
import { countWords, readingMinutes } from '../lib/stats'
import { markdownToPlain } from '../lib/plainText'
import { IMAGE_TYPES } from '../lib/imageRules'
import { storedImagePath } from '../lib/imageUrl'
import type { Note, NoteImage, NoteInput } from '../notes/types'
import { EditorTopbar } from './EditorTopbar'
import { NoteProperties } from './NoteProperties'
import { FormatBar } from './FormatBar'
import { OutlineRail } from './OutlineRail'
import { EmojiPicker } from '../emoji/EmojiPicker'
import { ImageLightbox } from './ImageLightbox'
import type { EditorImage } from './RichEditor'
import './images.css'

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
  onAddImages: (files: File[]) => Promise<NoteImage[]>
  onCleanupImages: (imageIds: string[]) => void
  onChangeEmoji: (emoji: string | null) => void
}

function initialContent(note: Note) {
  const referenced = new Set(Array.from(note.content.matchAll(/!\[[^\]]*\]\(\/api\/notes\/[^/]+\/images\/([^\s)]+)\)/g), (match) => match[1]))
  const legacy = note.images
    .filter((image) => !referenced.has(image.id))
    .map((image) => `![${image.filename.replace(/\.[^.]+$/, '')}](${storedImagePath(note.id, image.id)})`)
  return legacy.length ? `${note.content}${note.content ? '\n\n' : ''}${legacy.join('\n\n')}` : note.content
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
  onCleanupImages,
  onChangeEmoji,
}: Props) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(() => initialContent(note))
  const [debouncedContent, setDebouncedContent] = useState(() => initialContent(note))
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [draggingFiles, setDraggingFiles] = useState(false)
  const [bodyFocused, setBodyFocused] = useState(false)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<EditorImage[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [edited, setEdited] = useState(false)
  const editor = useRef<Editor | null>(null)
  const [editorState, setEditorState] = useState<Editor | null>(null)
  const saveRef = useRef(onSave)
  const cleanupRef = useRef(onCleanupImages)
  const savedRef = useRef({ title: note.title, content: note.content })
  const titleRef = useRef(title)
  const contentRef = useRef(content)
  const imagePicker = useRef<HTMLInputElement>(null)
  const insertPosition = useRef<number | null>(null)
  const imagesRef = useRef(note.images)
  const hasTitle = title.trim().length > 0
  const accent = note.categories[0]?.color

  useEffect(() => {
    imagesRef.current = note.images
    cleanupRef.current = onCleanupImages
  }, [note.images, onCleanupImages])

  useEffect(() => {
    saveRef.current = onSave
  }, [onSave])

  const saveSnapshot = useCallback(async (input: NoteInput) => {
    await saveRef.current(input)
    savedRef.current = input
  }, [])

  const status = useAutosave({ title: title.trim(), content }, saveSnapshot, { enabled: hasTitle && edited })
  const words = useMemo(() => countWords(markdownToPlain(debouncedContent)), [debouncedContent])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedContent(content), 600)
    return () => window.clearTimeout(timer)
  }, [content])

  const changeContent = useCallback((markdown: string) => {
    setEdited(true)
    contentRef.current = markdown
    setContent(markdown)
  }, [])
  const toggleNoteCategory = useCallback((category: Category) => onToggleCategory(category), [onToggleCategory])
  const createNoteCategory = useCallback((name: string) => onCreateCategory(name), [onCreateCategory])

  const addNoteImages = useCallback(async (files: File[], position: number) => {
    const uploaded = await onAddImages(files)
    if (!uploaded.length) return
    if (!editor.current) {
      onCleanupImages(uploaded.map((image) => image.id))
      return
    }
    const target = Math.min(position, editor.current.state.doc.content.size)
    editor.current.chain().focus().insertContentAt(target, uploaded.map((image) => ({
      type: 'image',
      attrs: { src: storedImagePath(note.id, image.id), alt: image.filename.replace(/\.[^.]+$/, '') },
    }))).run()
  }, [note.id, onAddImages, onCleanupImages])

  function imageFiles(files: FileList | File[] | null) {
    return Array.from(files ?? []).filter((file) => IMAGE_TYPES.includes(file.type))
  }

  function handleDrop() {
    setDraggingFiles(false)
  }

  function openImagePicker() {
    insertPosition.current = editor.current?.state.selection.from ?? null
    imagePicker.current?.click()
  }

  function handleImagePick(files: FileList | null) {
    const picked = imageFiles(files)
    if (picked.length) void addNoteImages(picked, insertPosition.current ?? editor.current?.state.selection.from ?? 0)
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

  useEffect(() => () => {
    const used = new Set(Array.from(contentRef.current.matchAll(/!\[[^\]]*\]\(\/api\/notes\/[^/]+\/images\/([^\s)]+)\)/g), (match) => match[1]))
    const unused = imagesRef.current.filter((image) => !used.has(image.id)).map((image) => image.id)
    if (unused.length) cleanupRef.current(unused)
  }, [])

  return (
    <>
      <EditorTopbar
        leading={leading}
        note={note}
        title={title}
        section={section}
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
        <button className="document-image-insert" type="button" aria-label="Insert image" onClick={openImagePicker}>
          <ImageSquare size={18} weight="regular" />
        </button>
        <div className="document-icon-wrap">
          <button
            className={`document-icon tone-tile${note.emoji ? ' has-emoji' : ''}`}
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
            setEdited(true)
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
          status={hasTitle ? status : 'invalid'}
        />

        <Suspense fallback={<div className="rich-editor" />}>
          <RichEditor
            initialContent={content}
            onChange={changeContent}
            onPickImage={openImagePicker}
            onPasteImages={(files, position) => void addNoteImages(imageFiles(files), position)}
            onDropImages={(files, position) => void addNoteImages(imageFiles(files), position)}
            onImageClick={(images, index) => {
              setLightboxImages(images)
              setActiveIndex(index)
            }}
            onReady={setEditor}
            onFocus={focusEditor}
            onBlur={blurEditor}
          />
        </Suspense>
        {words > 0 && <p className="document-word-count">{words} {words === 1 ? 'word' : 'words'} · {readingMinutes(words)} min read</p>}
      </article>

      <OutlineRail editor={editorState} />

      {bodyFocused && <FormatBar editor={editorState} onImage={openImagePicker} />}

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

      <ImageLightbox images={lightboxImages} activeIndex={activeIndex} onChange={setActiveIndex} />

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
