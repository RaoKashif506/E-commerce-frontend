import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { useCart } from '../context/useCart.ts'

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'is-active' : undefined
}

export function Header() {
  const { count } = useCart()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [menu, setMenu] = useState({ pathname, open: false })

  if (menu.pathname !== pathname) {
    setMenu({ pathname, open: false })
  }

  const cartLabel = count === 1 ? 'Cart, 1 item' : `Cart, ${count} items`

  return (
    <header className="site-header">
      <div className="wrap header-bar">
        <Link to="/" className="logo" aria-label="Marlow home">
          <span className="logo-mark" aria-hidden="true">m</span>
          <span className="logo-word">marlow<span className="logo-period">.</span></span>
        </Link>
        <nav id="site-nav" className={menu.open ? 'site-nav is-open' : 'site-nav'} aria-label="Primary">
          <NavLink to="/products" className={navClass}>
            Shop
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
          {user?.role === 'admin' ? (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          ) : null}
        </nav>
        <div className="header-tools">
          {user ? (
            <button type="button" className="text-button" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="button-secondary">
              Login
            </Link>
          )}
          <Link to="/cart" className="cart-link" aria-label={cartLabel}>
            <svg className="cart-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3.5 4.5h2l2.1 10.1a1.7 1.7 0 0 0 1.7 1.4h8.2a1.7 1.7 0 0 0 1.7-1.4L21 8H7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="20" r="1.2" fill="currentColor" />
              <circle cx="18" cy="20" r="1.2" fill="currentColor" />
            </svg>
            <span className="cart-text">Bag</span>
            {count > 0 ? <span className="cart-count">{count}</span> : null}
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menu.open}
            aria-controls="site-nav"
            onClick={() => setMenu({ pathname, open: !menu.open })}
          >
            <span className={menu.open ? 'menu-glyph is-open' : 'menu-glyph'} aria-hidden="true"><i /><i /></span>
            <span className="menu-label">{menu.open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
