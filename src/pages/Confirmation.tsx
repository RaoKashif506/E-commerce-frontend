import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrder } from '../api/orders.ts'
import { ProductImage } from '../components/ProductImage.tsx'
import { formatMoney, shippingLabel } from '../lib/money.ts'
import { usePageTitle } from '../lib/usePageTitle.ts'

function formatWhen(iso: string) {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return iso
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

type ApiOrder = {
  id: string
  createdAt: string
  status: string
  items: Array<{
    productId: string
    title: string
    price: number
    thumbnail: string
    quantity: number
  }>
  customer: {
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
    phone: string
    email: string
    shippingMethod: 'standard' | 'express'
  }
  subtotal: number
  shipping: number
  total: number
}

export function ConfirmationPage() {
  const { orderId } = useParams()

  const [order, setOrder] = useState<ApiOrder | null>(null)
  const [error, setError] = useState('')

  usePageTitle(
    order ? `Order ${order.id} · Marlow` : 'Order · Marlow',
  )

  useEffect(() => {
    if (!orderId) {
      setError('No order reference was provided.')
      return
    }

    const controller = new AbortController()

    setOrder(null)
    setError('')

    getOrder(orderId, controller.signal)
      .then((nextOrder) => {
        if (controller.signal.aborted) return
        setOrder(nextOrder)
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return

        setError(
          caught instanceof Error
            ? caught.message
            : 'Could not load order.',
        )
      })

    return () => controller.abort()
  }, [orderId])

  if (!order && !error) {
    return (
      <div className="wrap page">
        <header className="page-head">
          <h1>Loading order…</h1>
        </header>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="wrap page">
        <header className="page-head">
          <h1>We could not find that order.</h1>
        </header>

        <div className="status-block">
          <p>
            {error ||
              'The reference may be wrong, or the order was saved in a different browser.'}
          </p>

          <Link
            className="button-primary"
            to="/products"
          >
            Back to the shop
          </Link>
        </div>
      </div>
    )
  }

  const { customer } = order

  return (
    <div className="wrap page">
      <header className="page-head">
        <h1>Order placed</h1>

        <p>
          Keep this reference. It is stored in the database
          and can be tracked from your account.
        </p>
      </header>

      <dl className="meta">
        <dt>Order number</dt>
        <dd>{order.id}</dd>

        <dt>Placed</dt>
        <dd>{formatWhen(order.createdAt)}</dd>

        <dt>Status</dt>
        <dd className="status-ok">{order.status}</dd>

        <dt>Payment</dt>
        <dd>Pay on delivery</dd>

        <dt>Delivery</dt>
        <dd>
          {shippingLabel(customer.shippingMethod)}
        </dd>
      </dl>

      <section className="section">
        <h2>Purchased products</h2>

        <ul className="cart-list">
          {order.items.map((line) => (
            <li
              key={line.productId}
              className="cart-line"
            >
              <Link
                className="cart-photo"
                to={`/products/${line.productId}`}
              >
                <ProductImage
                  src={line.thumbnail}
                  alt=""
                />
              </Link>

              <div>
                <h3>
                  <Link
                    to={`/products/${line.productId}`}
                  >
                    {line.title}
                  </Link>
                </h3>

                <p>Qty {line.quantity}</p>
              </div>

              <p className="line-total">
                {formatMoney(
                  line.price * line.quantity,
                )}
              </p>
            </li>
          ))}
        </ul>

        <dl className="totals confirm-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>
              {formatMoney(order.subtotal)}
            </dd>
          </div>

          <div>
            <dt>Delivery</dt>
            <dd>
              {order.shipping === 0
                ? 'Free'
                : formatMoney(order.shipping)}
            </dd>
          </div>

          <div className="totals-grand">
            <dt>Total</dt>
            <dd>
              {formatMoney(order.total)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <h2>Delivery details</h2>

        <address className="address">
          {customer.fullName}
          <br />
          {customer.address}
          <br />
          {customer.city} {customer.postalCode}
          <br />
          {customer.country}
          <br />
          {customer.phone}
          <br />
          {customer.email}
        </address>
      </section>

      <div className="actions">
        <Link
          className="button-primary"
          to="/products"
        >
          Keep shopping
        </Link>

        <Link
          className="button-secondary"
          to="/"
        >
          Home
        </Link>
      </div>
    </div>
  )
}