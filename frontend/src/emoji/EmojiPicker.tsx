import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { emojis, EMOJI_GROUPS, searchEmojis, type Emoji } from './emojis'
import './emoji.css'

const STORAGE_KEY = 'notes-recent-emojis'

function readRecent() {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((char): char is string => typeof char === 'string').slice(0, 12) : []
  } catch {
    return []
  }
}

type Props = {
  open: boolean
  hasEmoji: boolean
  onChoose: (emoji: string | null) => void
  onClose: () => void
}

export function EmojiPicker({ open, hasEmoji, onChoose, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(readRecent)
  const root = useRef<HTMLDivElement>(null)
  const results = useMemo(() => searchEmojis(query), [query])

  useEffect(() => {
    if (!open) return

    function closeOnOutsideClick(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) {
        setQuery('')
        onClose()
      }
    }

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setQuery('')
        onClose()
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, onClose])

  if (!open) return null

  function choose(emoji: Emoji) {
    const next = [emoji.char, ...recent.filter((char) => char !== emoji.char)].slice(0, 12)
    setRecent(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      setRecent(next)
    }
    setQuery('')
    onChoose(emoji.char)
    onClose()
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && results[0]) {
      event.preventDefault()
      choose(results[0])
    }
  }

  const grouped = EMOJI_GROUPS.map((group) => ({
    group,
    items: results.filter((emoji) => emoji.group === group),
  })).filter(({ items }) => items.length > 0)
  const recentItems = recent.flatMap((char) => {
    const emoji = emojis.find((item) => item.char === char)
    return emoji ? [emoji] : []
  })

  return (
    <>
      <button className="emoji-backdrop" aria-label="Close emoji picker" onClick={() => { setQuery(''); onClose() }} />
      <div className="emoji-picker" ref={root} role="dialog" aria-label="Choose an icon">
        <input
          className="emoji-search"
          type="search"
          placeholder="Search emoji"
          aria-label="Search emoji"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          autoFocus
        />
        {hasEmoji && (
          <div className="emoji-actions">
            <button className="emoji-action" onClick={() => { setQuery(''); onChoose(null); onClose() }}>Remove</button>
            <button className="emoji-action" onClick={() => choose(emojis[Math.floor(Math.random() * emojis.length)])}>Random</button>
          </div>
        )}
        {!hasEmoji && (
          <div className="emoji-actions">
            <span />
            <button className="emoji-action" onClick={() => choose(emojis[Math.floor(Math.random() * emojis.length)])}>Random</button>
          </div>
        )}
        <div className="emoji-results">
          {!query.trim() && recentItems.length > 0 && (
            <section className="emoji-section">
              <h3 className="emoji-heading">Recent</h3>
              <div className="emoji-grid">
                {recentItems.map((emoji) => <EmojiButton key={emoji.char} emoji={emoji} onChoose={choose} />)}
              </div>
            </section>
          )}
          {grouped.map(({ group, items }) => (
            <section className="emoji-section" key={group}>
              <h3 className="emoji-heading">{group}</h3>
              <div className="emoji-grid">
                {items.map((emoji) => <EmojiButton key={emoji.char} emoji={emoji} onChoose={choose} />)}
              </div>
            </section>
          ))}
          {results.length === 0 && <p className="emoji-empty">No emoji found</p>}
        </div>
      </div>
    </>
  )
}

type ButtonProps = { emoji: Emoji; onChoose: (emoji: Emoji) => void }

function EmojiButton({ emoji, onChoose }: ButtonProps) {
  return (
    <button className="emoji-option" aria-label={emoji.name} title={emoji.name} onClick={() => onChoose(emoji)}>
      {emoji.char}
    </button>
  )
}
