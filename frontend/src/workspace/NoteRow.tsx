import { motion } from 'motion/react'
import { CategoryChip } from '../categories/CategoryChip'
import { timeAgo } from '../lib/format'
import { ease, spring } from '../lib/motion'
import type { Note } from '../notes/types'

const MAX_CHIPS = 3
const MAX_STAGGERED = 8

type Props = {
  note: Note
  order: number
  selected: boolean
  onSelect: () => void
}

export function NoteRow({ note, order, selected, onSelect }: Props) {
  const shown = note.categories.slice(0, MAX_CHIPS)
  const hidden = note.categories.length - shown.length

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.24, ease, delay: Math.min(order, MAX_STAGGERED) * 0.03 },
      }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.16, ease } }}
      transition={{ layout: spring }}
    >
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
    </motion.li>
  )
}
