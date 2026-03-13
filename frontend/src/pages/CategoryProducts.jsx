import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProductsTable from '../components/ProductsTable'
import { categoriesService, getErrorMessage } from '../services/api'

export default function CategoryProducts() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [spinning, setSpinning] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [catRes, prodRes] = await Promise.all([
        categoriesService.getById(id),
        categoriesService.getProducts(id)
      ])
      setCategory(catRes.data)
      setProducts(prodRes.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load category products.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRefresh = async () => {
    setSpinning(true)
    await fetchData()
    setTimeout(() => setSpinning(false), 400)
  }

  const filtered = search.trim()
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <Layout 
      title={category ? `Category: ${category.name}` : 'Category Products'} 
      subtitle={category?.description || 'View products in this category'}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <button 
          onClick={() => navigate('/categories')}
          className="btn-secondary px-3 py-1.5 h-auto text-[11px]"
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="h-4 w-[1px] bg-white/10 mx-1" />

        {/* Search */}
        <div className="relative flex-1 max-w-[260px]">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search in category…"
            className="input-field pl-8 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              style={{ background: 'var(--color-nav-hover-bg)' }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Count */}
        {!loading && (
          <span className="text-[11px] text-text-muted font-mono px-2.5 py-1 rounded-md select-none"
            style={{ background: 'var(--color-badge-bg)', border: '1px solid var(--color-border)' }}>
            {filtered.length}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleRefresh} disabled={loading} className="btn-secondary" title="Refresh">
            <svg
              width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              style={{ transition: 'transform 0.5s', transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)' }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>

          <button className="btn-primary" onClick={() => navigate('/create-product')}>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      <ProductsTable products={filtered} loading={loading} onRefresh={fetchData} />
    </Layout>
  )
}
