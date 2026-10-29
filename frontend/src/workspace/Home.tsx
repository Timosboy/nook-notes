import { MagnifyingGlass, NotePencil, Plus } from '@phosphor-icons/react'
import { timeAgo } from '../lib/format'
import { toneStyle } from '../categories/tone'
import type { Note } from '../notes/types'

const RECENT_COUNT = 3

type Props = {
  notes: Note[]
  archivedCount: number
  onOpen: (note: Note) => void
  onCreate: () => void
  onSearch: () => void
}

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning'
  if (hour < 19) return 'Good afternoon'
  return 'Good evening'
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

export function Home({ notes, archivedCount, onOpen, onCreate, onSearch }: Props) {
  const recent = notes.slice(0, RECENT_COUNT)

  return (
    <section className="home">
      <h2 className="home-title">{greeting()}</h2>
      <p className="home-summary">
        {plural(notes.length, 'active note')} · {archivedCount} archived
      </p>

      {recent.length > 0 && (
        <>
          <h3 className="home-heading">Jump back in</h3>
          <ul className="recent-grid">
            {recent.map((note) => (
              <li key={note.id}>
                <button className="recent-card" onClick={() => onOpen(note)}>
                  <span className="recent-icon tone-tile" style={toneStyle(note.categories[0]?.color)}>
                    <NotePencil size={16} weight="duotone" />
                  </span>
                  <span className="recent-title">{note.title}</span>
                  <span className="recent-time">{timeAgo(note.updatedAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3 className="home-heading">Get started</h3>
      <div className="home-actions">
        <button className="action-card" onClick={onCreate}>
          <Plus size={16} weight="bold" />
          <span>New note</span>
          <kbd>N</kbd>
        </button>
        <button className="action-card" onClick={onSearch}>
          <MagnifyingGlass size={16} weight="bold" />
          <span>Search notes</span>
          <kbd>/</kbd>
        </button>
      </div>
    </section>
  )
}
