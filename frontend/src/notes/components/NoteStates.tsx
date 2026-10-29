import type { ReactNode } from 'react'
import { NotePencil, WarningCircle } from '@phosphor-icons/react'

const SKELETON_COUNT = 3

export function NotesLoading() {
  return (
    <ul className="note-list" aria-busy="true" aria-label="Loading notes">
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <li key={index} className="note-skeleton" />
      ))}
    </ul>
  )
}

type EmptyProps = {
  title: string
  description: string
  action?: ReactNode
}

export function NotesEmpty({ title, description, action }: EmptyProps) {
  return (
    <div className="state">
      <span className="state-icon">
        <NotePencil size={22} weight="bold" />
      </span>
      <h2 className="state-title">{title}</h2>
      <p className="state-text">{description}</p>
      {action}
    </div>
  )
}

type ErrorProps = {
  message: string
  onRetry?: () => void
}

export function NotesError({ message, onRetry }: ErrorProps) {
  return (
    <div className="banner" role="alert">
      <WarningCircle size={18} weight="bold" />
      <span>{message}</span>
      {onRetry && (
        <button className="button button-ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
