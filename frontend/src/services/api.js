import axios from 'axios'

// ─── Configure base URL ────────────────────────────────────────────────────
// Change this to match your backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ──────────────────────────────────────────────────
// Automatically attach JWT token to every outgoing request
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
// Handle 401 globally — clear token and redirect to login
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
    // OAuth2PasswordRequestForm expects x-www-form-urlencoded
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
  getAll:  ()           => api.get('/products'),
  getById: (id)         => api.get(`/products/${id}`),
  create:  (data)       => api.post('/products', data),
  update:  (id, data)   => api.put(`/products/${id}`, data),
  delete:  (id)         => api.delete(`/products/${id}`),
}

/**
 * Safely extracts a string error message from an API error response.
 * Handles FastAPI/Pydantic validation errors (422) which return 'detail' as an array of objects.
 */
export const getErrorMessage = (err, defaultMsg = 'Something went wrong.') => {
  if (!err) return defaultMsg
  
  const data = err.response?.data
  if (!data) return err.message || defaultMsg

  // 1. Check for 'message' field
  if (typeof data.message === 'string') return data.message

  // 2. Check for 'detail' field
  if (data.detail) {
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      // For Pydantic errors, return the first one's message
      const firstError = data.detail[0]
      if (typeof firstError === 'string') return firstError
      if (firstError.msg) return firstError.msg
    }
  }

  return defaultMsg
}

export default api
