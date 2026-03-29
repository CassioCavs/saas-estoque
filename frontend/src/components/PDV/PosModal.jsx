import { useState, useEffect } from 'react'
import { salesService, customersService, productsService, getErrorMessage } from '../../services/api'
import { useCart } from '../../hooks/useCart'
import ProductGrid from './ProductGrid'
import CartColumn from './CartColumn'

export default function PosModal({ onClose, onSuccess }) {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)

  const {
    cart, setCart,
    payments, setPayments,
    payMethod, setPayMethod,
    payAmount, setPayAmount,
    cartTotal, paymentsTotal, remaining, isFullyPaid,
    updateCartQuantity, setCartQtyDirect, removeFromCart,
    handleAddPayment, handleRemovePayment, addToCart
  } = useCart()

  useEffect(() => {
    const fetchPdvData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customersService.getAll(),
          productsService.getAll()
        ])
        setCustomers(Array.isArray(custRes.data) ? custRes.data : [])
        setProducts(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.products ?? [])
      } catch (err) {
        alert('Falha ao carregar dados do PDV')
      }
    }
    fetchPdvData()
  }, [])

  const handleConfirmSale = async () => {
    if (cart.length === 0) return alert('Seu carrinho está vazio')
    if (cart.some(item => !item.quantity || Number(item.quantity) <= 0)) {
      return alert('Um ou mais itens no carrinho possuem quantidade inválida.')
    }
    if (!isFullyPaid) return alert('O pedido ainda não foi totalmente pago')
    
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
      onClose()
      if (onSuccess) onSuccess()
    } catch (err) {
      alert(getErrorMessage(err, 'Falha ao confirmar venda.'))
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center md:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl h-full md:h-[90vh] md:rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-fade-up" style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)' }}>
        
        {/* PDV Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-badge-bg)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-[17px] font-bold text-text-primary tracking-tight">Ponto de Venda</h2>
          </div>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted transition-colors hover:bg-[var(--color-nav-hover-bg)]" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Products Catalog */}
          <ProductGrid 
            products={products} 
            onAddToCart={addToCart} 
          />

          {/* Right: Cart & Checkout */}
          <CartColumn 
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            cartActions={{ cart, updateCartQuantity, setCartQtyDirect, removeFromCart, cartTotal, remaining, isFullyPaid, setCart }}
            paymentActions={{ payments, payMethod, setPayMethod, payAmount, setPayAmount, handleAddPayment, handleRemovePayment }}
            onConfirmSale={handleConfirmSale}
            saveLoading={saveLoading}
          />
        </div>
      </div>
    </div>
  )
}
