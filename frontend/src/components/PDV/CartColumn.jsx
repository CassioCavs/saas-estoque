import { useState, useMemo } from 'react'
import { useDebounce } from '../../hooks/useFetch'
import { formatBRL } from '../../utils/format'

export default function CartColumn({
  customers,
  cartActions,
  paymentActions,
  onConfirmSale,
  saveLoading,
  selectedCustomer,
  setSelectedCustomer
}) {
  const { cart, updateCartQuantity, setCartQtyDirect, removeFromCart, cartTotal, remaining, isFullyPaid, setCart } = cartActions
  const { payments, payMethod, setPayMethod, payAmount, setPayAmount, handleAddPayment, handleRemovePayment } = paymentActions

  const [customerSearch, setCustomerSearch] = useState('')
  const [customerSearchFocus, setCustomerSearchFocus] = useState(false)
  const debouncedCustomerSearch = useDebounce(customerSearch, 300)

  const filteredCustomers = useMemo(() => {
    if (!debouncedCustomerSearch) return customers.slice(0, 5)
    const s = debouncedCustomerSearch.toLowerCase()
    return customers.filter(c => 
      c.name.toLowerCase().includes(s) || (c.phone && c.phone.includes(s))
    ).slice(0, 5)
  }, [customers, debouncedCustomerSearch])

  return (
    <div className="w-[360px] flex flex-col overflow-hidden" style={{ background: 'var(--color-badge-bg)' }}>
      <div className="p-6 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Resumo do Pedido</h3>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-[10px] text-danger hover:underline">Limpar tudo</button>
          )}
        </div>
        
        {/* Customer Select / Search */}
        <div className="mb-6 relative">
          <label className="text-[10px] font-bold text-text-tertiary uppercase mb-1.5 block tracking-[0.05em]">Selecionar Cliente</label>
          {selectedCustomer ? (
            <div className="flex items-center justify-between rounded-lg p-3" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <div>
                <p className="text-[13px] font-medium text-text-primary">{selectedCustomer.name}</p>
                {selectedCustomer.phone && <p className="text-[11px] text-text-muted">{selectedCustomer.phone}</p>}
              </div>
              <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }} className="text-[11px] text-danger hover:underline">Remover</button>
            </div>
          ) : (
            <>
              <input 
                type="text" 
                placeholder="Buscar cliente por nome ou telefone..."
                className="input-field h-10 w-full text-[13px]"
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                onFocus={() => setCustomerSearchFocus(true)}
                onBlur={() => setTimeout(() => setCustomerSearchFocus(false), 200)}
              />
              {customerSearchFocus && customerSearch && (
                <div className="absolute top-16 left-0 right-0 rounded-lg shadow-xl z-10 overflow-hidden max-h-[160px] overflow-y-auto" style={{ background: 'var(--color-dropdown-bg)', border: '1px solid var(--color-border)' }}>
                  {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                    <button 
                      key={c.id} 
                      className="w-full text-left px-4 py-2 transition-colors last:border-0" style={{ borderBottom: '1px solid var(--color-border-subtle)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-nav-hover-bg)'} onMouseLeave={e => e.currentTarget.style.background = ''}
                      onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }}
                    >
                      <span className="block text-[13px] text-text-primary">{c.name}</span>
                      {c.phone && <span className="block text-[10px] text-text-muted">{c.phone}</span>}
                    </button>
                  )) : (
                    <div className="px-4 py-3 text-[12px] text-text-muted text-center">Nenhum cliente encontrado. Venda avulsa.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar mb-2 max-h-[200px]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 py-8">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mb-2">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-[12px] font-medium">Carrinho vazio</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)' }}>
                <div className="flex-1 min-w-0">
                  <h5 className="text-[12px] font-semibold text-text-primary truncate">{item.name}</h5>
                  <span className="text-[11px] font-mono text-accent">{formatBRL(item.price)}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg p-1" style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border-subtle)' }}>
                  <button onClick={() => updateCartQuantity(item.product_id, -1)} className="w-6 h-6 rounded flex items-center justify-center text-text-primary transition-colors" style={{ background: 'var(--color-badge-bg)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-nav-hover-bg)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-badge-bg)'}>-</button>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="w-14 text-center bg-transparent text-[11px] font-bold text-text-primary outline-none" 
                      value={item.quantity}
                      onChange={(e) => setCartQtyDirect(item.product_id, e.target.value)}
                      step={item.allow_fraction ? "0.01" : "1"}
                      min="0"
                    />
                    <span className="absolute -bottom-2.5 left-0 right-0 text-center text-[8px] text-text-muted uppercase font-mono">{item.unit_type}</span>
                  </div>
                  <button 
                    onClick={() => updateCartQuantity(item.product_id, 1)} 
                    disabled={item.quantity >= item.max_stock}
                    className="w-6 h-6 rounded flex items-center justify-center text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed" style={{ background: 'var(--color-badge-bg)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-nav-hover-bg)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-badge-bg)'}
                  >+</button>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.product_id)} 
                  className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"
                  title="Remover item"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="pt-4 mb-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-bold text-text-primary uppercase tracking-wider">Total</span>
            <span className="text-[20px] font-black text-accent tracking-tight">{formatBRL(cartTotal)}</span>
          </div>
        </div>

        {/* Payments Section */}
        {cart.length > 0 && (
          <div className="mb-4 rounded-xl p-4" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)' }}>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Pagamentos</label>
              <span className="text-[11px] font-mono text-warning">Restante: {formatBRL(remaining)}</span>
            </div>
            
            {/* Added Payments List */}
            {payments.length > 0 && (
              <div className="space-y-2 mb-3">
                {payments.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-[12px] px-3 py-2 rounded-lg" style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border-subtle)' }}>
                    <div className="flex items-center gap-2 text-text-secondary capitalize">
                      <span>{p.method}</span>
                      {p.change > 0 && <span className="text-[10px] text-success font-mono bg-success/10 px-1.5 rounded">Troco: {formatBRL(p.change)}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-text-primary">{formatBRL(p.amount)}</span>
                      <button onClick={() => handleRemovePayment(p.id)} className="text-danger hover:text-text-primary transition-colors">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Payment form */}
            {!isFullyPaid && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="input-field h-9 text-[12px]"
                    value={payMethod} onChange={e => setPayMethod(e.target.value)}
                  >
                    <option value="cash" className="bg-surface-1">Dinheiro</option>
                    <option value="debit" className="bg-surface-1">Débito</option>
                    <option value="credit" className="bg-surface-1">Crédito</option>
                    <option value="pix" className="bg-surface-1">PIX</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder={payMethod === 'cash' ? `Recebido (Troco auto)` : `A pagar (Máx ${formatBRL(remaining, { showSymbol: false })})`}
                    className="input-field h-9 text-[12px]"
                    value={payAmount} onChange={e => setPayAmount(e.target.value)}
                    min="0.01" step="0.01"
                  />
                </div>
                <button 
                  type="button" 
                  className="w-full h-8 rounded-lg text-[12px] font-medium transition-colors text-text-primary" style={{ background: 'var(--color-surface-3)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-4)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface-3)'}
                  onClick={handleAddPayment}
                >
                  Adicionar Pagamento
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action */}
        <button 
          disabled={saveLoading || !isFullyPaid || cart.length === 0}
          onClick={onConfirmSale}
          className="btn-primary w-full h-12 mt-6 text-[15px] font-bold shadow-[0_8px_20px_rgba(95,127,110,0.3)] disabled:shadow-none"
        >
          {saveLoading ? 'Processando...' : 'Finalizar Compra →'}
        </button>
      </div>
    </div>
  )
}
