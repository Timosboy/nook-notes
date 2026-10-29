import { useCallback, useState } from 'react'

export type ToastAction = {
  label: string
  run: () => void
}

export type ToastMessage = {
  id: number
  text: string
  action?: ToastAction
}

export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const show = useCallback((text: string, action?: ToastAction) => {
    setToast({ id: Date.now(), text, action })
  }, [])

  const dismiss = useCallback(() => setToast(null), [])

  return { toast, show, dismiss }
}
