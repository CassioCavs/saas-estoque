import { useState, useMemo } from 'react'
import { useDebounce } from '../../hooks/useFetch'
import { formatBRL } from '../../utils/format'

export default function ProductGrid({ products, onAddToCart }) {
  const [pdvSearch, setPdvSearch] = useState('')
  const debouncedSearch = useDebounce(pdvSearch, 150) // Debounce rápido para PDV

  const filteredPdvProducts = useMemo(() => {
    if (!debouncedSearch) return products
    const s = debouncedSearch.toLowerCase()
    return products.filter(p => 
      p.name.toLowerCase().includes(s) || (p.barcode && p.barcode.includes(s))
    )
  }, [products, debouncedSearch])

  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter' && pdvSearch.trim()) {
      const s = pdvSearch.trim()
      const exactMatch = products.find(p => p.barcode === s)
      if (exactMatch) {
         onAddToCart(exactMatch)
         setPdvSearch('')
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden" style={{ borderRight: '1px solid var(--color-border)' }}>
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input 
          type="text" 
          placeholder="Buscar produto ou escanear código de barras (Enter)..." 
          className="input-field pl-10 h-11 text-[14px]"
          value={pdvSearch}
          onChange={e => setPdvSearch(e.target.value)}
          onKeyDown={handleBarcodeScan}
          autoFocus
        />
      </div>
      
      <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 pr-2 custom-scrollbar">
        {filteredPdvProducts.map(product => (
          <button 
            key={product.id}
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
            className="card p-4 text-left hover:border-accent/40 hover:bg-accent/[0.02] transition-all group relative overflow-hidden flex flex-col justify-between h-[110px]"
          >
            <div>
              <h4 className="text-[13px] font-semibold text-text-primary line-clamp-1">{product.name}</h4>
              <span className="text-[11px] text-text-muted font-mono uppercase tracking-tight">#{String(product.id).padStart(5, '0')}</span>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[15px] font-bold text-accent">{formatBRL(product.price)}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${product.stock <= 5 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                {product.stock} em estoque
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
