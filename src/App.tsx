import { Component } from 'react'
import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.tsx'
import { CartPage } from './pages/Cart.tsx'
import { CheckoutPage } from './pages/Checkout.tsx'
import { ConfirmationPage } from './pages/Confirmation.tsx'
import { ContactPage } from './pages/Contact.tsx'
import { HomePage } from './pages/Home.tsx'
import {
  AboutPage,
  NotFoundPage,
  PrivacyPage,
  QuestionsPage,
  ReturnsPage,
  ShippingPage,
  TermsPage,
} from './pages/InfoPages.tsx'
import { LoginPage } from './pages/Login.tsx'
import { ProductDetailPage } from './pages/ProductDetail.tsx'
import { ProductsPage } from './pages/Products.tsx'
import { RegisterPage } from './pages/Register.tsx'
import { AdminPage } from './pages/Admin.tsx'

type BoundaryProps = { children: ReactNode }
type BoundaryState = { failed: boolean }

class AppErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="wrap page">
          <h1>This page failed to load.</h1>
          <p>Reload to return to the counter.</p>
          <a className="button-primary" href="/">
            Reload Marlow
          </a>
        </main>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:productId" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order/:orderId" element={<ConfirmationPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="questions" element={<QuestionsPage />} />
          <Route path="shipping" element={<ShippingPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AppErrorBoundary>
  )
}
