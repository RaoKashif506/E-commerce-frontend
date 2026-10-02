import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  addProduct,
  deleteProduct,
  getDashboard,
  getOrders,
  getProducts,
  getUsers,
  updateOrderStatus,
  updateProduct,
} from '../api/admin.ts'
import { fetchCategories } from '../api/products.ts'
import type { Category } from '../types.ts'
import { useAuth } from '../context/AuthContext.tsx'
import { usePageTitle } from '../lib/usePageTitle.ts'

type Product = {
  _id: string
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  stock: number
  brand: string
  thumbnail: string
}

type Order = {
  _id: string
  status: string
  total: number
  createdAt: string
  customer: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
  }
  user?: {
    name: string
    email: string
  }
}

export function AdminPage() {
  usePageTitle('Admin Dashboard · Marlow')

  const { user, token } = useAuth()

  const [dashboard, setDashboard] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'products' | 'orders'
  >('dashboard')

  const [categoryFilter, setCategoryFilter] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    discountPercentage: '',
    stock: '',
    brand: '',
    thumbnail: '',
  })

  useEffect(() => {
    if (!token || user?.role !== 'admin') return

    void loadData()
  }, [token, user])

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  async function loadData() {
    if (!token) return

    try {
      setError('')

      const [
        dashboardData,
        usersData,
        productsData,
        ordersData,
      ] = await Promise.all([
        getDashboard(token),
        getUsers(token),
        getProducts(token),
        getOrders(token),
      ])

      setDashboard(dashboardData)
      setUsers(usersData.users)
      setProducts(productsData.products)
      setOrders(ordersData.orders)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not load admin data.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  function updateField(
    key: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function resetForm() {
    setEditingId(null)

    setForm({
      title: '',
      description: '',
      category: '',
      price: '',
      discountPercentage: '',
      stock: '',
      brand: '',
      thumbnail: '',
    })
  }

  function editProduct(product: Product) {
    setEditingId(product._id)

    setForm({
      title: product.title,
      description: product.description,
      category: product.category,
      price: String(product.price),
      discountPercentage: String(
        product.discountPercentage,
      ),
      stock: String(product.stock),
      brand: product.brand || '',
      thumbnail: product.thumbnail || '',
    })

    setActiveTab('products')
  }

  function categoryOptions() {
    const values = new Map(
      categories.map((category) => [
        category.slug,
        category.name,
      ]),
    )

    products.forEach((product) => {
      if (
        product.category &&
        !values.has(product.category)
      ) {
        values.set(
          product.category,
          product.category,
        )
      }
    })

    if (
      form.category &&
      !values.has(form.category)
    ) {
      values.set(
        form.category,
        form.category,
      )
    }

    return Array.from(
      values,
      ([value, label]) => ({
        value,
        label,
      }),
    )
  }

  const visibleProducts = categoryFilter
    ? products.filter(
        (product) =>
          product.category === categoryFilter,
      )
    : products

  function imagePreviewUrl() {
    const image = form.thumbnail.trim()

    if (!image) return ''

    if (
      /^(https?:\/\/|data:image\/|blob:)/i.test(
        image,
      )
    ) {
      return image
    }

    if (image.startsWith('//')) {
      return `https:${image}`
    }

    if (image.startsWith('www.')) {
      return `https://${image}`
    }

    return image
  }

  async function saveProduct(
    event: React.FormEvent,
  ) {
    event.preventDefault()

    if (!token) return

    setError('')

    const price = Number(form.price)
    const discountPercentage = Number(
      form.discountPercentage,
    ) || 0
    const stock = Number(form.stock)

    if (!form.title.trim()) {
      setError('Product title is required.')
      return
    }

    if (!form.category.trim()) {
      setError('Product category is required.')
      return
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError('Price must be 0 or greater.')
      return
    }

    if (
      !Number.isFinite(discountPercentage) ||
      discountPercentage < 0
    ) {
      setError(
        'Discount percentage must be 0 or greater.',
      )
      return
    }

    if (
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      setError('Stock must be 0 or greater.')
      return
    }

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        category: form.category,
        price,
        discountPercentage,
        stock,
        brand: form.brand,
        thumbnail: form.thumbnail,
      }

      if (editingId) {
        await updateProduct(
          token,
          editingId,
          payload,
        )
      } else {
        await addProduct(token, payload)
      }

      resetForm()
      await loadData()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not save product.',
      )
    }
  }

  async function removeProduct(id: string) {
    if (!token) return

    const confirmed = window.confirm(
      'Delete this product?',
    )

    if (!confirmed) return

    try {
      setError('')

      await deleteProduct(token, id)
      await loadData()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not delete product.',
      )
    }
  }

  async function changeOrderStatus(
    id: string,
    status: string,
  ) {
    if (!token) return

    try {
      setError('')

      await updateOrderStatus(
        token,
        id,
        status,
      )

      await loadData()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not update order.',
      )
    }
  }

  return (
    <div className="wrap page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>
      </div>

      {error ? (
        <p
          className="form-alert"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <p aria-live="polite">
          Loading admin data...
        </p>
      ) : null}

      <nav className="admin-tabs">
        {(
          [
            ['dashboard', 'Dashboard'],
            ['users', 'Users'],
            ['products', 'Products'],
            ['orders', 'Orders'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={
              activeTab === key
                ? 'button-primary'
                : 'button-secondary'
            }
            onClick={() =>
              setActiveTab(key)
            }
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'dashboard' ? (
        <section className="admin-grid">
          <div className="summary">
            <h2>Users</h2>
            <strong>
              {dashboard?.users ?? 0}
            </strong>
          </div>

          <div className="summary">
            <h2>Products</h2>
            <strong>
              {dashboard?.products ?? 0}
            </strong>
          </div>

          <div className="summary">
            <h2>Orders</h2>
            <strong>
              {dashboard?.orders ?? 0}
            </strong>
          </div>

          <div className="summary">
            <h2>Pending Orders</h2>
            <strong>
              {dashboard?.pendingOrders ?? 0}
            </strong>
          </div>

          <div className="summary">
            <h2>Total Revenue</h2>
            <strong>
              $
              {Number(
                dashboard?.revenue || 0,
              ).toFixed(2)}
            </strong>
          </div>
        </section>
      ) : null}

      {activeTab === 'users' ? (
        <section className="section">
          <h2>Users</h2>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>
                {users.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.role}</td>
                    <td>
                      {new Date(
                        item.createdAt,
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeTab === 'products' ? (
        <section className="section">
          <h2>
            {editingId
              ? 'Update Product'
              : 'Add Product'}
          </h2>

          <form
            className="admin-form"
            onSubmit={saveProduct}
          >
            {(
              [
                ['title', 'Title'],
                ['description', 'Description'],
                ['price', 'Price'],
                [
                  'discountPercentage',
                  'Discount %',
                ],
                ['stock', 'Stock'],
                ['brand', 'Brand'],
                ['thumbnail', 'Image URL'],
              ] as const
            ).map(([key, label]) => (
              <div
                className="field"
                key={key}
              >
                <label htmlFor={key}>
                  {label}
                </label>

                <input
                  id={key}
                  value={form[key]}
                  onChange={(event) =>
                    updateField(
                      key,
                      event.target.value,
                    )
                  }
                  required={
                    key !== 'brand'
                  }
                  min={
                    [
                      'price',
                      'discountPercentage',
                      'stock',
                    ].includes(key)
                      ? '0'
                      : undefined
                  }
                  step={
                    [
                      'price',
                      'discountPercentage',
                    ].includes(key)
                      ? '0.01'
                      : undefined
                  }
                  type={
                    [
                      'price',
                      'discountPercentage',
                      'stock',
                    ].includes(key)
                      ? 'number'
                      : key === 'thumbnail'
                        ? 'url'
                        : 'text'
                  }
                />
              </div>
            ))}

            <div className="field">
              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                value={form.category}
                onChange={(event) =>
                  updateField(
                    'category',
                    event.target.value,
                  )
                }
                required
              >
                <option value="">
                  Select a category
                </option>

                {categoryOptions().map(
                  (category) => (
                    <option
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            {imagePreviewUrl() ? (
              <div className="field">
                <span>Image preview</span>

                <img
                  src={imagePreviewUrl()}
                  alt="New product preview"
                  style={{
                    width: '8rem',
                    height: '8rem',
                    objectFit: 'cover',
                  }}
                  onError={(event) => {
                    event.currentTarget.style.display =
                      'none'
                  }}
                />
              </div>
            ) : null}

            <div className="actions">
              <button
                type="submit"
                className="button-primary"
              >
                {editingId
                  ? 'Update Product'
                  : 'Add Product'}
              </button>

              {editingId ? (
                <button
                  type="button"
                  className="button-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          <h2 className="section">
            Product List
          </h2>

          <div
            className="admin-tabs"
            aria-label="Product categories"
          >
            <button
              type="button"
              className={
                categoryFilter === ''
                  ? 'button-primary'
                  : 'button-secondary'
              }
              onClick={() =>
                setCategoryFilter('')
              }
            >
              All categories
            </button>

            {categoryOptions().map(
              (category) => (
                <button
                  key={category.value}
                  type="button"
                  className={
                    categoryFilter ===
                    category.value
                      ? 'button-primary'
                      : 'button-secondary'
                  }
                  onClick={() =>
                    setCategoryFilter(
                      category.value,
                    )
                  }
                >
                  {category.label}
                </button>
              ),
            )}
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(
                  (product) => (
                    <tr
                      key={product._id}
                    >
                      <td>
                        {product.title}
                      </td>

                      <td>
                        {product.category}
                      </td>

                      <td>
                        ${product.price}
                      </td>

                      <td>
                        {product.stock}
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            className="button-secondary"
                            onClick={() =>
                              editProduct(
                                product,
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              removeProduct(
                                product._id,
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeTab === 'orders' ? (
        <section className="section">
          <h2>Orders</h2>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                  >
                    <td>
                      #
                      {order._id.slice(
                        -8,
                      )}
                    </td>

                    <td>
                      <strong>
                        {
                          order.customer
                            .fullName
                        }
                      </strong>

                      <br />

                      {
                        order.customer
                          .email
                      }
                    </td>

                    <td>
                      $
                      {Number(
                        order.total,
                      ).toFixed(2)}
                    </td>

                    <td>
                      {new Date(
                        order.createdAt,
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      <select
                        value={
                          order.status
                        }
                        onChange={(
                          event,
                        ) =>
                          changeOrderStatus(
                            order._id,
                            event.target
                              .value,
                          )
                        }
                      >
                        <option>
                          Pending
                        </option>
                        <option>
                          Confirmed
                        </option>
                        <option>
                          Processing
                        </option>
                        <option>
                          Shipped
                        </option>
                        <option>
                          Delivered
                        </option>
                        <option>
                          Cancelled
                        </option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}