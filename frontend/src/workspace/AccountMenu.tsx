import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { SignOut } from '@phosphor-icons/react'
import { ease } from '../lib/motion'
import { endSession, useSession } from '../lib/session'
import './notemenu.css'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? '?')[0]
  return letters.toUpperCase()
}

export function AccountMenu() {
  const session = useSession()
  const [position, setPosition] = useState<{ top: number, left: number } | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const open = position !== null

  useEffect(() => {
    if (!open) return
    menu.current?.querySelector<HTMLButtonElement>('button')?.focus()

    function handlePointer(event: PointerEvent) {
      const target = event.target as Node
      if (!menu.current?.contains(target) && !trigger.current?.contains(target)) setPosition(null)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setPosition(null)
      trigger.current?.focus()
    }
    function handleResize() {
      setPosition(null)
    }

    document.addEventListener('pointerdown', handlePointer)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('pointerdown', handlePointer)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', handleResize)
    }
  }, [open])

  if (!session) return null
  const { user } = session

  function toggle() {
    if (open) {
      setPosition(null)
      return
    }
    const rect = trigger.current!.getBoundingClientRect()
    const width = 240
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
    setPosition({ top: rect.bottom + 6, left })
  }

  return (
    <>
      <button
        ref={trigger}
        className="account-trigger"
        type="button"
        aria-label={`Account: ${user.name}`}
        title={user.email}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        {initials(user.name)}
      </button>
      {createPortal(
        <AnimatePresence>
          {position && (
            <motion.div
              ref={menu}
              className="note-menu account-menu"
              role="menu"
              style={{ top: position.top, left: position.left }}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.14, ease }}
            >
              <div className="account-summary">
                <span className="account-name">{user.name}</span>
                <span className="account-email">{user.email}</span>
              </div>
              <button className="note-menu-item" role="menuitem" type="button" onClick={() => endSession()}>
                <SignOut size={16} weight="bold" />
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
