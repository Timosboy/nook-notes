import { Notepad, Plus } from '@phosphor-icons/react'

type Props = {
  activeCount: number
  creating: boolean
  onCreate: () => void
}

export function Sidebar({ activeCount, creating, onCreate }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true" />
        Notes
      </div>

      <button className="button button-primary sidebar-new" onClick={onCreate} disabled={creating}>
        <Plus size={16} weight="bold" />
        New note
      </button>

      <nav className="sidebar-nav" aria-label="Views">
        <button className="nav-item is-active" aria-current="page">
          <Notepad size={16} weight="bold" />
          <span>Active</span>
          <span className="nav-count">{activeCount}</span>
        </button>
      </nav>
    </aside>
  )
}
