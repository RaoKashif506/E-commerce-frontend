const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

export type AuthResponse = {
  token: string
  user: AuthUser
}

async function request(
  endpoint: string,
  options: RequestInit = {},
) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    },
  )

  const data = await response
    .json()
    .catch(() => null)

  if (!response.ok) {
    throw new Error(
      data?.message || 'Request failed.',
    )
  }

  return data
}

export async function register(
  name: string,
  email: string,
  password: string,
  signal?: AbortSignal,
): Promise<AuthResponse> {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
    }),
    signal,
  })
}

export async function login(
  email: string,
  password: string,
  signal?: AbortSignal,
): Promise<AuthResponse> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
    signal,
  })
}