import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Check, Eyedropper } from '@phosphor-icons/react'
import { PALETTE, nextColor } from './palette'
import { toneStyle } from './tone'
import type { Category } from './types'

type Props = {
  used: string[]
  category?: Category
  onSave: (name: string, color: string) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function CategoryForm({ used, category, onSave, onCancel, onDelete }: Props) {
  const [name, setName] = useState(category?.name ?? '')
  const [color, setColor] = useState(category?.color ?? nextColor(used))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const colorInput = useRef<HTMLInputElement>(null)
  const selectedPalette = PALETTE.find(({ hex }) => hex.toLowerCase() === color.toLowerCase())

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (saving || !name.trim()) return

    setSaving(true)
    setError(null)

    try {
      await onSave(name.trim(), color.toLowerCase())
      onCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      input.current?.focus()
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
    }
  }

  return (
    <form className="category-form" onSubmit={(event) => void submit(event)} onKeyDown={handleKeyDown}>
      <input
        ref={input}
        className="category-input"
        aria-label="Category name"
        placeholder="Category name"
        maxLength={40}
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
      />

      <div className="category-swatches" aria-label="Category color">
        {PALETTE.map(({ name: colorName, hex }) => {
          const selected = color.toLowerCase() === hex.toLowerCase()

          return (
            <button
              key={colorName}
              className="category-swatch"
              type="button"
              style={toneStyle(hex)}
              aria-label={colorName}
              aria-pressed={selected}
              onClick={() => setColor(hex)}
            >
              {selected && <Check size={12} weight="bold" />}
            </button>
          )
        })}
        <button
          className={`category-swatch category-custom${!selectedPalette ? ' is-selected' : ''}`}
          type="button"
          style={toneStyle(selectedPalette ? undefined : color)}
          aria-label="Custom color"
          aria-pressed={!selectedPalette}
          onClick={() => colorInput.current?.click()}
        >
          {!selectedPalette && <Check size={12} weight="bold" />}
          {selectedPalette && <Eyedropper size={12} weight="bold" />}
        </button>
        <input
          ref={colorInput}
          className="category-color-input"
          type="color"
          aria-label="Choose custom color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          tabIndex={-1}
        />
      </div>

      <span className="chip category-preview" style={toneStyle(color)}>
        {name.trim() || 'Category name'}
      </span>

      {error && <p className="category-form-error" role="alert">{error}</p>}

      <div className="category-form-actions">
        <button className="button button-primary category-submit" type="submit" disabled={saving || !name.trim()}>
          {saving ? 'Saving...' : category ? 'Save' : 'Create'}
        </button>
        <button className="category-cancel" type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        {onDelete && (
          <button className="category-delete-action" type="button" onClick={onDelete} disabled={saving}>
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
