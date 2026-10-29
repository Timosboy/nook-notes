import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Check, Plus } from '@phosphor-icons/react'
import { CategoryDot } from './CategoryChip'
import type { Category } from './types'

const NAME_MAX_LENGTH = 40

type Props = {
  categories: Category[]
  selectedIds: string[]
  onToggle: (category: Category) => void
  onCreate: (name: string) => Promise<void>
}

export function CategoryPicker({ categories, selectedIds, onToggle, onCreate }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)

  const name = query.trim()
  const visible = categories.filter((category) =>
    category.name.toLowerCase().includes(name.toLowerCase()),
  )
  const exact = categories.find((category) => category.name.toLowerCase() === name.toLowerCase())

  useEffect(() => {
    if (!open) return

    function closeOnOutsideClick(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) close()
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [open])

  function close() {
    setOpen(false)
    setQuery('')
    setError(null)
  }

  async function create() {
    setError(null)

    try {
      await onCreate(name)
      setQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      close()
    }

    if (event.key === 'Enter' && name) {
      event.preventDefault()
      if (exact) onToggle(exact)
      else void create()
    }
  }

  return (
    <div className="picker" ref={root}>
      <button
        className="picker-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => (open ? close() : setOpen(true))}
      >
        <Plus size={12} weight="bold" />
        Add
      </button>

      {open && (
        <div className="picker-panel" onKeyDown={handleKeyDown}>
          <input
            className="picker-search"
            placeholder="Find or create a category"
            aria-label="Find or create a category"
            maxLength={NAME_MAX_LENGTH}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />

          <ul className="picker-list" role="listbox" aria-multiselectable="true">
            {visible.map((category) => {
              const selected = selectedIds.includes(category.id)

              return (
                <li key={category.id}>
                  <button
                    className="picker-option"
                    role="option"
                    aria-selected={selected}
                    onClick={() => onToggle(category)}
                  >
                    <CategoryDot category={category} />
                    <span className="picker-name">{category.name}</span>
                    {selected && <Check size={14} weight="bold" />}
                  </button>
                </li>
              )
            })}

            {name && !exact && (
              <li>
                <button className="picker-option picker-create" onClick={() => void create()}>
                  <Plus size={14} weight="bold" />
                  <span className="picker-name">Create "{name}"</span>
                </button>
              </li>
            )}

            {!name && categories.length === 0 && (
              <li className="picker-empty">Type a name to create your first category.</li>
            )}
          </ul>

          {error && (
            <p className="picker-error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
