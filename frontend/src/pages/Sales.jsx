import { useEffect, useState, useCallback, useMemo } from 'react'
import Layout from '../components/Layout'
import { salesService, customersService, productsService, getErrorMessage } from '../services/api'

export default function Sales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdvOpen, setPdvOpen] = useState(false)
  
  // PDV State
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerSearchFocus, setCustomerSearchFocus] = useState(false)
  const [cart, setCart] = useState([])
  const [pdvSearch, setPdvSearch] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  
  // Payments State
  const [payments, setPayments] = useState([])
  const [payMethod, setPayMethod] = useState('cash')
  const [payAmount, setPayAmount] = useState('')

  const fetchSales = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await salesService.getAll()
      setSales(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load sales.'))
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPdvData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        customersService.getAll(),
        productsService.getAll()
      ])
      setCustomers(custRes.data)
      setProducts(prodRes.data)
    } catch (err) {
      alert('Failed to load PDV data')
    }
  }

  useEffect(() => { fetchSales() }, [fetchSales])

  const handleOpenPdv = () => {
    fetchPdvData()
    setSelectedCustomer(null)
    setCustomerSearch('')
    setCart([])
    setPayments([])
    setPayMethod('cash')
    setPayAmount('')
    setPdvOpen(true)
  }

  const updateCartQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        // use 0 threshold for fractional items so they can't go below 0
        const minQty = 0
        const newQty = Math.max(minQty, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const setCartQtyDirect = (productId, val) => {
    if (val === '') {
      setCart(prev => prev.map(item => item.product_id === productId ? { ...item, quantity: '' } : item))
      return
    }
    let num = Number(val)
    if (isNaN(num) || num < 0) return
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        return { ...item, quantity: num > item.max_stock ? item.max_stock : num }
      }
      return item
    }))
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId))
  }

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * (Number(item.quantity) || 0)), 0), [cart])
  
  const paymentsTotal = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments])
  const remaining = Math.max(0, cartTotal - paymentsTotal)
  const isFullyPaid = cart.length > 0 && paymentsTotal >= cartTotal - 0.01

  const handleAddPayment = () => {
    const amt = Number(payAmount)
    if (!amt || amt <= 0) return alert('Por favor, informe um valor numérico válido.')
    if (amt > remaining + 0.01 && payMethod !== 'cash') return alert('O valor não pode exceder o restante, exceto em dinheiro.')

    const appliedAmount = Math.min(amt, remaining)
    const received = amt
    
    setPayments([...payments, { 
      id: Date.now(), 
      method: payMethod, 
      amount: appliedAmount, 
      received: received,
      change: Math.max(0, received - appliedAmount)
    }])
    setPayAmount('')
  }
  
  const handleRemovePayment = (id) => {
    setPayments(payments.filter(p => p.id !== id))
  }

  const handleConfirmSale = async () => {
    // If no customer is selected, we can treat it as a walk-in sale (customer_id: null)
    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }
    if (cart.some(item => !item.quantity || Number(item.quantity) <= 0)) {
      alert('One or more items in the cart have an invalid quantity.')
      return
    }
    if (!isFullyPaid) {
      alert('Order is not fully paid yet')
      return
    }
    
    setSaveLoading(true)
    try {
      const totalAmountReceived = payments.reduce((sum, p) => sum + p.received, 0)
      const totalChangeGiven = payments.reduce((sum, p) => sum + p.change, 0)

      await salesService.create({
        customer_id: selectedCustomer?.id || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: Number(item.quantity),
          price: item.price
        })),
        amount_received: totalAmountReceived,
        change_given: totalChangeGiven,
        payments: payments.map(p => ({
          method: p.method,
          amount: p.amount
        }))
      })
      setPdvOpen(false)
      fetchSales()
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to confirm sale.'))
    } finally {
      setSaveLoading(false)
    }
  }

  function addToCart(product) {
    if (product.stock <= 0) {
      alert('Product out of stock!')
      return
    }

    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('Cannot add more than available stock!')
          return prev
        }
        return prev.map(item => item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
        )
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        max_stock: product.stock,
        unit_type: product.unit_type,
        allow_fraction: product.allow_fraction
      }]
    })
  }

  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter' && pdvSearch.trim()) {
      const s = pdvSearch.trim()
      // look for exact barcode match first
      const exactMatch = products.find(p => p.barcode === s)
      if (exactMatch) {
         addToCart(exactMatch)
         setPdvSearch('')
      }
    }
  }

  const filteredPdvProducts = useMemo(() => {
    if (!pdvSearch) return products
    const s = pdvSearch.toLowerCase()
    return products.filter(p => 
      p.name.toLowerCase().includes(s) || (p.barcode && p.barcode.includes(s))
    )
  }, [products, pdvSearch])

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers.slice(0, 5)
    const s = customerSearch.toLowerCase()
    return customers.filter(c => 
      c.name.toLowerCase().includes(s) || (c.phone && c.phone.includes(s))
    ).slice(0, 5)
  }, [customers, customerSearch])

  return (
    <Layout title="Sales" subtitle="Manage your revenue and orders">
      
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[14px] font-semibold text-text-primary">
          Sales History <span className="ml-2 text-text-muted font-normal">({sales.length})</span>
        </h2>
        <button className="btn-primary" onClick={handleOpenPdv}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Sale (PDV)
        </button>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="grid gap-3 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-[60px] card opacity-50" />)}
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-danger text-[13px]">{error}</div>
      ) : sales.length === 0 ? (
        <div className="card py-20 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted" style={{ background: 'var(--color-badge-bg)' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-text-muted text-[13px]">No sales recorded yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr style={{ background: 'var(--color-badge-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">Sale ID</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">Customer</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">Items</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">Payment Details</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">Date</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody style={{ borderColor: 'var(--color-border-subtle)' }} className="divide-y">
              {sales.map((sale) => (
                <tr key={sale.id} className="transition-colors" onMouseEnter={e => e.currentTarget.style.background = 'var(--color-nav-hover-bg)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="px-5 py-4 font-mono text-[11px] text-text-muted">#{String(sale.id).padStart(6, '0')}</td>
                  <td className="px-5 py-4 font-medium text-text-primary">{sale.customer?.name || 'Walk-in Customer'}</td>
                  <td className="px-5 py-4 text-text-secondary text-[12px] max-w-[150px] truncate" title={sale.items?.length + " items"}>
                    {sale.items?.length || 0} items
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] font-medium text-text-primary capitalize">
                        {sale.payments?.map(p => p.method).join(', ') || 'N/A'}
                      </span>
                      {sale.change_given > 0 && (
                        <span className="text-[10px] text-success font-mono">Change: ${sale.change_given.toFixed(2)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-text-secondary text-[12px]">{new Date(sale.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="px-5 py-4 text-right font-semibold text-accent">${sale.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PDV Modal ── */}
      {pdvOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center md:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setPdvOpen(false)} />
          <div className="relative w-full max-w-6xl h-full md:h-[90vh] md:rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-fade-up" style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)' }}>
            
            {/* PDV Header */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-badge-bg)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-[17px] font-bold text-text-primary tracking-tight">Point of Sale</h2>
              </div>
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted transition-colors" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-nav-hover-bg)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => setPdvOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left: Products Catalog */}
              <div className="flex-1 flex flex-col p-6 overflow-hidden" style={{ borderRight: '1px solid var(--color-border)' }}>
                <div className="relative mb-6">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search explicitly or Scan Barcode (Press Enter)..." 
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
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className="card p-4 text-left hover:border-accent/40 hover:bg-accent/[0.02] transition-all group relative overflow-hidden flex flex-col justify-between h-[110px]"
                    >
                      <div>
                        <h4 className="text-[13px] font-semibold text-text-primary line-clamp-1">{product.name}</h4>
                        <span className="text-[11px] text-text-muted font-mono uppercase tracking-tight">#{String(product.id).padStart(5, '0')}</span>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[15px] font-bold text-accent">${product.price.toFixed(2)}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${product.stock <= 5 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                          {product.stock} in stock
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Cart & Checkout */}
              <div className="w-[360px] flex flex-col overflow-hidden" style={{ background: 'var(--color-badge-bg)' }}>
                <div className="p-6 flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Order Summary</h3>
                    {cart.length > 0 && (
                      <button onClick={() => setCart([])} className="text-[10px] text-danger hover:underline">Clear all</button>
                    )}
                  </div>
                  
                  {/* Customer Select / Search */}
                  <div className="mb-6 relative">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase mb-1.5 block tracking-[0.05em]">Select Customer</label>
                    {selectedCustomer ? (
                      <div className="flex items-center justify-between rounded-lg p-3" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                        <div>
                          <p className="text-[13px] font-medium text-text-primary">{selectedCustomer.name}</p>
                          {selectedCustomer.phone && <p className="text-[11px] text-text-muted">{selectedCustomer.phone}</p>}
                        </div>
                        <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }} className="text-[11px] text-danger hover:underline">Remove</button>
                      </div>
                    ) : (
                      <>
                        <input 
                          type="text" 
                          placeholder="Search customer by name or phone..."
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
                              <div className="px-4 py-3 text-[12px] text-text-muted text-center">No customer found. Walk-in default.</div>
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
                        <p className="text-[12px] font-medium">Cart is empty</p>
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.product_id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)' }}>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[12px] font-semibold text-text-primary truncate">{item.name}</h5>
                            <span className="text-[11px] font-mono text-accent">${item.price.toFixed(2)}</span>
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
                            title="Remove item"
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
                      <span className="text-[20px] font-black text-accent tracking-tight">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payments Section */}
                  {cart.length > 0 && (
                    <div className="mb-4 rounded-xl p-4" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)' }}>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Pagamentos</label>
                        <span className="text-[11px] font-mono text-warning">Restante: ${remaining.toFixed(2)}</span>
                      </div>
                      
                      {/* Added Payments List */}
                      {payments.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {payments.map(p => (
                            <div key={p.id} className="flex justify-between items-center text-[12px] px-3 py-2 rounded-lg" style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border-subtle)' }}>
                              <div className="flex items-center gap-2 text-text-secondary capitalize">
                                <span>{p.method}</span>
                                {p.change > 0 && <span className="text-[10px] text-success font-mono bg-success/10 px-1.5 rounded">Change: ${p.change.toFixed(2)}</span>}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-text-primary">${p.amount.toFixed(2)}</span>
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
                              <option value="cash" className="bg-surface-1">Dinheiro (Cash)</option>
                              <option value="debit" className="bg-surface-1">Débito (Debit)</option>
                              <option value="credit" className="bg-surface-1">Crédito (Credit)</option>
                              <option value="pix" className="bg-surface-1">PIX</option>
                            </select>
                            <input 
                              type="number" 
                              placeholder={payMethod === 'cash' ? `Recebido (Troco Auto)` : `A Pagar (Max ${remaining.toFixed(2)})`}
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
                    onClick={handleConfirmSale}
                    className="btn-primary w-full h-12 mt-6 text-[15px] font-bold shadow-[0_8px_20px_rgba(109,106,254,0.3)] disabled:shadow-none"
                  >
                    {saveLoading ? 'Processing...' : 'Complete Purchase →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  )
}
