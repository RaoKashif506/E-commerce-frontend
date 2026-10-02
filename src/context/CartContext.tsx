import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { readJson, writeJson } from '../lib/storage.ts'
import type { CartLine, Product } from '../types.ts'
import { CartContext } from './cart-context.ts'

const CART_KEY = 'marlow.cart'

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false
  const line = value as CartLine
  return (
    typeof line.productId === 'string' &&
    typeof line.title === 'string' &&
    typeof line.price === 'number' &&
    typeof line.thumbnail === 'string' &&
    typeof line.quantity === 'number' &&
    line.quantity > 0 &&
    typeof line.stock === 'number'
  )
}

function readCart(): CartLine[] {
  const parsed = readJson(CART_KEY)
  if (!Array.isArray(parsed)) return []
  return parsed.filter(isCartLine)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(readCart)

  useEffect(() => {
    writeJson(CART_KEY, items)
  }, [items])

  const addItem = useCallback((product: Product, quantity = 1) => {
    const amount = Math.max(1, Math.floor(quantity))
    setItems((current) => {
      const existing = current.find((line) => line.productId === product.id)
      const nextQuantity = Math.min(product.stock, (existing?.quantity ?? 0) + amount)
      if (nextQuantity <= 0) return current
      const line: CartLine = {
        productId: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: nextQuantity,
        stock: product.stock,
      }
      if (!existing) return [...current, line]
      return current.map((item) => (item.productId === product.id ? line : item))
    })
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) => {
      if (quantity <= 0) return current.filter((line) => line.productId !== productId)
      return current.map((line) => {
        if (line.productId !== productId) return line
        return { ...line, quantity: Math.min(line.stock, Math.floor(quantity)) }
      })
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((line) => line.productId !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const count = items.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = items.reduce((sum, line) => sum + line.price * line.quantity, 0)

  const value = useMemo(
    () => ({ items, count, subtotal, addItem, setQuantity, removeItem, clearCart }),
    [items, count, subtotal, addItem, setQuantity, removeItem, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
