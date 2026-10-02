import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart.ts'
import type { Product } from '../types.ts'
import { Price } from './Price.tsx'
import { ProductImage } from './ProductImage.tsx'

export function ProductCard({ product }: { product: Product }) {
  const { items, addItem } = useCart()
  const inCart = items.find((line) => line.productId === product.id)
  const out = product.stock <= 0
  const atMax = inCart ? inCart.quantity >= product.stock : false
  const label = out ? 'Out of stock' : atMax ? 'In your cart' : 'Add to cart'

  return (
    <article className="product">
      <Link className="product-link" to={`/products/${product.id}`}>
        <div className="product-media">
          <ProductImage src={product.thumbnail} alt="" />
        </div>
        <div className="product-copy">
          {product.brand ? <p className="brand">{product.brand}</p> : null}
          <h3>{product.title}</h3>
          <Price price={product.price} discountPercentage={product.discountPercentage} />
        </div>
      </Link>
      <div className="product-actions">
        <button
          type="button"
          className="button-primary"
          disabled={out || atMax}
          onClick={() => addItem(product, 1)}
        >
          {label}
        </button>
      </div>
    </article>
  )
}
