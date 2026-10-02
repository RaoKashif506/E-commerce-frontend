import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export function Layout() {
  return (
    <div className="site">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <ScrollToTop />
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
