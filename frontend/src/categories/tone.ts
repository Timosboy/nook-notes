import type { CSSProperties } from 'react'

export const toneStyle = (color?: string): CSSProperties =>
  ({ '--tone': color ?? 'var(--gray-text)' }) as CSSProperties
