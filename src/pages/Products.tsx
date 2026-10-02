import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchProductList, isAbort } from '../api/products.ts'
import { useCategories } from '../api/useCategories.ts'
import { ProductCard } from '../components/ProductCard.tsx'
import { usePageTitle } from '../lib/usePageTitle.ts'
import type { Product } from '../types.ts'

const PAGE_SIZE = 24

function matchesQuery(product: Product, query: string) {
  const needle = query.toLowerCase()
  return (
    product.title.toLowerCase().includes(needle) ||
    (product.brand ?? '').toLowerCase().includes(needle) ||
    product.description.toLowerCase().includes(needle)
  )
}

export function ProductsPage() {
  usePageTitle('Shop · Marlow')
  const categories = useCategories()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const [draft, setDraft] = useState(query)
  const [written, setWritten] = useState(query)
  const skipRef = useRef(0)
  if (query !== written) {
    setWritten(query)
    setDraft(query)
  }
  const field = query !== written ? query : draft

  const [attempt, setAttempt] = useState(0)
  const requestKey = `${query}\n${category}\n${attempt}`
  const [result, setResult] = useState<{
    key: string
    status: 'ready' | 'error'
    products: Product[]
    total: number
    error: string
  } | null>(null)
  const [moreError, setMoreError] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = draft.trim()
      if (trimmed === written) return
      setWritten(trimmed)
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (trimmed) next.set('q', trimmed)
          else next.delete('q')
          return next
        },
        { replace: true },
      )
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [draft, written, setSearchParams])

  useEffect(() => {
    const controller = new AbortController()
    const key = requestKey

    const load = async () => {
      try {
        let list: { products: Product[]; total: number }
        if (query && category) {
          const all = await fetchProductList({ category, limit: 0, skip: 0 }, controller.signal)
          const filtered = all.products.filter((product) => matchesQuery(product, query))
          list = { products: filtered, total: filtered.length }
        } else if (query) {
          list = await fetchProductList({ q: query, limit: 0, skip: 0 }, controller.signal)
        } else if (category) {
          list = await fetchProductList({ category, limit: 0, skip: 0 }, controller.signal)
        } else {
          list = await fetchProductList({ limit: PAGE_SIZE, skip: 0 }, controller.signal)
        }
        if (controller.signal.aborted) return
        skipRef.current = 0
        setMoreError('')
        setResult({ key, status: 'ready', products: list.products, total: list.total, error: '' })
      } catch (caught) {
        if (isAbort(caught) || controller.signal.aborted) return
        setResult({
          key,
          status: 'error',
          products: [],
          total: 0,
          error: caught instanceof Error ? caught.message : 'Could not load products.',
        })
      }
    }

    void load()
    return () => controller.abort()
  }, [query, category, attempt, requestKey])

  const current = result?.key === requestKey ? result : null
  const status = current?.status ?? 'loading'
  const products = current?.products ?? []
  const total = current?.total ?? 0
  const error = current?.error ?? ''

  const categoryName =
    categories.find((item) => item.slug === category)?.name ?? (category ? category.replace(/-/g, ' ') : '')

  let heading = 'Shop'
  if (query && categoryName) heading = `${categoryName} matching "${query}"`
  else if (query) heading = `Results for "${query}"`
  else if (categoryName) heading = categoryName

  const canLoadMore = status === 'ready' && !query && !category && products.length < total

  function commitSearch(event: FormEvent) {
    event.preventDefault()
    const trimmed = draft.trim()
    setWritten(trimmed)
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (trimmed) next.set('q', trimmed)
      else next.delete('q')
      return next
    })
  }

  function onCategory(value: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set('category', value)
      else next.delete('category')
      return next
    })
  }

  function clearFilters() {
    setWritten('')
    setDraft('')
    setSearchParams({})
  }

  async function loadMore() {
    if (loadingMore || query || category) return
    setLoadingMore(true)
    setMoreError('')
    try {
      const skip = skipRef.current + PAGE_SIZE
      const result = await fetchProductList({ limit: PAGE_SIZE, skip })
      skipRef.current = skip
      setResult((existing) => {
        if (!existing || existing.key !== requestKey) return existing
        const seen = new Set(existing.products.map((product) => product.id))
        return {
          ...existing,
          total: result.total,
          products: [...existing.products, ...result.products.filter((product) => !seen.has(product.id))],
        }
      })
    } catch (caught) {
      if (!isAbort(caught)) {
        setMoreError(caught instanceof Error ? caught.message : 'Could not load more products.')
      }
    } finally {
      setLoadingMore(false)
    }
  }

  let statusMessage = ''
  if (status === 'loading') statusMessage = 'Loading products.'
  else if (status === 'error') statusMessage = error
  else if (products.length === 0) statusMessage = 'No products match.'
  else statusMessage = `Showing ${products.length} of ${total} products.`

  return (
    <div className="wrap page">
      <header className="page-head">
        <h1>{heading}</h1>
      </header>
      <form className="toolbar" onSubmit={commitSearch}>
        <div className="field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            value={field}
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(event) => onCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="button-primary">
          Search
        </button>
        {query || category ? (
          <button type="button" className="button-secondary" onClick={clearFilters}>
            Clear
          </button>
        ) : null}
      </form>

      <p className="status-line" aria-live="polite">
        {statusMessage}
      </p>

      {status === 'error' ? (
        <button type="button" className="button-secondary" onClick={() => setAttempt((value) => value + 1)}>
          Try again
        </button>
      ) : null}

      {status === 'ready' && products.length === 0 ? (
        <div className="status-block">
          <p>Nothing in the shop matches that search.</p>
          <button type="button" className="button-secondary" onClick={clearFilters}>
            Clear search
          </button>
        </div>
      ) : null}

      {status === 'ready' && products.length > 0 ? (
        <ul className="catalog">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : null}

      {canLoadMore ? (
        <div className="more">
          <button type="button" className="button-secondary" onClick={() => void loadMore()} disabled={loadingMore}>
            {loadingMore ? 'Loading more' : 'Load more'}
          </button>
          {moreError ? <p className="field-error">{moreError}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
