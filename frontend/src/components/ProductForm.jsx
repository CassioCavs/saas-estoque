import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoriesService } from '../services/api'

export default function ProductForm({ initialValues, onSubmit, mode = 'create', loading = false, error = '' }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    cost_price: '',
    profit_margin: '',
    sale_price: '',
    stock: '',
    min_stock: '',
    barcode: '',
    unit_type: 'un',
    ...initialValues
  })
  const [categories, setCategories] = useState([])
  const [fetchingCategories, setFetchingCategories] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const nameRef = useRef(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        setFetchingCategories(true)
        const { data } = await categoriesService.getAll()
        setCategories(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error loading categories:', err)
      } finally {
        setFetchingCategories(false)
      }
    }
    loadCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    const val = value === '' ? '' : Number(value)
    
    setForm(prev => {
      const next = { ...prev, [name]: value }
      
      // Lógica de cálculo bidirecional
      if (name === 'cost_price' || name === 'profit_margin') {
        const cost = name === 'cost_price' ? val : Number(prev.cost_price)
        const margin = name === 'profit_margin' ? val : Number(prev.profit_margin)
        
        if (cost > 0) {
          next.sale_price = (cost * (1 + margin / 100)).toFixed(2)
        }
      } 
      else if (name === 'sale_price') {
        const cost = Number(prev.cost_price)
        const sale = val
        
        if (cost > 0) {
          next.profit_margin = (((sale - cost) / cost) * 100).toFixed(2)
        }
      }
      
      return next
    })
    
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (form.sale_price === '') errs.sale_price = 'Required'
    if (form.stock === '') errs.stock = 'Required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setTouched({ name: true, sale_price: true, stock: true })
      return
    }
    await onSubmit({
      ...form,
      name: form.name.trim(),
      cost_price: form.cost_price !== '' ? Number(form.cost_price) : null,
      profit_margin: form.profit_margin !== '' ? Number(form.profit_margin) : null,
      sale_price: Number(form.sale_price),
      price: Number(form.sale_price), // Mantém price para compatibilidade
      stock: Number(form.stock),
      min_stock: Number(form.min_stock || 0),
      barcode: form.barcode.trim() || null,
      unit_type: form.unit_type,
      allow_fraction: form.unit_type !== 'un',
      category_id: form.category_id ? Number(form.category_id) : null,
    })
  }

  const isFractional = form.unit_type !== 'un'
  const totalValue = (Number(form.sale_price || 0) * Number(form.stock || 0)).toFixed(2)
  const showPreview = form.sale_price !== '' && form.stock !== '' && !fieldErrors.sale_price && !fieldErrors.stock

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-[440px]">

      {/* API error */}
      {error && (
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-[10px] text-[12px] text-danger animate-fade-in"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)' }}>
          <svg className="flex-shrink-0 mt-[1px]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Name */}
      <Field label="Product name" required error={touched.name && fieldErrors.name}>
        <input
          ref={nameRef}
          id="name" name="name" type="text"
          value={form.name} onChange={handleChange} onBlur={handleBlur}
          placeholder="e.g. Wireless Keyboard"
          className={`input-field ${touched.name && fieldErrors.name ? 'error' : ''}`}
          autoFocus
        />
      </Field>

      {/* Category */}
      <Field label="Category">
        <div className="relative group">
          <select
            id="category_id" name="category_id"
            value={form.category_id || ''} onChange={handleChange}
            disabled={fetchingCategories}
            className="input-field appearance-none cursor-pointer pr-8 hover:bg-white/[0.045] transition-colors"
          >
            <option value="" className="bg-surface-1">No category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-surface-1">{cat.name}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-text-secondary transition-colors">
            <svg width="10" height="6" fill="none" viewBox="0 0 10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1l4 4 4-4" />
            </svg>
          </div>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        {/* Barcode */}
        <Field label="Barcode (Optional)">
          <input
            id="barcode" name="barcode" type="text"
            value={form.barcode} onChange={handleChange} onBlur={handleBlur}
            placeholder="Scan or type..."
            className="input-field"
          />
        </Field>

        {/* Unit Type */}
        <Field label="Measurement Unit">
          <div className="relative group">
            <select
              id="unit_type" name="unit_type"
              value={form.unit_type} onChange={handleChange}
              className="input-field appearance-none cursor-pointer pr-8 hover:bg-white/[0.045] transition-colors"
            >
              <option value="un" className="bg-surface-1">Unit (un)</option>
              <option value="kg" className="bg-surface-1">Kilogram (kg)</option>
              <option value="g" className="bg-surface-1">Gram (g)</option>
              <option value="l" className="bg-surface-1">Liter (l)</option>
              <option value="m" className="bg-surface-1">Meter (m)</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-text-secondary transition-colors">
              <svg width="10" height="6" fill="none" viewBox="0 0 10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1l4 4 4-4" />
              </svg>
            </div>
          </div>
        </Field>
      </div>

      {/* Prices Logic */}
      <div className="grid grid-cols-3 gap-3">
        <Field label="Cost (USD)" error={touched.cost_price && fieldErrors.cost_price}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[12px] select-none pointer-events-none font-mono">$</span>
            <input
              id="cost_price" name="cost_price" type="number" min="0" step="0.01"
              value={form.cost_price} onChange={handleChange} onBlur={handleBlur}
              placeholder="0.00"
              className={`input-field pl-6 ${touched.cost_price && fieldErrors.cost_price ? 'error' : ''}`}
            />
          </div>
        </Field>

        <Field label="Margin (%)" error={touched.profit_margin && fieldErrors.profit_margin}>
          <div className="relative">
            <input
              id="profit_margin" name="profit_margin" type="number" step="0.1"
              value={form.profit_margin} onChange={handleChange} onBlur={handleBlur}
              placeholder="0"
              className="input-field pr-6"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[12px] select-none pointer-events-none font-mono">%</span>
          </div>
        </Field>

        <Field label="Sale Price" required error={touched.sale_price && fieldErrors.sale_price}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[12px] select-none pointer-events-none font-mono">$</span>
            <input
              id="sale_price" name="sale_price" type="number" min="0" step="0.01"
              value={form.sale_price} onChange={handleChange} onBlur={handleBlur}
              placeholder="0.00"
              className={`input-field pl-6 border-accent/30 ${touched.sale_price && fieldErrors.sale_price ? 'error' : ''}`}
            />
          </div>
        </Field>
      </div>

      {/* Stock */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Current Stock" required error={touched.stock && fieldErrors.stock}>
          <div className="relative">
            <input
              id="stock" name="stock" type="number" min="0" step={isFractional ? "0.01" : "1"}
              value={form.stock} onChange={handleChange} onBlur={handleBlur}
              placeholder="0"
              className={`input-field pr-8 ${touched.stock && fieldErrors.stock ? 'error' : ''}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[11px] select-none pointer-events-none font-mono uppercase">
              {form.unit_type}
            </span>
          </div>
        </Field>
        
        <Field label="Min. Stock">
          <div className="relative">
            <input
              id="min_stock" name="min_stock" type="number" min="0" step={isFractional ? "0.01" : "1"}
              value={form.min_stock} onChange={handleChange}
              placeholder="0"
              className="input-field pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[11px] select-none pointer-events-none font-mono uppercase">
              {form.unit_type}
            </span>
          </div>
        </Field>
      </div>

      {/* Live value preview */}
      <div
        className="rounded-[9px] px-4 py-3 transition-all duration-300"
        style={{
          background: showPreview ? 'rgba(109,106,254,0.06)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${showPreview ? 'rgba(109,106,254,0.18)' : 'rgba(255,255,255,0.06)'}`,
          opacity: showPreview ? 1 : 0.5,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={showPreview ? 'rgba(109,106,254,0.8)' : 'rgba(255,255,255,0.2)'} strokeWidth={2}>
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="text-[11px] text-text-tertiary">Total inventory value</span>
          </div>
          <span className="text-[13px] font-semibold font-mono tracking-[-0.01em]"
            style={{ color: showPreview ? '#ededf2' : 'rgba(255,255,255,0.2)' }}>
            ${totalValue}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? <><span className="w-3.5 h-3.5 spinner" /> Saving…</>
            : mode === 'create' ? 'Create product' : 'Save changes'
          }
        </button>
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  )
}

/* ── Field wrapper ── */
function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between h-4">
        <label className="text-[11px] font-medium text-text-secondary tracking-[-0.005em]">
          {label}{required && <span className="text-text-muted ml-0.5">*</span>}
        </label>
        {error && (
          <span className="text-[10px] text-danger animate-fade-in">{error}</span>
        )}
      </div>
      {children}
    </div>
  )
}
