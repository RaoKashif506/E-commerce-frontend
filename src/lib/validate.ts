import type { CustomerDetails } from '../types.ts'

export type CustomerErrors = Partial<Record<keyof CustomerDetails, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const CUSTOMER_FIELDS = [
  'fullName',
  'email',
  'phone',
  'address',
  'city',
  'postalCode',
  'country',
] as const

export function validateCustomer(customer: CustomerDetails): CustomerErrors {
  const errors: CustomerErrors = {}

  if (customer.fullName.trim().length < 2) {
    errors.fullName = 'Enter the full name for this delivery.'
  }
  if (!EMAIL.test(customer.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (customer.phone.replace(/\D/g, '').length < 8) {
    errors.phone = 'Enter a phone number we can reach.'
  }
  if (customer.address.trim().length < 5) {
    errors.address = 'Enter a street address.'
  }
  if (customer.city.trim().length < 2) {
    errors.city = 'Enter a city.'
  }
  if (customer.postalCode.trim().length < 3) {
    errors.postalCode = 'Enter a postal code.'
  }
  if (customer.country.trim().length < 2) {
    errors.country = 'Enter a country.'
  }
  if (customer.shippingMethod !== 'standard' && customer.shippingMethod !== 'express') {
    errors.shippingMethod = 'Choose a delivery method.'
  }

  return errors
}

export function hasErrors(errors: CustomerErrors) {
  return Object.keys(errors).length > 0
}

export type MessageErrors = Partial<Record<'name' | 'email' | 'message', string>>

export function validateMessage(input: { name: string; email: string; message: string }): MessageErrors {
  const errors: MessageErrors = {}
  if (input.name.trim().length < 2) errors.name = 'Enter your name.'
  if (!EMAIL.test(input.email.trim())) errors.email = 'Enter a valid email address.'
  if (input.message.trim().length < 10) errors.message = 'Write a message of at least a short sentence.'
  return errors
}
