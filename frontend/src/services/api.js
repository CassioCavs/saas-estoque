import axios from 'axios'

// ─── Configure base URL ────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ──────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth Endpoints ───────────────────────────────────────────────────────
export const authService = {
  login: (credentials) => {
    const params = new URLSearchParams()
    params.append('username', credentials.username)
    params.append('password', credentials.password)
    
    return api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },
  register: (data) => api.post('/auth/register', data),
}

// ─── Products Endpoints ──────────────────────────────────────────────────
export const productsService = {
  getAll:  (params)     => api.get('/products/', { params }),
  getById: (id)         => api.get(`/products/${id}`),
  create:  (data)       => api.post('/products/', data),
  update:  (id, data)   => api.put(`/products/${id}`, data),
  delete:  (id)         => api.delete(`/products/${id}`),
}

// ─── Categories Endpoints ────────────────────────────────────────────────
export const categoriesService = {
  getAll:      ()           => api.get('/categories/'),
  getById:     (id)         => api.get(`/categories/${id}`),
  getProducts: (id)         => api.get(`/categories/${id}/products`),
  create:      (data)       => api.post('/categories/', data),
  update:      (id, data)   => api.put(`/categories/${id}`, data),
  delete:      (id)         => api.delete(`/categories/${id}`),
}

// ─── Customers Endpoints ─────────────────────────────────────────────────
export const customersService = {
  getAll:  ()           => api.get('/customers/'),
  getById: (id)         => api.get(`/customers/${id}`),
  create:  (data)       => api.post('/customers/', data),
  update:  (id, data)   => api.put(`/customers/${id}`, data),
  delete:  (id)         => api.delete(`/customers/${id}`),
}

// ─── Sales Endpoints ─────────────────────────────────────────────────────
export const salesService = {
  getAll:  ()           => api.get('/sales/'),
  create:  (data)       => api.post('/sales/', data),
}

// ─── Reports Endpoints ───────────────────────────────────────────────────
export const reportsService = {
  getSales: (params)    => api.get('/reports/sales/', { params }),
  getStock: ()          => api.get('/reports/stock/'),
  getTopProducts: (limit = 10) => api.get('/reports/top-products/', { params: { limit } }),
}

// ─── Stock & History Endpoints ───────────────────────────────────────────
export const stockService = {
  getHistory: ()        => api.get('/history/'),
  createMovement: (data) => api.post('/stock/movement/', data),
}

export const alertsService = {
  getLowStock: ()       => api.get('/alerts/low-stock/'),
}

/**
 * Safely extracts a string error message from an API error response.
 */
export const getErrorMessage = (err, defaultMsg = 'Something went wrong.') => {
  if (!err) return defaultMsg
  
  const data = err.response?.data
  if (!data) return err.message || defaultMsg

  if (typeof data.message === 'string') return data.message

  if (data.detail) {
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      const firstError = data.detail[0]
      if (typeof firstError === 'string') return firstError
      if (firstError.msg) return firstError.msg
    }
  }

  return defaultMsg
}

export default api
