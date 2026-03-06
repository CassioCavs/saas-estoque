import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProductForm({ initialValues, onSubmit, mode = 'create', loading = false, error = '' }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialValues ?? { name: '', price: '', stock: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const nameRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (form.price === '') errs.price = 'Required'
    else if (isNaN(form.price) || Number(form.price) < 0) errs.price = 'Enter a valid price'
    if (form.stock === '') errs.stock = 'Required'
    else if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errs.stock = 'Enter a whole number ≥ 0'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setTouched({ name: true, price: true, stock: true })
      return
    }
    await onSubmit({
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
    })
  }

  const totalValue = (Number(form.price || 0) * Number(form.stock || 0)).toFixed(2)
  const showPreview = form.price !== '' && form.stock !== '' && !fieldErrors.price && !fieldErrors.stock

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

      {/* Price + Stock */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (USD)" required error={touched.price && fieldErrors.price}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[12px] select-none pointer-events-none font-mono">$</span>
            <input
              id="price" name="price" type="number" min="0" step="0.01"
              value={form.price} onChange={handleChange} onBlur={handleBlur}
              placeholder="0.00"
              className={`input-field pl-6 ${touched.price && fieldErrors.price ? 'error' : ''}`}
            />
          </div>
        </Field>

        <Field label="Stock" required error={touched.stock && fieldErrors.stock}>
          <input
            id="stock" name="stock" type="number" min="0" step="1"
            value={form.stock} onChange={handleChange} onBlur={handleBlur}
            placeholder="0"
            className={`input-field ${touched.stock && fieldErrors.stock ? 'error' : ''}`}
          />
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
