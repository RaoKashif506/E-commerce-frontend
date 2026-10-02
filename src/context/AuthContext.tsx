import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'

import type { ReactNode } from 'react'
import type { AuthUser } from '../api/auth.ts'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext =
  createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'marlow.token'
const USER_KEY = 'marlow.user'

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.email ||
      !parsed.role
    ) {
      return null
    }

    return parsed as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [token, setToken] =
    useState<string | null>(getStoredToken)

  const [user, setUser] =
    useState<AuthUser | null>(getStoredUser)

  function login(
    newToken: string,
    newUser: AuthUser,
  ) {
    try {
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(newUser),
      )
    } catch {
      // Keep the in-memory session active even if
      // localStorage is unavailable.
    }

    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {
      // Ignore storage errors during logout.
    }

    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
    }),
    [user, token],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }

  return value
}