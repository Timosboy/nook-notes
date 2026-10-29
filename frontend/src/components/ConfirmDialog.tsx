import { useEffect, useRef, useState } from 'react'

type Props = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) dialog.current?.showModal()
    else dialog.current?.close()
  }, [open])

  async function confirm() {
    setBusy(true)
    setError(null)

    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog ref={dialog} className="dialog" onClose={onClose} aria-labelledby="dialog-title">
      <h2 id="dialog-title" className="dialog-title">
        {title}
      </h2>
      <p className="dialog-text">{description}</p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="dialog-actions">
        <button className="button button-ghost" onClick={onClose} autoFocus>
          Cancel
        </button>
        <button className="button button-danger" onClick={() => void confirm()} disabled={busy}>
          {busy ? 'Working...' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
