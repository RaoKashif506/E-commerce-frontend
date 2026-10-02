import type { Category, Product, Review } from '../types.ts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export type ProductQuery = {
  q?: string
  category?: string
  limit: number
  skip: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

type ProductList = {
  products: Product[]
  total: number
}

export function isAbort(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

function normalizeReview(value: unknown): Review | null {
  if (!value || typeof value !== 'object') return null
  const review = value as Partial<Review>
  if (typeof review.comment !== 'string' || typeof review.reviewerName !== 'string') return null
  return {
    rating: typeof review.rating === 'number' ? review.rating : 0,
    comment: review.comment,
    date: typeof review.date === 'string' ? review.date : '',
    reviewerName: review.reviewerName,
  }
}

function normalizeProduct(value: unknown): Product | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as {
    _id?: unknown
    id?: unknown
    title?: unknown
    description?: unknown
    category?: unknown
    price?: unknown
    discountPercentage?: unknown
    rating?: unknown
    stock?: unknown
    brand?: unknown
    thumbnail?: unknown
    images?: unknown
    warrantyInformation?: unknown
    shippingInformation?: unknown
    reviews?: unknown
  }

  const id = typeof raw.id === 'string' || typeof raw.id === 'number' ? String(raw.id) : typeof raw._id === 'string' ? raw._id : ''
  if (!id || typeof raw.title !== 'string') return null

  const images = Array.isArray(raw.images) ? raw.images.filter((image): image is string => typeof image === 'string') : []
  const thumbnail = typeof raw.thumbnail === 'string' ? raw.thumbnail : images[0] ?? ''

  return {
    id,
    title: raw.title,
    description: typeof raw.description === 'string' ? raw.description : '',
    category: typeof raw.category === 'string' ? raw.category : '',
    price: typeof raw.price === 'number' ? raw.price : 0,
    discountPercentage: typeof raw.discountPercentage === 'number' ? raw.discountPercentage : 0,
    rating: typeof raw.rating === 'number' ? raw.rating : 0,
    stock: typeof raw.stock === 'number' ? raw.stock : 0,
    brand: typeof raw.brand === 'string' ? raw.brand : undefined,
    thumbnail,
    images: images.length > 0 ? images : thumbnail ? [thumbnail] : [],
    warrantyInformation: typeof raw.warrantyInformation === 'string' ? raw.warrantyInformation : undefined,
    shippingInformation: typeof raw.shippingInformation === 'string' ? raw.shippingInformation : undefined,
    reviews: Array.isArray(raw.reviews)
      ? raw.reviews.map(normalizeReview).filter((review): review is Review => review !== null)
      : [],
  }
}

function normalizeCategory(value: unknown): Category | null {
  if (typeof value === 'string' && value.trim()) {
    return { slug: value, name: value, image: '' }
  }
  if (!value || typeof value !== 'object') return null
  const raw = value as { slug?: unknown; name?: unknown; image?: unknown }
  if (typeof raw.slug !== 'string' || typeof raw.name !== 'string') return null
  return { slug: raw.slug, name: raw.name, image: typeof raw.image === 'string' ? raw.image : '' }
}

async function request(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Could not load products.')
  }

  return data
}

export async function fetchProductList(query: ProductQuery, signal?: AbortSignal): Promise<ProductList> {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.category) params.set('category', query.category)
  params.set('limit', String(query.limit))
  params.set('skip', String(query.skip))

  const data = await request(`${API_URL}/products?${params.toString()}`, signal)
  if (!Array.isArray(data?.products) || typeof data.total !== 'number') {
    throw new Error('Could not load products.')
  }

  const products = data.products.map(normalizeProduct).filter((product: Product | null): product is Product => product !== null)

  return { products, total: data.total }
}

export async function fetchProduct(id: string, signal?: AbortSignal) {
  const data = await request(`${API_URL}/products/${id}`, signal)
  const product = normalizeProduct(data)
  if (!product) throw new Error('Could not load this product.')
  return product
}

export async function fetchCategories(signal?: AbortSignal) {
  const data = await request(`${API_URL}/products/categories`, signal)
  if (!Array.isArray(data)) throw new Error('Could not load categories.')
  return data.map(normalizeCategory).filter((category): category is Category => category !== null)
}
