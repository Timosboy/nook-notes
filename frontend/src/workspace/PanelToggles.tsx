import { Rows, SidebarSimple } from '@phosphor-icons/react'

type Props = {
  sidebar: boolean
  list: boolean
  onToggleSidebar: () => void
  onToggleList: () => void
}

export function PanelToggles({ sidebar, list, onToggleSidebar, onToggleList }: Props) {
  return (
    <div className="panel-toggles">
      <button
        className={`icon-button${sidebar ? ' is-pressed' : ''}`}
        aria-pressed={sidebar}
        aria-label="Toggle sidebar"
        title={`${sidebar ? 'Hide' : 'Show'} sidebar ([)`}
        onClick={onToggleSidebar}
      >
        <SidebarSimple size={16} weight="bold" />
      </button>
      <button
        className={`icon-button${list ? ' is-pressed' : ''}`}
        aria-pressed={list}
        aria-label="Toggle note list"
        title={`${list ? 'Hide' : 'Show'} note list (])`}
        onClick={onToggleList}
      >
        <Rows size={16} weight="bold" />
      </button>
    </div>
  )
}
