import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProduct, fetchProductList, isAbort } from '../api/products.ts'
import { Price } from '../components/Price.tsx'
import { ProductCard } from '../components/ProductCard.tsx'
import { ProductImage } from '../components/ProductImage.tsx'
import { QuantityStepper } from '../components/QuantityStepper.tsx'
import { useCart } from '../context/useCart.ts'
import { formatRating, stockLabel } from '../lib/money.ts'
import { usePageTitle } from '../lib/usePageTitle.ts'
import type { Product } from '../types.ts'

function InvalidProduct() {
  usePageTitle('Product · Marlow')
  return <MissingProduct message="This product is not on the counter." canRetry={false} onRetry={() => undefined} />
}

function MissingProduct({ message, canRetry, onRetry }: { message: string; canRetry: boolean; onRetry: () => void }) {
  return (
    <div className="status-block">
      <h1>This product is not on the counter.</h1>
      <p>{message}</p>
      <div className="actions">
        {canRetry ? (
          <button type="button" className="button-secondary" onClick={onRetry}>
            Try again
          </button>
        ) : null}
        <Link className="button-primary" to="/products">
          Back to the shop
        </Link>
      </div>
    </div>
  )
}

function ProductView({ id }: { id: string }) {
  const { items, addItem } = useCart()
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${id}:${attempt}`
  const [result, setResult] = useState<{ key: string; product: Product | null; error: string } | null>(null)
  const [frame, setFrame] = useState({ id, index: 0 })
  const [qty, setQty] = useState({ id, quantity: 1 })
  const [relatedState, setRelatedState] = useState<{ id: string; items: Product[] }>({ id: '', items: [] })

  const current = result?.key === requestKey ? result : null
  const product = current?.product ?? null
  const status = !current ? 'loading' : product ? 'ready' : 'error'
  const error = current?.error ?? ''

  usePageTitle(product ? `${product.title} · Marlow` : 'Product · Marlow')

  useEffect(() => {
    const controller = new AbortController()
    const key = requestKey
    fetchProduct(id, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return
        setResult({ key, product: next, error: '' })
      })
      .catch((caught: unknown) => {
        if (isAbort(caught) || controller.signal.aborted) return
        setResult({
          key,
          product: null,
          error: caught instanceof Error ? caught.message : 'Could not load this product.',
        })
      })
    return () => controller.abort()
  }, [id, requestKey])

  useEffect(() => {
    if (!product?.category) return
    const controller = new AbortController()
    const productId = product.id
    fetchProductList({ category: product.category, limit: 8, skip: 0 }, controller.signal)
      .then((list) => {
        if (controller.signal.aborted) return
        setRelatedState({
          id: productId,
          items: list.products.filter((item) => item.id !== productId).slice(0, 4),
        })
      })
      .catch((caught: unknown) => {
        if (!isAbort(caught)) setRelatedState({ id: productId, items: [] })
      })
    return () => controller.abort()
  }, [product])

  const inCart = product ? (items.find((line) => line.productId === product.id)?.quantity ?? 0) : 0
  const remaining = product ? Math.max(0, product.stock - inCart) : 0
  const photos = product ? product.images : []
  const imageIndex = frame.id === id ? frame.index : 0
  const photo = photos[imageIndex] ?? product?.thumbnail ?? ''
  const chosen = qty.id === id ? qty.quantity : 1
  const quantity = remaining > 0 ? Math.min(Math.max(1, chosen), remaining) : 1
  const related = product && relatedState.id === product.id ? relatedState.items : []

  return (
    <>
      {status === 'loading' ? <p aria-live="polite">Loading product.</p> : null}
      {status === 'error' ? (
        <MissingProduct message={error} canRetry onRetry={() => setAttempt((value) => value + 1)} />
      ) : null}
      {status === 'ready' && product ? (
        <>
          <article className="detail">
            <div>
              <div className="detail-photo">
                <ProductImage src={photo} alt={product.title} loading="eager" />
              </div>
              {photos.length > 1 ? (
                <div className="thumbs">
                  {photos.map((src, index) => (
                    <button
                      key={`${src}-${index}`}
                      type="button"
                      className={index === imageIndex ? 'is-selected' : undefined}
                      onClick={() => setFrame({ id, index })}
                      aria-label={`Show image ${index + 1} of ${product.title}`}
                    >
                      <ProductImage src={src} alt="" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="detail-copy">
              {product.brand ? <p className="brand">{product.brand}</p> : null}
              <h1>{product.title}</h1>
              <Price price={product.price} discountPercentage={product.discountPercentage} />
              <p>{formatRating(product.rating)}</p>
              <ul className="facts">
                <li>{stockLabel(product.stock)}</li>
                {product.shippingInformation ? <li>{product.shippingInformation}</li> : null}
                {product.warrantyInformation ? <li>{product.warrantyInformation}</li> : null}
              </ul>
              <p className="description">{product.description}</p>
              {inCart > 0 ? <p>{inCart} already in your cart.</p> : null}
              {remaining > 0 ? (
                <div className="buy-row">
                  <QuantityStepper
                    value={quantity}
                    max={remaining}
                    onChange={(next) => setQty({ id, quantity: next })}
                    label={product.title}
                  />
                  <button type="button" className="button-primary" onClick={() => addItem(product, quantity)}>
                    Add to cart
                  </button>
                </div>
              ) : (
                <p>{product.stock > 0 ? 'All available items are in your cart.' : 'Out of stock.'}</p>
              )}
              <p>
                <Link to="/cart">View cart</Link>
              </p>
            </div>
          </article>

          {product.reviews.length > 0 ? (
            <section className="section">
              <h2>Reviews</h2>
              <ul className="reviews">
                {product.reviews.slice(0, 3).map((review, index) => (
                  <li key={`${review.reviewerName}-${review.date}-${index}`}>
                    <p>{review.comment}</p>
                    <p className="review-by">
                      {review.reviewerName} rated this {review.rating} out of 5.
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {related.length > 0 ? (
            <section className="section">
              <h2>More in this department</h2>
              <ul className="catalog">
                {related.map((item) => (
                  <li key={item.id}>
                    <ProductCard product={item} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}
    </>
  )
}

export function ProductDetailPage() {
  const { productId } = useParams()
  const validId = typeof productId === 'string' && productId.trim().length > 0

  return <div className="wrap page">{validId ? <ProductView id={productId} /> : <InvalidProduct />}</div>
}
