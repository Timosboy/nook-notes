import { timeAgo } from '../lib/format'
import type { Note } from '../notes/types'

type Props = {
  note: Note
  selected: boolean
  onSelect: () => void
}

export function NoteRow({ note, selected, onSelect }: Props) {
  return (
    <li>
      <button
        className={`note-row${selected ? ' is-selected' : ''}`}
        aria-current={selected || undefined}
        onClick={onSelect}
      >
        <span className="note-row-title">{note.title}</span>
        <span className="note-row-preview">{note.content || 'No content'}</span>
        <time className="note-row-time" dateTime={note.updatedAt}>
          {timeAgo(note.updatedAt)}
        </time>
      </button>
    </li>
  )
}
