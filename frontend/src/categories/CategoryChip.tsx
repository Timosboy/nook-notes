import type { ReactNode } from 'react'
import type { Category } from './types'
import { toneStyle } from './tone'
import './categories.css'

type Props = {
  category: Category
  children?: ReactNode
}

export function CategoryChip({ category, children }: Props) {
  return (
    <span className="chip" style={toneStyle(category.color)}>
      {category.name}
      {children}
    </span>
  )
}

export function CategoryDot({ category }: Props) {
  return <span className="dot" style={toneStyle(category.color)} aria-hidden="true" />
}
