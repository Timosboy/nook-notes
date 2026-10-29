import type { CSSProperties } from 'react'

export const toneStyle = (color?: string): CSSProperties =>
  ({ '--tone': color ?? '#787774' }) as CSSProperties
