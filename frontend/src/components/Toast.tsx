import { useEffect } from 'react'
import { X } from '@phosphor-icons/react'
import type { ToastMessage } from '../lib/useToast'

const VISIBLE_FOR_MS = 5000

type Props = {
  toast: ToastMessage | null
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: Props) {
  useEffect(() => {
    if (!toast) return

    const timer = setTimeout(onDismiss, VISIBLE_FOR_MS)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  if (!toast) return null

  function runAction() {
    toast?.action?.run()
    onDismiss()
  }

  return (
    <div className="toast" role="status" key={toast.id}>
      <span>{toast.text}</span>
      {toast.action && (
        <button className="toast-action" onClick={runAction}>
          {toast.action.label}
        </button>
      )}
      <button className="toast-close" aria-label="Dismiss" onClick={onDismiss}>
        <X size={14} weight="bold" />
      </button>
    </div>
  )
}
