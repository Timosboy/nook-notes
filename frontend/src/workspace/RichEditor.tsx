import { useCallback, useEffect, useRef } from 'react'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import Image from '@tiptap/extension-image'
import { Markdown } from '@tiptap/markdown'
import { Placeholder } from '@tiptap/extensions'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { resolveImageUrl } from '../lib/imageUrl'
import { SLASH_PICK_IMAGE_EVENT, SlashCommand } from './slashCommand'
import './richeditor.css'

export type EditorImage = { src: string; alt: string }

type Props = {
  initialContent: string
  onChange: (markdown: string) => void
  onPasteImages: (files: File[], position: number) => void
  onDropImages: (files: File[], position: number) => void
  onImageClick: (images: EditorImage[], index: number) => void
  onPickImage: () => void
  onReady: (editor: Editor | null) => void
  onFocus: () => void
  onBlur: () => void
}

export function RichEditor({ initialContent, onChange, onPasteImages, onDropImages, onImageClick, onPickImage, onReady, onFocus, onBlur }: Props) {
  const changeRef = useRef(onChange)
  const pasteRef = useRef(onPasteImages)
  const dropRef = useRef(onDropImages)
  const imageClickRef = useRef(onImageClick)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef(initialContent)
  const editor = useEditor({
    content: initialContent,
    contentType: 'markdown',
    extensions: [
      StarterKit.configure({ link: { openOnClick: false }, underline: false }),
      Image.configure({ inline: false, HTMLAttributes: { loading: 'lazy', draggable: 'true' } }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            src: {
              default: null,
              renderHTML: (attributes) => ({
                src: resolveImageUrl(attributes.src),
                'data-src': attributes.src,
              }),
            },
          }
        },
      }),
      Markdown.configure({ markedOptions: { breaks: true } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        includeChildren: true,
        placeholder: ({ editor: current }) => current.isEmpty ? 'Start writing...' : "Type '/' for commands",
      }),
      SlashCommand,
    ],
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: 'document-body',
        'aria-label': 'Content',
        role: 'textbox',
        'aria-multiline': 'true',
        spellcheck: 'true',
      },
      handlePaste: (_view, event) => {
        const clipboard = event.clipboardData
        const pastedFiles = Array.from(clipboard?.files ?? [])
        const files = pastedFiles.length
          ? pastedFiles.filter((file) => file.type.startsWith('image/'))
          : Array.from(clipboard?.items ?? [])
            .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
            .map((item) => item.getAsFile())
            .filter((file): file is File => file !== null)
        if (!files.length) return false
        pasteRef.current(files, _view.state.selection.from)
        return true
      },
      handleDrop: (view, event) => {
        const transfer = event.dataTransfer
        const files = Array.from(transfer?.files ?? []).filter((file) => file.type.startsWith('image/'))
        if (!files.length) return false
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? view.state.selection.from
        dropRef.current(files, position)
        return true
      },
      handleClickOn: (view, _position, node) => {
        if (node.type.name !== 'image') return false
        const images: EditorImage[] = []
        let index = -1
        view.state.doc.descendants((current) => {
          if (current.type.name === 'image') {
            if (current === node) index = images.length
            images.push({ src: current.attrs.src, alt: current.attrs.alt ?? '' })
          }
        })
        if (index >= 0) imageClickRef.current(images, index)
        return false
      },
    },
    onUpdate: ({ editor: current }) => {
      latest.current = current.getMarkdown()
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        timer.current = null
        changeRef.current(latest.current)
      }, 120)
    },
    onFocus,
    onBlur: () => {
      flush()
      onBlur()
    },
  })

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    if (editor) latest.current = editor.getMarkdown()
    changeRef.current(latest.current)
  }, [editor])

  useEffect(() => {
    changeRef.current = onChange
    pasteRef.current = onPasteImages
    dropRef.current = onDropImages
    imageClickRef.current = onImageClick
  }, [onChange, onPasteImages, onDropImages, onImageClick])

  useEffect(() => {
    document.addEventListener(SLASH_PICK_IMAGE_EVENT, onPickImage)
    return () => document.removeEventListener(SLASH_PICK_IMAGE_EVENT, onPickImage)
  }, [onPickImage])

  useEffect(() => {
    onReady(editor)
    return () => {
      flush()
      onReady(null)
    }
  }, [editor, flush, onReady])

  return (
    <div className="rich-editor" onClick={(event) => {
      const view = editor?.view
      if (!view) return
      const lastBlock = view.dom.lastElementChild
      const belowContent = event.target === view.dom
        && event.clientY > (lastBlock?.getBoundingClientRect().bottom ?? view.dom.getBoundingClientRect().top)
      if (event.target === event.currentTarget || belowContent) editor.chain().focus('end').run()
    }}>
      <EditorContent editor={editor} />
    </div>
  )
}
