import { Archive, Notepad, Plus, type Icon } from '@phosphor-icons/react'

export type View = 'active' | 'archived'

const VIEWS: { id: View; label: string; icon: Icon }[] = [
  { id: 'active', label: 'Active', icon: Notepad },
  { id: 'archived', label: 'Archived', icon: Archive },
]

type Props = {
  view: View
  counts: Record<View, number>
  creating: boolean
  onViewChange: (view: View) => void
  onCreate: () => void
}

export function Sidebar({ view, counts, creating, onViewChange, onCreate }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span className="brand-mark" aria-hidden="true" />
          Notes
        </div>

        <button className="button button-primary sidebar-new" onClick={onCreate} disabled={creating}>
          <Plus size={16} weight="bold" />
          New note
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Views">
        {VIEWS.map(({ id, label, icon: ViewIcon }) => (
          <button
            key={id}
            className={`nav-item${id === view ? ' is-active' : ''}`}
            aria-current={id === view ? 'page' : undefined}
            onClick={() => onViewChange(id)}
          >
            <ViewIcon size={16} weight="bold" />
            <span>{label}</span>
            <span className="nav-count">{counts[id]}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
