import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CategoryDot } from './CategoryChip'
import type { Category } from './types'

type Props = {
  categories: Category[]
  counts: Record<string, number>
  activeId: string | null
  onSelect: (id: string | null) => void
  onDelete: (category: Category) => Promise<void>
}

export function CategoryNav({ categories, counts, activeId, onSelect, onDelete }: Props) {
  const [deleting, setDeleting] = useState<Category | null>(null)

  if (categories.length === 0) return null

  async function confirmDelete() {
    if (!deleting) return

    await onDelete(deleting)
    setDeleting(null)
  }

  return (
    <section className="category-nav" aria-label="Categories">
      <h2 className="sidebar-heading">Categories</h2>

      <ul className="category-items">
        {categories.map((category) => {
          const active = category.id === activeId

          return (
            <li key={category.id} className="category-item">
              <button
                className={`nav-item${active ? ' is-active' : ''}`}
                aria-pressed={active}
                onClick={() => onSelect(active ? null : category.id)}
              >
                <CategoryDot category={category} />
                <span className="nav-label">{category.name}</span>
                <span className="nav-count">{counts[category.id] ?? 0}</span>
              </button>
              <button
                className="category-delete"
                aria-label={`Delete ${category.name}`}
                title="Delete category"
                onClick={() => setDeleting(category)}
              >
                <X size={12} weight="bold" />
              </button>
            </li>
          )
        })}
      </ul>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this category?"
        description={`"${deleting?.name}" will be removed from every note. The notes stay as they are.`}
        confirmLabel="Delete category"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </section>
  )
}
