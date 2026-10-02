import { compareAtPrice, formatMoney } from '../lib/money.ts'

export function Price({ price, discountPercentage }: { price: number; discountPercentage: number }) {
  const compare = compareAtPrice(price, discountPercentage)

  return (
    <span className="price">
      <span className="price-now">
        <span className="visually-hidden">Price </span>
        {formatMoney(price)}
      </span>
      {compare ? (
        <s className="price-was">
          <span className="visually-hidden">Original price </span>
          {formatMoney(compare)}
        </s>
      ) : null}
    </span>
  )
}
