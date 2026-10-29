import { useState } from 'react'
import { NotePencil, Plus, X } from '@phosphor-icons/react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CategoryForm } from './CategoryForm'
import { CategoryDot } from './CategoryChip'
import type { CategoryPatch } from './api'
import { toneStyle } from './tone'
import type { Category } from './types'

type Props = {
  categories: Category[]
  counts: Record<string, number>
  activeId: string | null
  onSelect: (id: string | null) => void
  onDelete: (category: Category) => Promise<void>
  onCreate: (name: string, color: string) => Promise<void>
  onUpdate: (category: Category, patch: CategoryPatch) => Promise<void>
}

export function CategoryNav({ categories, counts, activeId, onSelect, onDelete, onCreate, onUpdate }: Props) {
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const used = categories.map(({ color }) => color)

  async function confirmDelete() {
    if (!deleting) return

    await onDelete(deleting)
    setDeleting(null)
  }

  return (
    <section className="category-nav" aria-label="Categories">
      <div className="category-heading">
        <h2 className="sidebar-heading">Categories</h2>
        <button className="category-add" aria-label="New category" title="New category" onClick={() => {
          setEditing(null)
          setCreating((open) => !open)
        }}>
          <Plus size={14} weight="bold" />
        </button>
      </div>

      {creating && (
        <CategoryForm used={used} onSave={onCreate} onCancel={() => setCreating(false)} />
      )}

      <ul className="category-items">
        {categories.map((category) => {
          const active = category.id === activeId

          return (
            <li key={category.id} className="category-item">
              {editing?.id === category.id ? (
                <CategoryForm
                  used={used.filter((_, index) => index !== categories.indexOf(category))}
                  category={category}
                  onSave={(name, color) => onUpdate(category, { name, color })}
                  onCancel={() => setEditing(null)}
                  onDelete={() => {
                    setEditing(null)
                    setDeleting(category)
                  }}
                />
              ) : <><button
                className={`nav-item${active ? ' is-active' : ''}`}
                aria-pressed={active}
                onClick={() => onSelect(active ? null : category.id)}
              >
                <CategoryDot category={category} />
                <span className="nav-label">{category.name}</span>
                <span className="nav-count">{counts[category.id] ?? 0}</span>
              </button>
              <button
                className="category-edit"
                aria-label={`Edit ${category.name}`}
                title="Edit category"
                onClick={() => {
                  setCreating(false)
                  setEditing(category)
                }}
              >
                <NotePencil size={12} weight="bold" />
              </button>
              <button
                className="category-delete"
                aria-label={`Delete ${category.name}`}
                title="Delete category"
                onClick={() => setDeleting(category)}
              >
                <X size={12} weight="bold" />
              </button>
              </>}
            </li>
          )
        })}
        <li className="category-add-mobile">
          <button className="chip category-add-chip" style={toneStyle()} onClick={() => {
            setEditing(null)
            setCreating((open) => !open)
          }}>
            <Plus size={12} weight="bold" />
            Add category
          </button>
        </li>
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
