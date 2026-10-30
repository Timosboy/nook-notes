import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CaretUpDown, SignOut } from '@phosphor-icons/react'
import { ease } from '../lib/motion'
import { endSession, useSession } from '../lib/session'
import './notemenu.css'

const MENU_WIDTH = 240

type Position = { left: number, width: number, top?: number, bottom?: number }

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? '?')[0]
  return letters.toUpperCase()
}

// 'row' sits at the bottom of the desktop sidebar, 'avatar' at the end of the mobile top bar.
export function AccountMenu({ variant }: { variant: 'row' | 'avatar' }) {
  const session = useSession()
  const [position, setPosition] = useState<Position | null>(null)
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
  const above = position?.bottom !== undefined

  function toggle() {
    if (open) {
      setPosition(null)
      return
    }
    const rect = trigger.current!.getBoundingClientRect()
    const width = variant === 'row' ? rect.width : MENU_WIDTH
    const left = variant === 'row' ? rect.left : rect.right - width
    const clamped = Math.min(Math.max(8, left), window.innerWidth - width - 8)
    setPosition(rect.top > window.innerHeight / 2
      ? { left: clamped, width, bottom: window.innerHeight - rect.top + 6 }
      : { left: clamped, width, top: rect.bottom + 6 })
  }

  const avatar = <span className="account-avatar" aria-hidden="true">{initials(user.name)}</span>

  return (
    <>
      {variant === 'row' ? (
        <button
          ref={trigger}
          className="account-row"
          type="button"
          aria-label={`Account: ${user.name}`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={toggle}
        >
          {avatar}
          <span className="account-row-text">
            <span className="account-name">{user.name}</span>
            <span className="account-email">{user.email}</span>
          </span>
          <CaretUpDown className="account-row-caret" size={14} weight="bold" />
        </button>
      ) : (
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
          {avatar}
        </button>
      )}
      {createPortal(
        <AnimatePresence>
          {position && (
            <motion.div
              ref={menu}
              className="note-menu account-menu"
              role="menu"
              style={{
                ...position,
                transformOrigin: above ? 'bottom left' : 'top right',
              }}
              initial={{ opacity: 0, y: above ? 4 : -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: above ? 4 : -4, scale: 0.98 }}
              transition={{ duration: 0.14, ease }}
            >
              {variant === 'avatar' && (
                <div className="account-summary">
                  <span className="account-name">{user.name}</span>
                  <span className="account-email">{user.email}</span>
                </div>
              )}
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
