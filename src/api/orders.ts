const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getToken() {
  return localStorage.getItem('marlow.token')
}

function normalizeOrder(raw: any) {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  return {
    ...raw,
    id: raw.id || raw._id,
    items: Array.isArray(raw.items)
      ? raw.items.map((item: any) => ({
          ...item,
          productId:
            item.productId?._id ?? item.productId,
        }))
      : [],
    customer: {
      ...raw.customer,
      shippingMethod:
        raw.customer?.shippingMethod || 'standard',
    },
  }
}

export async function createOrder(
  items: Array<{
    productId: string
    quantity: number
  }>,
  customer: unknown,
  signal?: AbortSignal,
) {
  const token = getToken()

  if (!token) {
    throw new Error(
      'Please login before placing an order.',
    )
  }

  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items,
      customer,
    }),
    signal,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data?.message || 'Could not place order.',
    )
  }

  const order = normalizeOrder(data?.order)

  if (!order) {
    throw new Error(
      'The server returned an invalid order.',
    )
  }

  return order
}

export async function getOrder(
  id: string,
  signal?: AbortSignal,
) {
  const token = getToken()

  if (!token) {
    throw new Error('Please login first.')
  }

  const response = await fetch(
    `${API_URL}/orders/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    },
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data?.message || 'Could not load order.',
    )
  }

  const order = normalizeOrder(data?.order)

  if (!order) {
    throw new Error(
      'The server returned an invalid order.',
    )
  }

  return order
}