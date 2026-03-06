import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const TOKEN_KEY = 'token'
const USER_KEY  = 'user'

/**
 * useAuth — central hook for authentication state.
 *
 * Provides:
 *   getToken()      → string | null
 *   getUser()       → object | null
 *   saveSession()   → persists token + user after login
 *   logout()        → clears storage and redirects
 *   isAuthenticated → boolean
 */
export function useAuth() {
  const navigate = useNavigate()

  const getToken = useCallback(() => {
    return localStorage.getItem(TOKEN_KEY)
  }, [])

  const getUser = useCallback(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  const saveSession = useCallback((token, user = null) => {
    localStorage.setItem(TOKEN_KEY, token)
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    navigate('/login', { replace: true })
  }, [navigate])

  const isAuthenticated = Boolean(getToken())

  return {
    getToken,
    getUser,
    saveSession,
    logout,
    isAuthenticated,
  }
}
