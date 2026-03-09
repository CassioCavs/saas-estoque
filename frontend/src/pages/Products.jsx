import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProductsTable from '../components/ProductsTable'
import { productsService, getErrorMessage } from '../services/api'

export default function Products() {
  const navigate = useNavigate()
  const [products, setProducts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')
  const [spinning, setSpinning] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await productsService.getAll()
      setProducts(Array.isArray(data) ? data : data.products ?? data.data ?? [])
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load products.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleRefresh = async () => {
    setSpinning(true)
    await fetchProducts()
    setTimeout(() => setSpinning(false), 400)
  }

  const filtered = search.trim()
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <Layout title="Products" subtitle="Manage your inventory">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2.5 mb-5">

        {/* Search */}
        <div className="relative flex-1 max-w-[260px]">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input-field pl-8 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              style={{ background: 'rgba(255,255,255,0.07)' }}
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
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {filtered.length}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Refresh */}
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

          {/* Add */}
          <button className="btn-primary" onClick={() => navigate('/create-product')}>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-[10px] mb-4 text-[12px] text-danger animate-fade-in"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)' }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button onClick={fetchProducts} className="ml-auto text-[11px] underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity">
            Retry
          </button>
        </div>
      )}

      {/* ── No search results ── */}
      {!loading && search && filtered.length === 0 && products.length > 0 && (
        <div className="card py-12 flex flex-col items-center text-center mb-4 animate-fade-in">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} className="mb-3">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p className="text-[13px] font-medium text-text-secondary">No results for "{search}"</p>
          <p className="text-[11px] text-text-muted mt-1 mb-4">Try a different search term</p>
          <button className="btn-secondary text-[12px]" onClick={() => setSearch('')}>Clear search</button>
        </div>
      )}

      {/* ── Table ── */}
      {(filtered.length > 0 || loading || !search) && (
        <ProductsTable 
          products={filtered} 
          loading={loading} 
          onRefresh={fetchProducts} 
          onAdd={() => navigate('/create-product')}
        />
      )}
    </Layout>
  )
}
