import { Link } from 'react-router-dom'
import { ProductImage } from '../components/ProductImage.tsx'
import { QuantityStepper } from '../components/QuantityStepper.tsx'
import { useCart } from '../context/useCart.ts'
import { formatMoney, roundMoney, shippingCost } from '../lib/money.ts'
import { usePageTitle } from '../lib/usePageTitle.ts'

export function CartPage() {
  usePageTitle('Cart · Marlow')

  const { items, subtotal, setQuantity, removeItem } = useCart()

  const rounded = roundMoney(subtotal)
  const shipping = shippingCost(rounded, 'standard')
  const total = roundMoney(rounded + shipping)

  const hasInvalidStock = items.some(
    (line) => line.stock <= 0 || line.quantity > line.stock,
  )

  return (
    <div className="wrap page">
      <header className="page-head">
        <h1>Cart</h1>
      </header>

      {items.length === 0 ? (
        <div className="status-block">
          <p>Your cart is empty. The counter is still open.</p>

          <Link className="button-primary" to="/products">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-list">
            {items.map((line) => {
              const outOfStock = line.stock <= 0
              const exceedsStock = line.quantity > line.stock

              return (
                <li key={line.productId} className="cart-line">
                  <Link
                    className="cart-photo"
                    to={`/products/${line.productId}`}
                  >
                    <ProductImage src={line.thumbnail} alt="" />
                  </Link>

                  <div>
                    <h2>
                      <Link to={`/products/${line.productId}`}>
                        {line.title}
                      </Link>
                    </h2>

                    <p>{formatMoney(line.price)}</p>

                    {outOfStock ? (
                      <p className="error-text">
                        This product is currently out of stock.
                      </p>
                    ) : exceedsStock ? (
                      <p className="error-text">
                        Only {line.stock} item
                        {line.stock === 1 ? '' : 's'} available.
                      </p>
                    ) : null}

                    <div className="line-actions">
                      <QuantityStepper
                        value={Math.min(line.quantity, Math.max(line.stock, 1))}
                        max={Math.max(line.stock, 1)}
                        onChange={(quantity) =>
                          setQuantity(line.productId, quantity)
                        }
                        label={line.title}
                      />

                      <button
                        type="button"
                        className="text-button"
                        onClick={() => removeItem(line.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="line-total">
                    {formatMoney(line.price * line.quantity)}
                  </p>
                </li>
              )
            })}
          </ul>

          <aside className="summary" aria-label="Cart total">
            <h2>Total</h2>

            <dl className="totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatMoney(rounded)}</dd>
              </div>

              <div>
                <dt>Delivery</dt>
                <dd>
                  {shipping === 0 ? 'Free' : formatMoney(shipping)}
                </dd>
              </div>

              <div className="totals-grand">
                <dt>Total</dt>
                <dd>{formatMoney(total)}</dd>
              </div>
            </dl>

            <p className="summary-note">
              Standard delivery. You can switch to express at checkout.
            </p>

            {hasInvalidStock ? (
              <p className="error-text">
                Please update your cart because one or more products have
                insufficient stock.
              </p>
            ) : (
              <Link
                className="button-primary summary-action"
                to="/checkout"
              >
                Checkout
              </Link>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}