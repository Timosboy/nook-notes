import { CategoryChip } from '../categories/CategoryChip'
import { timeAgo } from '../lib/format'
import type { Note } from '../notes/types'

const MAX_CHIPS = 3

type Props = {
  note: Note
  selected: boolean
  onSelect: () => void
}

export function NoteRow({ note, selected, onSelect }: Props) {
  const shown = note.categories.slice(0, MAX_CHIPS)
  const hidden = note.categories.length - shown.length

  return (
    <li>
      <button
        className={`note-row${selected ? ' is-selected' : ''}`}
        aria-current={selected || undefined}
        onClick={onSelect}
      >
        <span className="note-row-title">{note.title}</span>
        <span className="note-row-preview">{note.content || 'No content'}</span>
        <span className="note-row-meta">
          <time className="note-row-time" dateTime={note.updatedAt}>
            {timeAgo(note.updatedAt)}
          </time>
          {shown.length > 0 && (
            <span className="chips">
              {shown.map((category) => (
                <CategoryChip key={category.id} category={category} />
              ))}
              {hidden > 0 && <span className="chip chip-gray">+{hidden}</span>}
            </span>
          )}
        </span>
      </button>
    </li>
  )
}
