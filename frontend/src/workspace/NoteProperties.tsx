import { CalendarBlank, ClockCounterClockwise, Tag, X, type Icon } from '@phosphor-icons/react'
import { memo, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CategoryChip } from '../categories/CategoryChip'
import { CategoryPicker } from '../categories/CategoryPicker'
import type { Category } from '../categories/types'
import { formatDate } from '../lib/format'
import { ease } from '../lib/motion'
import type { Note } from '../notes/types'

type Props = {
  note: Note
  categories: Category[]
  onToggleCategory: (category: Category) => void
  onCreateCategory: (name: string) => Promise<void>
}

export const NoteProperties = memo(function NoteProperties({ note, categories, onToggleCategory, onCreateCategory }: Props) {
  return (
    <dl className="properties">
      <Property icon={Tag} label="Categories">
        <AnimatePresence initial={false} mode="popLayout">
          {note.categories.map((category) => (
            <motion.span
              key={category.id}
              layout
              className="chip-motion"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.16, ease }}
            >
              <CategoryChip category={category}>
                <button
                  className="chip-remove"
                  aria-label={`Remove ${category.name}`}
                  onClick={() => onToggleCategory(category)}
                >
                  <X size={10} weight="bold" />
                </button>
              </CategoryChip>
            </motion.span>
          ))}
        </AnimatePresence>
        <motion.span layout className="chip-motion">
          <CategoryPicker
            categories={categories}
            selectedIds={note.categories.map(({ id }) => id)}
            onToggle={onToggleCategory}
            onCreate={onCreateCategory}
          />
        </motion.span>
      </Property>

      <Property icon={CalendarBlank} label="Created">
        <time className="property-value" dateTime={note.createdAt}>
          {formatDate(note.createdAt)}
        </time>
        {note.archived && <span className="badge">Archived</span>}
      </Property>

      <Property icon={ClockCounterClockwise} label="Last edited">
        <time className="property-value" dateTime={note.updatedAt}>
          {formatDate(note.updatedAt)}
        </time>
      </Property>
    </dl>
  )
})

type PropertyProps = {
  icon: Icon
  label: string
  children: ReactNode
}

function Property({ icon: PropertyIcon, label, children }: PropertyProps) {
  return (
    <div className="property">
      <dt>
        <PropertyIcon size={14} weight="bold" aria-hidden="true" />
        {label}
      </dt>
      <dd className="chips">{children}</dd>
    </div>
  )
}
