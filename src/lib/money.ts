import type { ShippingMethod } from '../types.ts'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const FREE_SHIPPING_AT = 75
export const STANDARD_SHIPPING = 6
export const EXPRESS_SHIPPING = 16

export function formatMoney(value: number) {
  return formatter.format(value)
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

export function shippingCost(subtotal: number, method: ShippingMethod) {
  if (method === 'express') return EXPRESS_SHIPPING
  if (subtotal >= FREE_SHIPPING_AT) return 0
  return STANDARD_SHIPPING
}

export function shippingLabel(method: ShippingMethod) {
  return method === 'express' ? 'Express delivery' : 'Standard delivery'
}

// DummyJSON `price` is the current selling price. The struck price is derived from the discount.
export function compareAtPrice(price: number, discountPercentage: number) {
  if (discountPercentage < 1) return null
  const original = roundMoney(price / (1 - discountPercentage / 100))
  if (original <= price) return null
  return original
}

export function formatRating(rating: number) {
  return `Rated ${rating.toFixed(1)} out of 5`
}

export function stockLabel(stock: number) {
  if (stock <= 0) return 'Out of stock'
  if (stock < 10) return `Only ${stock} left`
  return 'In stock'
}
