import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Shop', to: '/products' },
      { label: 'Cart', to: '/cart' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Questions', to: '/questions' },
      { label: 'Shipping', to: '/shipping' },
      { label: 'Returns', to: '/returns' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <p className="logo footer-mark">Marlow</p>
          <p>Everyday goods, sold from the counter.</p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2>{column.title}</h2>
            <ul>
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="wrap footer-note">
        <p>© {new Date().getFullYear()} Marlow</p>
      </div>
    </footer>
  )
}
