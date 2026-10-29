import type { ReactNode } from 'react'
import type { Category } from './types'
import './categories.css'

type Props = {
  category: Category
  children?: ReactNode
}

export function CategoryChip({ category, children }: Props) {
  return (
    <span className={`chip chip-${category.color}`}>
      {category.name}
      {children}
    </span>
  )
}

export function CategoryDot({ category }: Props) {
  return <span className={`dot dot-${category.color}`} aria-hidden="true" />
}
