import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerRequest } from '../api/auth.ts'
import { useAuth } from '../context/AuthContext.tsx'
import { usePageTitle } from '../lib/usePageTitle.ts'

export function RegisterPage() {
  usePageTitle('Create Account · Marlow')

  const navigate = useNavigate()
  const { login } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (loading) return

    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedName) {
      setError('Name is required.')
      return
    }

    if (!normalizedEmail) {
      setError('Email is required.')
      return
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    setError('')
    setLoading(true)

    const controller = new AbortController()

    try {
      const result = await registerRequest(
        normalizedName,
        normalizedEmail,
        password,
        controller.signal,
      )

      login(result.token, result.user)

      navigate('/', { replace: true })
    } catch (caught) {
      if (controller.signal.aborted) return

      setError(
        caught instanceof Error
          ? caught.message
          : 'Registration failed.',
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
        <h1>Create account</h1>

        {error ? (
          <p
            className="form-alert"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              autoComplete="name"
              required
              onChange={(event) =>
                setName(event.target.value)
              }
            />
          </div>

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
              minLength={6}
              value={password}
              autoComplete="new-password"
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
              ? 'Creating...'
              : 'Create account'}
          </button>
        </form>

        <p>
          Already have an account?{' '}
          <Link to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}