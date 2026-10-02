import { readJson } from './storage.ts'
import type { CartLine, CustomerDetails, Order } from '../types.ts'
import { roundMoney, shippingCost } from './money.ts'

const ORDERS_KEY = 'marlow.orders'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false
  const line = value as CartLine
  return (
    typeof line.productId === 'number' &&
    typeof line.title === 'string' &&
    typeof line.price === 'number' &&
    typeof line.thumbnail === 'string' &&
    typeof line.quantity === 'number' &&
    line.quantity > 0 &&
    typeof line.stock === 'number'
  )
}

function isCustomer(value: unknown): value is CustomerDetails {
  if (!value || typeof value !== 'object') return false
  const customer = value as CustomerDetails
  return (
    typeof customer.fullName === 'string' &&
    typeof customer.email === 'string' &&
    typeof customer.phone === 'string' &&
    typeof customer.address === 'string' &&
    typeof customer.city === 'string' &&
    typeof customer.postalCode === 'string' &&
    typeof customer.country === 'string' &&
    (customer.shippingMethod === 'standard' || customer.shippingMethod === 'express')
  )
}

function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== 'object') return false
  const order = value as Order
  return (
    typeof order.id === 'string' &&
    typeof order.createdAt === 'string' &&
    order.status === 'Placed' &&
    Array.isArray(order.items) &&
    order.items.every(isCartLine) &&
    isCustomer(order.customer) &&
    typeof order.subtotal === 'number' &&
    typeof order.shipping === 'number' &&
    typeof order.total === 'number'
  )
}

export function readOrders(): Order[] {
  const parsed = readJson(ORDERS_KEY)
  if (!Array.isArray(parsed)) return []
  return parsed.filter(isOrder)
}

export function getOrder(id: string) {
  return readOrders().find((order) => order.id === id) ?? null
}

export function getLatestOrder() {
  return readOrders()[0] ?? null
}

function createOrderId(existing: Order[]) {
  const taken = new Set(existing.map((order) => order.id))
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const bytes = crypto.getRandomValues(new Uint8Array(6))
    let id = 'ML-'
    for (const byte of bytes) id += ALPHABET[byte % ALPHABET.length]
    if (!taken.has(id)) return id
  }
  return `ML-${Date.now().toString(36).toUpperCase()}`
}

export function createOrder(items: CartLine[], customer: CustomerDetails): Order {
  if (items.length === 0) throw new Error('The cart is empty.')

  const existing = readOrders()
  const subtotal = roundMoney(items.reduce((sum, line) => sum + line.price * line.quantity, 0))
  const shipping = shippingCost(subtotal, customer.shippingMethod)
  const order: Order = {
    id: createOrderId(existing),
    createdAt: new Date().toISOString(),
    status: 'Placed',
    items: items.map((line) => ({ ...line })),
    customer: { ...customer },
    subtotal,
    shipping,
    total: roundMoney(subtotal + shipping),
  }

  const payload = JSON.stringify([order, ...existing])
  localStorage.setItem(ORDERS_KEY, payload)
  if (localStorage.getItem(ORDERS_KEY) !== payload) {
    throw new Error('The order could not be saved in this browser.')
  }
  return order
}
