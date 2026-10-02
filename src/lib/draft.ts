import { clearSession, readSession, writeSession } from './storage.ts'
import type { CustomerDetails } from '../types.ts'

const DRAFT_KEY = 'marlow.checkout'

export const emptyCustomer: CustomerDetails = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  shippingMethod: 'standard',
}

function text(value: unknown) {
  return typeof value === 'string' ? value : ''
}

export function readDraft(): CustomerDetails {
  const parsed = readSession(DRAFT_KEY)
  if (!parsed || typeof parsed !== 'object') return emptyCustomer
  const draft = parsed as Partial<CustomerDetails>
  return {
    fullName: text(draft.fullName),
    email: text(draft.email),
    phone: text(draft.phone),
    address: text(draft.address),
    city: text(draft.city),
    postalCode: text(draft.postalCode),
    country: text(draft.country),
    shippingMethod: draft.shippingMethod === 'express' ? 'express' : 'standard',
  }
}

export function writeDraft(customer: CustomerDetails) {
  writeSession(DRAFT_KEY, customer)
}

export function clearDraft() {
  clearSession(DRAFT_KEY)
}
