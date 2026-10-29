import { Rows, SidebarSimple } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { ease } from '../lib/motion'

type Props = {
  sidebar: boolean
  list: boolean
  onToggleSidebar: () => void
  onToggleList: () => void
}

export function PanelToggles({ sidebar, list, onToggleSidebar, onToggleList }: Props) {
  return (
    <div className="panel-toggles">
      <AnimatePresence initial={false}>
        {!sidebar && (
          <motion.button
            key="show-sidebar"
            className="icon-button panel-control"
            aria-label="Show sidebar"
            title="Show sidebar ([)"
            onClick={onToggleSidebar}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.16, ease }}
          >
            <SidebarSimple size={16} weight="bold" />
          </motion.button>
        )}
        {!list && (
          <motion.button
            key="show-list"
            className="icon-button panel-control"
            aria-label="Show note list"
            title="Show note list (])"
            onClick={onToggleList}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.16, ease }}
          >
            <Rows size={16} weight="bold" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
