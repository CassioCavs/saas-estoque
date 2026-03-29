import { useState, useMemo } from 'react'

export function useCart() {
  const [cart, setCart] = useState([])
  const [payments, setPayments] = useState([])
  const [payMethod, setPayMethod] = useState('cash')
  const [payAmount, setPayAmount] = useState('')

  const updateCartQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
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

  return {
    cart, setCart,
    payments, setPayments,
    payMethod, setPayMethod,
    payAmount, setPayAmount,
    cartTotal, paymentsTotal, remaining, isFullyPaid,
    updateCartQuantity, setCartQtyDirect, removeFromCart,
    handleAddPayment, handleRemovePayment, addToCart
  }
}
