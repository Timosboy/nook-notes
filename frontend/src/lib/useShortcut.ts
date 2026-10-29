import { useEffect, useRef } from 'react'

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

export function useShortcut(key: string, handler: () => void) {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== key || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTyping(event.target) || document.querySelector('dialog[open]')) return

      event.preventDefault()
      handlerRef.current()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key])
}
