import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProductList, isAbort } from '../api/products.ts'
import { useCategories } from '../api/useCategories.ts'
import { ProductCard } from '../components/ProductCard.tsx'
import { Price } from '../components/Price.tsx'
import { ProductImage } from '../components/ProductImage.tsx'
import { usePageTitle } from '../lib/usePageTitle.ts'
import type { Product } from '../types.ts'

export function HomePage() {
  usePageTitle('Marlow')
  const categories = useCategories()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{
    attempt: number
    status: 'ready' | 'error'
    products: Product[]
    error: string
  } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchProductList({ limit: 8, skip: 0, sortBy: 'rating', order: 'desc' }, controller.signal)
      .then((list) => {
        if (controller.signal.aborted) return
        setResult({ attempt, status: 'ready', products: list.products, error: '' })
      })
      .catch((caught: unknown) => {
        if (isAbort(caught) || controller.signal.aborted) return
        setResult({
          attempt,
          status: 'error',
          products: [],
          error: caught instanceof Error ? caught.message : 'Could not load products.',
        })
      })
    return () => controller.abort()
  }, [attempt])

  const current = result?.attempt === attempt ? result : null
  const status = current?.status ?? 'loading'
  const products = current?.products ?? []
  const error = current?.error ?? ''
  const spotlight = products[0]

  return (
    <div className="wrap page home-page">
      <section className="hero home-hero">
        <div className="hero-copy">
          <p className="home-kicker">THE EVERYDAY EDIT · 2026</p>
          <h1>Good things for the way you live.</h1>
          <p className="hero-lede">
            A considered collection of useful, beautiful pieces for every room, delivered without the fuss.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" to="/products">
              Explore the collection
            </Link>
            <Link className="hero-text-link" to="/about">
              Our point of view <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="hero-facts" aria-label="Store benefits">
            <span><strong>24</strong> departments</span>
            <span><strong>Free</strong> shipping over $75</span>
          </div>
        </div>
        <div className="hero-slot">
          {spotlight ? (
            <Link className="hero-photo" to={`/products/${spotlight.id}`}>
              <ProductImage src={spotlight.thumbnail} alt="" loading="eager" />
              <span className="hero-caption">
                <span className="hero-title">{spotlight.title}</span>
                <Price price={spotlight.price} discountPercentage={spotlight.discountPercentage} />
              </span>
            </Link>
          ) : (
            <p className="hero-pending">{status === 'error' ? error : 'Loading the collection.'}</p>
          )}
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="section home-departments">
          <div className="section-heading">
            <div>
              <p className="section-kicker">SHOP BY MOOD</p>
              <h2>Find your next favourite.</h2>
            </div>
            <Link className="text-link" to="/products">
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <nav className="departments" aria-label="Departments">
            {categories.map((category) => (
              <Link key={category.slug} to={`/products?category=${encodeURIComponent(category.slug)}`}>
                <ProductImage src={category.image} alt="" />
                <span>{category.name}</span>
              </Link>
            ))}
          </nav>
        </section>
      ) : null}

      <section className="section home-products">
        <div className="section-heading">
          <div>
            <p className="section-kicker">FRESH FROM THE EDIT</p>
            <h2>On the counter.</h2>
          </div>
          <Link className="text-link" to="/products">
            Shop everything <span aria-hidden="true">→</span>
          </Link>
        </div>
        {status === 'loading' ? <p aria-live="polite">Loading products.</p> : null}
        {status === 'error' ? (
          <div className="status-block">
            <p>{error}</p>
            <button type="button" className="button-secondary" onClick={() => setAttempt((value) => value + 1)}>
              Try again
            </button>
          </div>
        ) : null}
        {status === 'ready' && products.length === 0 ? <p>Nothing is on the counter right now.</p> : null}
        {status === 'ready' && products.length > 0 ? (
          <ul className="catalog">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}
