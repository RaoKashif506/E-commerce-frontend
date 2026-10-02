import { createContext } from 'react'
import type { CartLine, Product } from '../types.ts'

export type CartValue = {
  items: CartLine[]
  count: number
  subtotal: number
  addItem: (product: Product, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartValue | null>(null)
