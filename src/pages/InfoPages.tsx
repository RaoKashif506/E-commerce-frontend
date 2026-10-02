import { Link } from 'react-router-dom'
import { EXPRESS_SHIPPING, formatMoney, FREE_SHIPPING_AT, STANDARD_SHIPPING } from '../lib/money.ts'
import { usePageTitle } from '../lib/usePageTitle.ts'

export function AboutPage() {
  usePageTitle('About · Marlow')
  return (
    <article className="wrap page prose">
      <h1>About</h1>
      <p>
        Marlow is a counter for everyday goods: beauty, kitchen tools, furniture, groceries, and the other things that
        end up in a house.
      </p>
      <p>
        Names, prices, and photos come from the{' '}
        <a href="https://dummyjson.com" rel="noreferrer">
          DummyJSON
        </a>{' '}
        catalog, so the shelves match that public list.
      </p>
      <p>
        When you place an order, Marlow saves it in this browser and shows a confirmation. You pay on delivery. No card
        is charged.
      </p>
    </article>
  )
}

const questions = [
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery arrives in 3–5 business days. Express delivery arrives in 1–2 business days. A product page also lists the ship time for that item.',
  },
  {
    q: 'When do I pay?',
    a: 'You pay on delivery. Placing an order does not charge a card.',
  },
  {
    q: 'Can I change an order?',
    a: 'Change quantities or remove items in the cart before you place the order. After that, write to us from the contact page.',
  },
  {
    q: 'What can I return?',
    a: 'Unused items can be returned within 30 days. Groceries are final sale.',
  },
]

export function QuestionsPage() {
  usePageTitle('Questions · Marlow')
  return (
    <article className="wrap page prose">
      <h1>Questions</h1>
      {questions.map((item) => (
        <details key={item.q} className="question">
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </article>
  )
}

export function ShippingPage() {
  usePageTitle('Shipping · Marlow')
  return (
    <article className="wrap page prose">
      <h1>Shipping</h1>
      <p>
        Standard delivery is {formatMoney(STANDARD_SHIPPING)} and arrives in 3–5 business days. It is free when the
        order reaches {formatMoney(FREE_SHIPPING_AT)}.
      </p>
      <p>
        Express delivery is {formatMoney(EXPRESS_SHIPPING)} and arrives in 1–2 business days. Choose it at checkout.
      </p>
      <p>You pay when the order arrives. The confirmation screen keeps the delivery address you entered.</p>
    </article>
  )
}

export function ReturnsPage() {
  usePageTitle('Returns · Marlow')
  return (
    <article className="wrap page prose">
      <h1>Returns</h1>
      <p>Unused items can come back within 30 days of delivery. Groceries are final sale.</p>
      <p>
        Write through the <Link to="/contact">contact page</Link> with your order number and what you want to return.
      </p>
    </article>
  )
}

export function PrivacyPage() {
  usePageTitle('Privacy · Marlow')
  return (
    <article className="wrap page prose">
      <h1>Privacy</h1>
      <p>Marlow does not create an account and does not take a card number.</p>
      <p>
        The cart, checkout draft, and placed orders are stored in this browser. A message sent from the contact page
        stays on this device and is not delivered to a server.
      </p>
      <p>Clearing this site’s data in the browser removes those records.</p>
    </article>
  )
}

export function TermsPage() {
  usePageTitle('Terms · Marlow')
  return (
    <article className="wrap page prose">
      <h1>Terms</h1>
      <p>
        Product names, prices, and photos are supplied by the public DummyJSON catalog. An order you place is a record
        kept in this browser, and payment is collected on delivery.
      </p>
      <p>Use the shop to browse and place an order. Delivery times and return rules are the ones published on those pages.</p>
    </article>
  )
}

export function NotFoundPage() {
  usePageTitle('Page not found · Marlow')
  return (
    <div className="wrap page prose">
      <h1>That page is not part of the store.</h1>
      <div className="actions">
        <Link className="button-primary" to="/">
          Home
        </Link>
        <Link className="button-secondary" to="/products">
          Shop
        </Link>
      </div>
    </div>
  )
}
