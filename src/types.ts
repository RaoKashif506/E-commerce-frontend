export type Review = {
  rating: number
  comment: string
  date: string
  reviewerName: string
}

export type Product = {
  id: string
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand?: string
  thumbnail: string
  images: string[]
  warrantyInformation?: string
  shippingInformation?: string
  reviews: Review[]
}

export type Category = {
  slug: string
  name: string
  image: string
}

export type CartLine = {
  productId: string
  title: string
  price: number
  thumbnail: string
  quantity: number
  stock: number
}

export type ShippingMethod = 'standard' | 'express'

export type CustomerDetails = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  shippingMethod: ShippingMethod
}

export type Order = {
  id: string
  createdAt: string
  status: 'Placed'
  items: CartLine[]
  customer: CustomerDetails
  subtotal: number
  shipping: number
  total: number
}
