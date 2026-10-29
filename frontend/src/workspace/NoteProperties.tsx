import { CalendarBlank, Tag, X, type Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { CategoryChip } from '../categories/CategoryChip'
import { CategoryPicker } from '../categories/CategoryPicker'
import type { Category } from '../categories/types'
import { formatDate } from '../lib/format'
import type { Note } from '../notes/types'

type Props = {
  note: Note
  categories: Category[]
  onToggleCategory: (category: Category) => void
  onCreateCategory: (name: string) => Promise<void>
}

export function NoteProperties({ note, categories, onToggleCategory, onCreateCategory }: Props) {
  return (
    <dl className="properties">
      <Property icon={Tag} label="Categories">
        {note.categories.map((category) => (
          <CategoryChip key={category.id} category={category}>
            <button
              className="chip-remove"
              aria-label={`Remove ${category.name}`}
              onClick={() => onToggleCategory(category)}
            >
              <X size={10} weight="bold" />
            </button>
          </CategoryChip>
        ))}
        <CategoryPicker
          categories={categories}
          selectedIds={note.categories.map(({ id }) => id)}
          onToggle={onToggleCategory}
          onCreate={onCreateCategory}
        />
      </Property>

      <Property icon={CalendarBlank} label="Created">
        <time className="property-value" dateTime={note.createdAt}>
          {formatDate(note.createdAt)}
        </time>
        {note.archived && <span className="badge">Archived</span>}
      </Property>
    </dl>
  )
}

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
