import type { ReactNode } from 'react'
import { Archive, Notepad, Plus, Rows, SidebarSimple, type Icon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { AccountMenu } from './AccountMenu'
import { AppLogo } from './AppLogo'
import { BrandCredit } from './BrandCredit'
import { ThemeCycleButton, ThemeSwitch } from './ThemeSwitch'
import { ease } from '../lib/motion'

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
  sidebarOpen: boolean
  listOpen: boolean
  onHide: () => void
  onShowList: () => void
  children?: ReactNode
  inert?: boolean
}

export function Sidebar({ view, counts, creating, onViewChange, onCreate, sidebarOpen, listOpen, onHide, onShowList, children, inert }: Props) {
  return (
    <aside className="sidebar" inert={inert}>
      <div className="sidebar-content">
        <div className="sidebar-top">
          <div className="sidebar-brand-row">
            <AppLogo />
            <div className="panel-header-controls">
              <AnimatePresence initial={false}>
                {sidebarOpen && !listOpen && (
                  <motion.button
                    key="show-list"
                    className="icon-button panel-control"
                    aria-label="Show note list"
                    title="Show note list (])"
                    onClick={onShowList}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.16, ease }}
                  >
                    <Rows size={16} weight="bold" />
                  </motion.button>
                )}
                {sidebarOpen && (
                  <motion.button
                    key="hide-sidebar"
                    className="icon-button panel-control"
                    aria-label="Hide sidebar"
                    title="Hide sidebar ([)"
                    onClick={onHide}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.16, ease }}
                  >
                    <SidebarSimple size={16} weight="bold" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          <ThemeCycleButton />
          <button className="button button-primary sidebar-new" onClick={onCreate} disabled={creating}>
            <Plus size={16} weight="bold" />
            New note
          </button>
          <div className="sidebar-account-avatar">
            <AccountMenu variant="avatar" />
          </div>
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

        {children}

        <div className="sidebar-account">
          <AccountMenu variant="row" />
        </div>

        <div className="sidebar-footer">
          <BrandCredit />
          <ThemeSwitch />
        </div>
      </div>
    </aside>
  )
}
