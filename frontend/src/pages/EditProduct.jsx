import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import ProductForm from '../components/ProductForm'
import { productsService, getErrorMessage } from '../services/api'
import { Breadcrumb } from './CreateProduct'

export default function EditProduct() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [product, setProduct]           = useState(null)
  const [fetchError, setFetchError] = useState('')
  const [saveError, setSaveError]   = useState('')
  const [fetchLoading, setFetchLoading] = useState(true)
  const [saveLoading, setSaveLoading]   = useState(false)

  useEffect(() => {
    setFetchLoading(true)
    productsService.getById(id)
      .then(({ data }) => setProduct(data.product ?? data.data ?? data))
      .catch(err => setFetchError(getErrorMessage(err, 'Product not found.')))
      .finally(() => setFetchLoading(false))
  }, [id])

  const handleSubmit = async (values) => {
    setSaveLoading(true); setSaveError('')
    try {
      await productsService.update(id, values)
      navigate('/products', { replace: true })
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to update.'))
    } finally {
      setSaveLoading(false)
    }
  }

  const renderContent = () => {
    if (fetchLoading) return (
      <div className="card overflow-hidden">
        <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="skeleton w-8 h-8 rounded-[9px]" />
            <div className="space-y-2">
              <div className="skeleton h-2.5 w-32" />
              <div className="skeleton h-2 w-48" />
            </div>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <div className="skeleton h-2.5 w-16" />
            <div className="skeleton h-[34px] w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0,1].map(i => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-2.5 w-12" />
                <div className="skeleton h-[34px] w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )

    if (fetchError) return (
      <div className="card flex flex-col items-center text-center py-14 px-8 animate-fade-in">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 text-danger"
          style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="text-[13px] font-medium text-text-primary mb-1">Product not found</p>
        <p className="text-[12px] text-text-muted mb-5">{fetchError}</p>
        <button className="btn-secondary" onClick={() => navigate('/products')}>← Back to products</button>
      </div>
    )

    return (
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center text-accent flex-shrink-0"
              style={{ background: 'rgba(109,106,254,0.1)', border: '1px solid rgba(109,106,254,0.2)' }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-[13px] font-semibold text-text-primary tracking-[-0.015em]">
                {product?.name ?? 'Edit product'}
              </h2>
              <p className="text-[11px] text-text-muted mt-px">Update the fields you'd like to change</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-text-muted px-2 py-1 rounded-md"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            #{String(id).padStart(5, '0')}
          </span>
        </div>
        {/* Form */}
        <div className="px-6 py-5">
          <ProductForm
            mode="edit"
            initialValues={{ 
              name: product?.name ?? '', 
              price: product?.price ?? '', 
              stock: product?.stock ?? '',
              category_id: product?.category_id ?? ''
            }}
            onSubmit={handleSubmit}
            loading={saveLoading}
            error={saveError}
          />
        </div>
      </div>
    )
  }

  return (
    <Layout title="Edit Product" subtitle="Modify an existing product">
      <div className="max-w-xl">
        <Breadcrumb
          items={[{ label: 'Products', to: '/products' }, { label: product?.name ?? `#${String(id).padStart(5,'0')}` }]}
          navigate={navigate}
        />
        {renderContent()}
      </div>
    </Layout>
  )
}
