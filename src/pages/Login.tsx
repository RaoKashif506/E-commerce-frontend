import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginRequest } from '../api/auth.ts'
import { useAuth } from '../context/AuthContext.tsx'
import { usePageTitle } from '../lib/usePageTitle.ts'

export function LoginPage() {
  usePageTitle('Login · Marlow')

  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => {
      // Cleanup handled by request-level AbortController
    }
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (loading) return

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      setError('Email and password are required.')
      return
    }

    setError('')
    setLoading(true)

    const controller = new AbortController()

    try {
      const result = await loginRequest(
        normalizedEmail,
        password,
        controller.signal,
      )

      login(result.token, result.user)

      navigate(
        result.user.role === 'admin'
          ? '/admin'
          : '/',
        { replace: true },
      )
    } catch (caught) {
      if (controller.signal.aborted) return

      setError(
        caught instanceof Error
          ? caught.message
          : 'Login failed.',
      )
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="wrap page">
      <div className="contact-form">
        <h1>Login</h1>

        {error ? (
          <p
            className="form-alert"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="field">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div className="field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              autoComplete="current-password"
              required
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />
          </div>

          <button
            className="button-primary"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading
              ? 'Logging in...'
              : 'Login'}
          </button>
        </form>

        <p>
          Don't have an account?{' '}
          <Link to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}