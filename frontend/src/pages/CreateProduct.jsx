import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProductForm from '../components/ProductForm'
import { productsService, getErrorMessage } from '../services/api'

export default function CreateProduct() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (values) => {
    setLoading(true); setError('')
    try {
      await productsService.create(values)
      navigate('/products', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create product.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="New Product" subtitle="Add to inventory">
      <div className="max-w-xl">
        <Breadcrumb items={[{ label: 'Products', to: '/products' }, { label: 'New product' }]} navigate={navigate} />

        <div className="card overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[9px] flex items-center justify-center text-accent flex-shrink-0"
                style={{ background: 'rgba(109,106,254,0.1)', border: '1px solid rgba(109,106,254,0.2)' }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-text-primary tracking-[-0.015em]">Product details</h2>
                <p className="text-[11px] text-text-muted mt-px">Fill in the fields below to add a new product</p>
              </div>
            </div>
          </div>
          {/* Form */}
          <div className="px-6 py-5">
            <ProductForm mode="create" onSubmit={handleSubmit} loading={loading} error={error} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export function Breadcrumb({ items, navigate }) {
  return (
    <nav className="flex items-center gap-1.5 mb-5">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="var(--color-text-muted)" strokeWidth={2}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
          {item.to
            ? <button onClick={() => navigate(item.to)} className="text-[11px] text-text-muted hover:text-text-secondary transition-colors duration-120 tracking-[-0.005em]">{item.label}</button>
            : <span className="text-[11px] text-text-tertiary tracking-[-0.005em]">{item.label}</span>
          }
        </span>
      ))}
    </nav>
  )
}
