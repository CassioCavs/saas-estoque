import { useEffect, useState, useCallback } from 'react'
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
  const [cart, setCart] = useState([])
  const [pdvSearch, setPdvSearch] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)

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
    setCart([])
    setPdvOpen(true)
  }

  const updateCartQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleConfirmSale = async () => {
    // If no customer is selected, we can treat it as a walk-in sale (customer_id: null)
    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }
    
    setSaveLoading(true)
    try {
      await salesService.create({
        customer_id: selectedCustomer?.id || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
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
        max_stock: product.stock
      }]
    })
  }

  const filteredPdvProducts = products.filter(p => 
    p.name.toLowerCase().includes(pdvSearch.toLowerCase()) ||
    (p.barcode && p.barcode.includes(pdvSearch))
  )

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
          <div className="w-12 h-12 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
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
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">Sale ID</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">Customer</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">Date</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-5 py-4 font-mono text-[11px] text-text-muted">#{String(sale.id).padStart(6, '0')}</td>
                  <td className="px-5 py-4 font-medium text-text-primary">{sale.customer?.name || 'Walk-in Customer'}</td>
                  <td className="px-5 py-4 text-text-secondary">{new Date(sale.created_at).toLocaleString()}</td>
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
          <div className="relative bg-[#0b0b14] w-full max-w-6xl h-full md:h-[90vh] md:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/10 animate-fade-up">
            
            {/* PDV Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-[17px] font-bold text-white tracking-tight">Point of Sale</h2>
              </div>
              <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-text-muted transition-colors" onClick={() => setPdvOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left: Products Catalog */}
              <div className="flex-1 flex flex-col p-6 border-r border-white/10 overflow-hidden">
                <div className="relative mb-6">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search products by name or barcode..." 
                    className="input-field pl-10 h-11 bg-white/[0.03] border-white/10 text-[14px]"
                    value={pdvSearch}
                    onChange={e => setPdvSearch(e.target.value)}
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
              <div className="w-[360px] bg-white/[0.01] flex flex-col overflow-hidden">
                <div className="p-6 flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[12px] font-bold text-white uppercase tracking-wider opacity-60">Order Summary</h3>
                    {cart.length > 0 && (
                      <button onClick={() => setCart([])} className="text-[10px] text-danger hover:underline">Clear all</button>
                    )}
                  </div>
                  
                  {/* Customer Select */}
                  <div className="mb-6">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase mb-1.5 block tracking-[0.05em]">Select Customer</label>
                    <div className="relative group">
                      <select 
                        className="input-field appearance-none h-10 bg-white/[0.05] border-white/10 text-[13px] pr-8 cursor-pointer hover:bg-white/[0.08] transition-colors"
                        value={selectedCustomer?.id || ''}
                        onChange={e => {
                          const val = e.target.value
                          if (val === '') {
                            setSelectedCustomer(null)
                          } else {
                            const cust = customers.find(c => c.id === Number(val))
                            setSelectedCustomer(cust)
                          }
                        }}
                      >
                        <option value="" className="bg-[#0b0b14]">Walk-in Customer (Default)</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id} className="bg-[#0b0b14]">{c.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-text-secondary transition-colors">
                        <svg width="10" height="6" fill="none" viewBox="0 0 10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 1L6 6 1 1" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar mb-6">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mb-2">
                          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-[12px] font-medium">Cart is empty</p>
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.product_id} className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/[0.05]">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[12px] font-semibold text-text-primary truncate">{item.name}</h5>
                            <span className="text-[11px] font-mono text-accent">${item.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2.5 bg-black/20 rounded-lg p-1 border border-white/5">
                            <button onClick={() => updateCartQuantity(item.product_id, -1)} className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-white transition-colors">-</button>
                            <span className="text-[12px] font-bold min-w-[20px] text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.product_id, 1)} 
                              disabled={item.quantity >= item.max_stock}
                              className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >+</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Totals */}
                  <div className="pt-6 border-t border-white/10 space-y-2">
                    <div className="flex justify-between text-[13px] text-text-muted">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[13px] text-text-muted pb-2">
                      <span>Tax (0%)</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[14px] font-bold text-white uppercase tracking-wider">Total</span>
                      <span className="text-[24px] font-black text-accent tracking-tight">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <button 
                    disabled={saveLoading || !selectedCustomer || cart.length === 0}
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
