import type { PointerEvent, MouseEvent } from 'react'
import { useEditorState, type Editor } from '@tiptap/react'
import {
  ImageSquare,
  ListBullets,
  ListChecks,
  ListNumbers,
  TextB,
  TextItalic,
} from '@phosphor-icons/react'
import { useKeyboardInset } from '../lib/useKeyboardInset'
import './formatbar.css'

type Props = {
  editor: Editor | null
  onImage: () => void
}

export function FormatBar({ editor, onImage }: Props) {
  const inset = useKeyboardInset()
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      italic: current?.isActive('italic') ?? false,
      bullet: current?.isActive('bulletList') ?? false,
      number: current?.isActive('orderedList') ?? false,
      task: current?.isActive('taskList') ?? false,
    }),
  })

  function keepSelection(event: PointerEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
  }

  function action(command: () => void, pressed?: boolean) {
    return {
      className: `format-bar-button${pressed ? ' is-active' : ''}`,
      type: 'button' as const,
      'aria-pressed': pressed ?? false,
      onPointerDown: keepSelection,
      onMouseDown: keepSelection,
      onClick: command,
    }
  }

  return (
    <div className="format-bar" role="toolbar" aria-label="Formatting" style={{ bottom: inset }}>
      <button
        className="format-bar-button format-bar-image"
        type="button"
        aria-label="Add image"
        onPointerDown={keepSelection}
        onMouseDown={keepSelection}
        onClick={onImage}
      >
        <ImageSquare size={22} weight="bold" />
      </button>
      <button {...action(() => editor?.chain().focus().toggleBold().run(), active?.bold)} aria-label="Bold">
        <TextB size={22} weight="bold" />
      </button>
      <button {...action(() => editor?.chain().focus().toggleItalic().run(), active?.italic)} aria-label="Italic">
        <TextItalic size={22} weight="bold" />
      </button>
      <button {...action(() => editor?.chain().focus().toggleBulletList().run(), active?.bullet)} aria-label="Bullet list">
        <ListBullets size={22} weight="bold" />
      </button>
      <button {...action(() => editor?.chain().focus().toggleOrderedList().run(), active?.number)} aria-label="Numbered list">
        <ListNumbers size={22} weight="bold" />
      </button>
      <button {...action(() => editor?.chain().focus().toggleTaskList().run(), active?.task)} aria-label="Checklist">
        <ListChecks size={22} weight="bold" />
      </button>
    </div>
  )
}
