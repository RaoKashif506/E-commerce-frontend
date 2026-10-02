import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { createOrder } from '../api/orders.ts'
import { TextField } from '../components/TextField.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import { useCart } from '../context/useCart.ts'
import { clearDraft, readDraft, writeDraft } from '../lib/draft.ts'
import {
  EXPRESS_SHIPPING,
  FREE_SHIPPING_AT,
  formatMoney,
  roundMoney,
  shippingCost,
  STANDARD_SHIPPING,
} from '../lib/money.ts'
import { usePageTitle } from '../lib/usePageTitle.ts'
import { CUSTOMER_FIELDS, hasErrors, validateCustomer } from '../lib/validate.ts'
import type { CustomerErrors } from '../lib/validate.ts'
import type { CustomerDetails, ShippingMethod } from '../types.ts'

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function CheckoutPage() {
  usePageTitle('Checkout · Marlow')

  const { user } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [customer, setCustomer] =
    useState<CustomerDetails>(readDraft)

  const [errors, setErrors] =
    useState<CustomerErrors>({})

  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const placing = useRef(false)

  useEffect(() => {
    writeDraft(customer)
  }, [customer])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const rounded = roundMoney(subtotal)

  const shipping = shippingCost(
    rounded,
    customer.shippingMethod,
  )

  const total = roundMoney(rounded + shipping)

  const hasInvalidStock = items.some(
    (item) =>
      item.stock <= 0 ||
      item.quantity > item.stock,
  )

  function update<K extends keyof CustomerDetails>(
    key: K,
    value: CustomerDetails[K],
  ) {
    const next = {
      ...customer,
      [key]: value,
    }

    setCustomer(next)

    if (hasErrors(errors)) {
      setErrors(validateCustomer(next))
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()

    if (placing.current) return

    if (hasInvalidStock) {
      setFormError(
        'One or more products do not have enough stock. Please return to your cart and update it.',
      )
      return
    }

    const nextErrors = validateCustomer(customer)

    setErrors(nextErrors)
    setFormError('')

    if (hasErrors(nextErrors)) {
      const first = CUSTOMER_FIELDS.find(
        (field) => nextErrors[field],
      )

      if (first) {
        const element = document.getElementById(first)

        element?.focus()
        element?.scrollIntoView({
          block: 'center',
        })
      }

      return
    }

    placing.current = true
    setSubmitting(true)

    try {
      await wait(400)

      const order = await createOrder(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        {
          ...customer,
          fullName: customer.fullName.trim(),
          email: customer.email.trim().toLowerCase(),
          phone: customer.phone.trim(),
          address: customer.address.trim(),
          city: customer.city.trim(),
          postalCode: customer.postalCode.trim(),
          country: customer.country.trim(),
        },
      )

      clearDraft()
      clearCart()

      navigate(`/order/${order.id}`)
    } catch (caught) {
      placing.current = false
      setSubmitting(false)

      setFormError(
        caught instanceof Error
          ? caught.message
          : 'The order was not placed. Try again.',
      )
    }
  }

  if (items.length === 0) {
    return (
      <div className="wrap page">
        <header className="page-head">
          <h1>Checkout</h1>
        </header>

        <div className="status-block">
          <p>
            Your cart is empty, so there is nothing to place.
          </p>

          <div className="actions">
            <Link
              className="button-primary"
              to="/products"
            >
              Browse products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const standardPrice =
    rounded >= FREE_SHIPPING_AT
      ? 'Free'
      : `${formatMoney(
          STANDARD_SHIPPING,
        )}, free from ${formatMoney(FREE_SHIPPING_AT)}`

  return (
    <div className="wrap page">
      <header className="page-head">
        <h1>Checkout</h1>
      </header>

      <div className="checkout">
        <form
          id="checkout-form"
          onSubmit={(event) => void onSubmit(event)}
          noValidate
        >
          {hasErrors(errors) ? (
            <p
              className="form-alert"
              role="alert"
            >
              Check the highlighted fields.
            </p>
          ) : null}

          {formError ? (
            <p
              className="form-alert"
              role="alert"
            >
              {formError}
            </p>
          ) : null}

          {hasInvalidStock ? (
            <p
              className="form-alert"
              role="alert"
            >
              One or more products in your cart have
              insufficient stock. Please update your cart
              before placing the order.
            </p>
          ) : null}

          <div className="form-grid">
            <TextField
              id="fullName"
              label="Full name"
              autoComplete="name"
              wide
              value={customer.fullName}
              error={errors.fullName}
              onChange={(value) =>
                update('fullName', value)
              }
            />

            <TextField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={customer.email}
              error={errors.email}
              onChange={(value) =>
                update('email', value)
              }
            />

            <TextField
              id="phone"
              label="Phone"
              type="tel"
              autoComplete="tel"
              value={customer.phone}
              error={errors.phone}
              onChange={(value) =>
                update('phone', value)
              }
            />

            <TextField
              id="address"
              label="Street address"
              autoComplete="street-address"
              wide
              value={customer.address}
              error={errors.address}
              onChange={(value) =>
                update('address', value)
              }
            />

            <TextField
              id="city"
              label="City"
              autoComplete="address-level2"
              value={customer.city}
              error={errors.city}
              onChange={(value) =>
                update('city', value)
              }
            />

            <TextField
              id="postalCode"
              label="Postal code"
              autoComplete="postal-code"
              value={customer.postalCode}
              error={errors.postalCode}
              onChange={(value) =>
                update('postalCode', value)
              }
            />

            <TextField
              id="country"
              label="Country"
              autoComplete="country-name"
              wide
              value={customer.country}
              error={errors.country}
              onChange={(value) =>
                update('country', value)
              }
            />
          </div>

          <fieldset>
            <legend>Delivery</legend>

            <label className="choice">
              <input
                type="radio"
                name="shippingMethod"
                value="standard"
                checked={
                  customer.shippingMethod === 'standard'
                }
                onChange={() =>
                  update(
                    'shippingMethod',
                    'standard' satisfies ShippingMethod,
                  )
                }
              />

              <span>
                Standard delivery

                <span className="choice-note">
                  {standardPrice}. Arrives in 3–5 business
                  days.
                </span>
              </span>
            </label>

            <label className="choice">
              <input
                type="radio"
                name="shippingMethod"
                value="express"
                checked={
                  customer.shippingMethod === 'express'
                }
                onChange={() =>
                  update(
                    'shippingMethod',
                    'express',
                  )
                }
              />

              <span>
                Express delivery

                <span className="choice-note">
                  {formatMoney(EXPRESS_SHIPPING)}.
                  Arrives in 1–2 business days.
                </span>
              </span>
            </label>
          </fieldset>

          <button
            type="submit"
            className="button-primary"
            disabled={submitting || hasInvalidStock}
            aria-busy={submitting}
          >
            {submitting
              ? 'Placing order'
              : 'Place order'}
          </button>
        </form>

        <aside
          className="summary"
          aria-label="Order summary"
        >
          <h2>Order summary</h2>

          <ul className="summary-lines">
            {items.map((line) => (
              <li key={line.productId}>
                <span>{line.title}</span>
                <span>Qty {line.quantity}</span>
                <span>
                  {formatMoney(
                    line.price * line.quantity,
                  )}
                </span>
              </li>
            ))}
          </ul>

          <dl className="totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatMoney(rounded)}</dd>
            </div>

            <div>
              <dt>Delivery</dt>
              <dd>
                {shipping === 0
                  ? 'Free'
                  : formatMoney(shipping)}
              </dd>
            </div>

            <div className="totals-grand">
              <dt>Total</dt>
              <dd>{formatMoney(total)}</dd>
            </div>
          </dl>

          <p className="summary-note">
            Payment is collected on delivery. Placing the
            order does not charge a card.
          </p>
        </aside>
      </div>
    </div>
  )
}