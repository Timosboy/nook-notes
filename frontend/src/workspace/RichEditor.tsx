import { useCallback, useEffect, useRef } from 'react'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Markdown } from '@tiptap/markdown'
import { Placeholder } from '@tiptap/extensions'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './richeditor.css'

type Props = {
  initialContent: string
  onChange: (markdown: string) => void
  onPasteImages: (files: File[]) => void
  onReady: (editor: Editor | null) => void
  onFocus: () => void
  onBlur: () => void
}

export function RichEditor({ initialContent, onChange, onPasteImages, onReady, onFocus, onBlur }: Props) {
  const changeRef = useRef(onChange)
  const pasteRef = useRef(onPasteImages)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef(initialContent)
  const editor = useEditor({
    content: initialContent,
    contentType: 'markdown',
    extensions: [
      StarterKit.configure({ link: { openOnClick: false }, underline: false }),
      Markdown.configure({ markedOptions: { breaks: true } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
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
        pasteRef.current(files)
        return true
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
  }, [onChange, onPasteImages])

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
