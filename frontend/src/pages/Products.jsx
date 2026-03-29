import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProductsTable from '../components/ProductsTable'
import { productsService } from '../services/api'
import { useFetch, useDebounce } from '../hooks/useFetch'

export default function Products() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [spinning, setSpinning] = useState(false)

  const { data: products, loading, error, refetch } = useFetch(productsService.getAll)

  const handleRefresh = async () => {
    setSpinning(true)
    await refetch()
    setTimeout(() => setSpinning(false), 400)
  }

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return products
    const s = debouncedSearch.toLowerCase()
    return products.filter(p => p.name.toLowerCase().includes(s))
  }, [products, debouncedSearch])

  return (
    <Layout title="Produtos" subtitle="Gerencie seu inventário">

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
            placeholder="Buscar produtos…"
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
          {/* Refresh */}
          <button onClick={handleRefresh} disabled={loading} className="btn-secondary" title="Atualizar">
            <svg
              width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              style={{ transition: 'transform 0.5s', transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)' }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Atualizar
          </button>

          {/* Add */}
          <button className="btn-primary" onClick={() => navigate('/create-product')}>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo Produto
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
          <button onClick={refetch} className="ml-auto text-[11px] underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity">
            Tentar novamente
          </button>
        </div>
      )}

      {/* ── No search results ── */}
      {!loading && search && filtered.length === 0 && products.length > 0 && (
        <div className="card py-12 flex flex-col items-center text-center mb-4 animate-fade-in">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--color-text-muted)" strokeWidth={1.5} className="mb-3">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p className="text-[13px] font-medium text-text-secondary">Nenhum resultado para "{search}"</p>
          <p className="text-[11px] text-text-muted mt-1 mb-4">Tente um termo de busca diferente</p>
          <button className="btn-secondary text-[12px]" onClick={() => setSearch('')}>Limpar busca</button>
        </div>
      )}

      {/* ── Table ── */}
      {(filtered.length > 0 || loading || !search) && (
        <ProductsTable 
          products={filtered} 
          loading={loading} 
          onRefresh={refetch} 
          onAdd={() => navigate('/create-product')}
        />
      )}
    </Layout>
  )
}
