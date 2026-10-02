import { useEffect, useState } from 'react'
import { fetchCategories, isAbort } from './products.ts'
import type { Category } from '../types.ts'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const controller = new AbortController()
    fetchCategories(controller.signal)
      .then(setCategories)
      .catch((error: unknown) => {
        if (!isAbort(error)) setCategories([])
      })
    return () => controller.abort()
  }, [])

  return categories
}
