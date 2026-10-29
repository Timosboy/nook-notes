import type { Ref } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'

type Props = {
  value: string
  onChange: (value: string) => void
  ref?: Ref<HTMLInputElement>
}

export function SearchField({ value, onChange, ref }: Props) {
  return (
    <label className="search">
      <MagnifyingGlass size={15} weight="bold" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        placeholder="Search notes"
        aria-label="Search notes"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && onChange('')}
      />
      {!value && <kbd aria-keyshortcuts="/" title="Press / to search">/</kbd>}
    </label>
  )
}
