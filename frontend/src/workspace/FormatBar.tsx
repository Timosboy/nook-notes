import type { PointerEvent, MouseEvent } from 'react'
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

type ListKind = 'bullet' | 'number' | 'check'

type Props = {
  onBold: () => void
  onItalic: () => void
  onList: (kind: ListKind) => void
  onImage: () => void
}

export function FormatBar({ onBold, onItalic, onList, onImage }: Props) {
  const inset = useKeyboardInset()

  function keepSelection(event: PointerEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
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
      <button
        className="format-bar-button"
        type="button"
        aria-label="Bold"
        onPointerDown={keepSelection}
        onMouseDown={keepSelection}
        onClick={onBold}
      >
        <TextB size={22} weight="bold" />
      </button>
      <button
        className="format-bar-button"
        type="button"
        aria-label="Italic"
        onPointerDown={keepSelection}
        onMouseDown={keepSelection}
        onClick={onItalic}
      >
        <TextItalic size={22} weight="bold" />
      </button>
      <button
        className="format-bar-button"
        type="button"
        aria-label="Bullet list"
        onPointerDown={keepSelection}
        onMouseDown={keepSelection}
        onClick={() => onList('bullet')}
      >
        <ListBullets size={22} weight="bold" />
      </button>
      <button
        className="format-bar-button"
        type="button"
        aria-label="Numbered list"
        onPointerDown={keepSelection}
        onMouseDown={keepSelection}
        onClick={() => onList('number')}
      >
        <ListNumbers size={22} weight="bold" />
      </button>
      <button
        className="format-bar-button"
        type="button"
        aria-label="Checklist"
        onPointerDown={keepSelection}
        onMouseDown={keepSelection}
        onClick={() => onList('check')}
      >
        <ListChecks size={22} weight="bold" />
      </button>
    </div>
  )
}
