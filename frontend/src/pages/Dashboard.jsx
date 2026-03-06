import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { productsService } from '../services/api'
import { useAuth } from '../hooks/useAuth'

/* ── Stat card ─────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, accent, icon, loading, delay = 0 }) {
  return (
    <div
      className="card p-5 group row-reveal cursor-default"
      style={{ animationDelay: `${delay}ms`, transition: 'transform 0.18s, box-shadow 0.18s' }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.1), 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div className="flex items-start justify-between mb-3.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-text-muted select-none">{label}</span>
        <div
          className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{ background: accent + '14', color: accent, border: `1px solid ${accent}28` }}
        >
          {icon}
        </div>
      </div>
      {loading
        ? <div className="skeleton h-6 w-20 mb-2" />
        : <p className="text-[22px] font-semibold text-text-primary tracking-[-0.03em] leading-none mb-1.5">{value}</p>
      }
      {loading
        ? <div className="skeleton h-2.5 w-24" />
        : <p className="text-[11px] text-text-muted leading-none">{sub}</p>
      }
    </div>
  )
}

/* ── Quick action ──────────────────────────────────────────────────── */
function QuickAction({ label, desc, onClick, icon, delay = 0 }) {
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left group row-reveal w-full"
      style={{
        animationDelay: `${delay}ms`,
        transition: 'transform 0.15s, box-shadow 0.15s, background 0.12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.45)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.background = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[9px] flex items-center justify-center text-accent flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{ background: 'rgba(109,106,254,0.1)', border: '1px solid rgba(109,106,254,0.2)' }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[13px] font-medium text-text-primary tracking-[-0.01em]">{label}</p>
          <p className="text-[11px] text-text-muted mt-0.5 truncate">{desc}</p>
        </div>
        <svg className="flex-shrink-0 text-text-muted opacity-0 group-hover:opacity-60 transition-all duration-150 group-hover:translate-x-0.5"
          width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}

/* ── Recent row ────────────────────────────────────────────────────── */
function RecentRow({ product, index, onClick }) {
  const s = Number(product.stock)
  const dotColor = s === 0 ? '#ef4444' : s <= 5 ? '#f59e0b' : '#22c55e'

  return (
    <div
      onClick={onClick}
      className="flex items-center px-4 py-3 cursor-pointer group row-reveal"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        animationDelay: `${index * 35}ms`,
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >
      <div className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center mr-3 flex-shrink-0"
        style={{ background: 'rgba(109,106,254,0.09)', border: '1px solid rgba(109,106,254,0.16)' }}>
        <span className="text-[9px] font-mono text-accent font-medium">{index + 1}</span>
      </div>

      <span className="flex-1 text-[13px] font-medium text-text-primary tracking-[-0.01em] truncate min-w-0">
        {product.name}
      </span>

      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
        <span className="text-[12px] font-mono text-text-muted tabular-nums">${Number(product.price).toFixed(2)}</span>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
      </div>

      <svg className="ml-2.5 flex-shrink-0 text-text-muted opacity-0 group-hover:opacity-50 transition-opacity duration-120 group-hover:translate-x-px"
        width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate()
  const { getUser } = useAuth()
  const user = getUser()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsService.getAll()
      .then(({ data }) => setProducts(Array.isArray(data) ? data : data.products ?? data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalValue = products.reduce((s, p) => s + Number(p.price) * Number(p.stock), 0)
  const outOfStock = products.filter(p => Number(p.stock) === 0).length
  const lowStock   = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length
  const avgPrice   = products.length ? products.reduce((s, p) => s + Number(p.price), 0) / products.length : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <Layout title="Dashboard" subtitle="Inventory overview">

      {/* ── Welcome ── */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h2 className="text-[17px] font-semibold text-text-primary tracking-[-0.025em] leading-snug">
            {greeting}, {firstName}
          </h2>
          <p className="text-[12px] text-text-tertiary mt-1">
            {loading ? 'Loading your inventory…' : `${products.length} products tracked · last synced just now`}
          </p>
        </div>
        <button className="btn-primary flex-shrink-0" onClick={() => navigate('/create-product')}>
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        <StatCard label="Total Products" value={products.length} sub="unique SKUs" accent="#6d6afe" loading={loading} delay={0}
          icon={<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
        />
        <StatCard label="Portfolio Value" value={`$${totalValue.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2})}`} sub="total worth" accent="#22c55e" loading={loading} delay={50}
          icon={<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <StatCard label="Needs Attention" value={outOfStock + lowStock} sub={`${outOfStock} out · ${lowStock} low`} accent="#f59e0b" loading={loading} delay={100}
          icon={<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        />
        <StatCard label="Avg. Price" value={`$${avgPrice.toFixed(2)}`} sub="per SKU" accent="#a78bfa" loading={loading} delay={150}
          icon={<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
      </div>

      {/* ── Actions + Recent ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Quick actions */}
        <div>
          <SectionLabel>Quick actions</SectionLabel>
          <div className="space-y-2">
            <QuickAction label="Add new product" desc="Create an inventory entry" onClick={() => navigate('/create-product')} delay={0}
              icon={<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
            />
            <QuickAction label="Browse inventory" desc={`${products.length} product${products.length !== 1 ? 's' : ''} in stock`} onClick={() => navigate('/products')} delay={60}
              icon={<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
            />
          </div>
        </div>

        {/* Recent products */}
        <div className="lg:col-span-2">
          <SectionLabel>Recent products</SectionLabel>
          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({length:4},(_,i)=>(
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton w-[22px] h-[22px] rounded-[6px] flex-shrink-0" />
                    <div className="skeleton h-2.5 flex-1" style={{ width:`${55+i*13}%` }} />
                    <div className="skeleton h-2.5 w-14" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center px-4">
                <span className="text-[12px] text-text-muted">No products to display</span>
              </div>
            ) : (
              <>
                {products.slice(0,6).map((p, i) => (
                  <RecentRow key={p.id} product={p} index={i} onClick={() => navigate(`/edit-product/${p.id}`)} />
                ))}
                {products.length > 6 && (
                  <button onClick={() => navigate('/products')}
                    className="w-full px-4 py-3 text-[11px] text-text-muted hover:text-accent transition-colors duration-120 flex items-center justify-center gap-1.5"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                    View all {products.length} products
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-2.5 select-none">
      {children}
    </p>
  )
}
