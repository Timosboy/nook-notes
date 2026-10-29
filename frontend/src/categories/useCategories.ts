import { useCallback, useEffect, useState } from 'react'
import { categoriesApi } from './api'
import type { Category } from './types'

const byName = (a: Category, b: Category) => a.name.localeCompare(b.name)

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let ignore = false

    categoriesApi
      .list()
      .then((list) => !ignore && setCategories(list))
      .catch(() => undefined)

    return () => {
      ignore = true
    }
  }, [])

  const add = useCallback((category: Category) => {
    setCategories((current) => [...current, category].sort(byName))
  }, [])

  const drop = useCallback((id: string) => {
    setCategories((current) => current.filter((category) => category.id !== id))
  }, [])

  return { categories, add, drop }
}
