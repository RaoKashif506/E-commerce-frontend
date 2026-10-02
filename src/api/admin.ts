const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(endpoint: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed.')
  }

  return data
}

export function getDashboard(token: string) {
  return request('/admin/dashboard', token)
}

export function getUsers(token: string) {
  return request('/admin/users', token)
}

export function getProducts(token: string) {
  return request('/admin/products', token)
}

export function addProduct(token: string, product: unknown) {
  return request('/admin/products', token, {
    method: 'POST',
    body: JSON.stringify(product),
  })
}

export function updateProduct(token: string, id: string, product: unknown) {
  return request(`/admin/products/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(product),
  })
}

export function deleteProduct(token: string, id: string) {
  return request(`/admin/products/${id}`, token, {
    method: 'DELETE',
  })
}

export function getOrders(token: string) {
  return request('/admin/orders', token)
}

export function updateOrderStatus(token: string, id: string, status: string) {
  return request(`/admin/orders/${id}/status`, token, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}
