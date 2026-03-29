import { useState, useEffect, useCallback } from 'react'
import { getErrorMessage } from '../services/api'

/**
 * Custom hook to abstract the standard UI data fetching pattern.
 * @param {Function} apiCall - A function that returns a Promise (e.g. from api.js)
 * @param {Array} dependencies - useEffect dependencies to re-trigger the fetch
 * @param {any} initialData - Default state data (typically [] or null)
 */
export function useFetch(apiCall, dependencies = [], initialData = []) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const executeFetch = useCallback(async (...args) => {
    setLoading(true)
    setError('')
    try {
      const response = await apiCall(...args)
      // Attempt to extract array if the response is nested (common in REST APIs)
      const resData = response.data
      setData(Array.isArray(resData) ? resData : resData?.products ?? resData?.data ?? resData)
      return { data: resData, error: null }
    } catch (err) {
      const errMsg = getErrorMessage(err, 'Failed to fetch data.')
      setError(errMsg)
      return { data: null, error: errMsg }
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  useEffect(() => {
    let isMounted = true
    
    // Create wrapped call to respect mount status
    const doFetch = async () => {
      setLoading(true)
      try {
        const response = await apiCall()
        if (isMounted) {
          const resData = response.data
          setData(Array.isArray(resData) ? resData : resData?.products ?? resData?.data ?? resData)
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, 'Failed to fetch data.'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    doFetch()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  // Returns data, loading state, error, and manual refresh function
  return { data, setData, loading, error, refetch: executeFetch }
}

/**
 * Custom hook to debounce rapidly changing values (like search inputs).
 * @param {any} value - The value to debounce
 * @param {number} delay - Debounce delay in ms (default 300)
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
