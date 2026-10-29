import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Archive, ArrowUUpLeft, DotsThree, PushPin, Trash } from '@phosphor-icons/react'
import { ease } from '../lib/motion'
import type { Note } from '../notes/types'
import './notemenu.css'

type Props = {
  note: Note
  onTogglePin: () => void
  onToggleArchive: () => void
  onDelete: () => void
}

type Position = {
  top: number
  left: number
  origin: string
}

let closeActiveMenu: (() => void) | null = null
let activeMenuOwner: symbol | null = null

export function NoteMenu({ note, onTogglePin, onToggleArchive, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const menuId = useRef(Symbol())
  const items = useRef<Array<HTMLButtonElement | null>>([])

  const close = useCallback((restoreFocus = false) => {
    setOpen(false)
    setPosition(null)
    if (activeMenuOwner === menuId.current) {
      closeActiveMenu = null
      activeMenuOwner = null
    }
    if (restoreFocus) trigger.current?.focus()
  }, [])

  const show = useCallback((focusFirst = false) => {
    closeActiveMenu?.()
    closeActiveMenu = close
    activeMenuOwner = menuId.current
    setOpen(true)
    if (focusFirst) requestAnimationFrame(() => items.current[0]?.focus())
  }, [close])

  useLayoutEffect(() => {
    if (!open || !trigger.current || !menu.current) return

    const rect = trigger.current.getBoundingClientRect()
    const menuRect = menu.current.getBoundingClientRect()
    const gap = 4
    const below = window.innerHeight - rect.bottom - gap
    const above = rect.top - gap
    const flip = below < menuRect.height && above > below
    const top = flip
      ? Math.max(8, rect.top - menuRect.height - gap)
      : Math.min(window.innerHeight - menuRect.height - 8, rect.bottom + gap)
    const left = Math.min(window.innerWidth - menuRect.width - 8, Math.max(8, rect.right - menuRect.width))

    setPosition({ top, left, origin: flip ? 'bottom right' : 'top right' })
  }, [open])

  useEffect(() => {
    if (!open) return

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target as Node
      if (!trigger.current?.contains(target) && !menu.current?.contains(target)) close()
    }

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      close(true)
    }

    const closeOnScroll = () => close()
    const closeOnResize = () => close()

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('scroll', closeOnScroll, true)
    window.addEventListener('resize', closeOnResize)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('scroll', closeOnScroll, true)
      window.removeEventListener('resize', closeOnResize)
    }
  }, [open, close])

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      show(true)
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) close()
      else show(true)
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabledItems = items.current.filter((item): item is HTMLButtonElement => item !== null)
    const currentIndex = enabledItems.indexOf(document.activeElement as HTMLButtonElement)
    let nextIndex: number | null = null

    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % enabledItems.length
    if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = enabledItems.length - 1
    if (event.key === 'Tab') close()

    if (nextIndex !== null) {
      event.preventDefault()
      enabledItems[nextIndex]?.focus()
    }
  }

  function choose(action: () => void) {
    close()
    action()
  }

  const actions = [
    ...(!note.archived ? [{ label: note.pinned ? 'Unpin note' : 'Pin note', icon: PushPin, action: onTogglePin }] : []),
    { label: note.archived ? 'Restore' : 'Archive', icon: note.archived ? ArrowUUpLeft : Archive, action: onToggleArchive },
  ]

  return (
    <>
      <button
        ref={trigger}
        className="note-menu-trigger"
        aria-label="Note actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          if (open) close()
          else show()
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <DotsThree size={18} weight="bold" aria-hidden="true" />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menu}
              className="note-menu"
              role="menu"
              style={{
                top: position?.top ?? -1000,
                left: position?.left ?? -1000,
                transformOrigin: position?.origin ?? 'top right',
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.12, ease } }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.1, ease } }}
              onKeyDown={handleMenuKeyDown}
            >
              {actions.map(({ label, icon: Icon, action }, index) => (
                <button
                  key={label}
                  ref={(element) => { items.current[index] = element }}
                  className="note-menu-item"
                  role="menuitem"
                  onClick={() => choose(action)}
                >
                  <Icon size={15} weight="bold" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
              <div className="note-menu-separator" role="separator" />
              <button
                ref={(element) => { items.current[actions.length] = element }}
                className="note-menu-item is-danger"
                role="menuitem"
                onClick={() => choose(onDelete)}
              >
                <Trash size={15} weight="bold" aria-hidden="true" />
                <span>Delete</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
