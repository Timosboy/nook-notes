export const CATEGORY_COLORS = ['blue', 'green', 'yellow', 'purple', 'red', 'gray'] as const

export type CategoryColor = (typeof CATEGORY_COLORS)[number]

export type Category = {
  id: string
  name: string
  color: CategoryColor
}

export const nextColor = (used: number): CategoryColor =>
  CATEGORY_COLORS[used % CATEGORY_COLORS.length]
