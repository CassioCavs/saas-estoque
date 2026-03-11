import { useEffect, useState, useCallback } from 'react'
import Layout from '../components/Layout'
import { customersService, getErrorMessage } from '../services/api'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', observations: '' })
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')

  const fetchCustomers = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await customersService.getAll()
      setCustomers(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load customers.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const handleOpenModal = (customer = null) => {
    setEditingCustomer(customer)
    setForm({
      name: customer ? customer.name : '',
      email: customer ? customer.email || '' : '',
      phone: customer ? customer.phone || '' : '',
      observations: customer ? customer.observations || '' : ''
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaveLoading(true)
    try {
      if (editingCustomer) {
        await customersService.update(editingCustomer.id, form)
      } else {
        await customersService.create(form)
      }
      setModalOpen(false)
      fetchCustomers()
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to save customer.'))
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await customersService.delete(deleteTarget.id)
      setDeleteTarget(null)
      fetchCustomers()
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete customer.'))
    }
  }

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <Layout title="Customers" subtitle="Manage your client base">
      
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Customer
        </button>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="grid gap-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-[64px] card opacity-50" />)}
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-danger text-[13px]">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-text-muted text-[13px]">No customers found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="px-5 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((customer) => (
                <tr key={customer.id} className="group hover:bg-white/[0.02] transition-colors h-[64px]">
                  <td className="px-5 py-2">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-text-primary">{customer.name}</span>
                      <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider mt-0.5">#{String(customer.id).padStart(5, '0')}</span>
                    </div>
                  </td>
                  <td className="px-5 py-2">
                    <div className="flex flex-col gap-0.5">
                      {customer.email && (
                        <span className="text-[12px] text-text-secondary flex items-center gap-1.5">
                          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                          </svg>
                          {customer.email}
                        </span>
                      )}
                      {customer.phone && (
                        <span className="text-[12px] text-text-muted flex items-center gap-1.5">
                          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          {customer.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        className="w-7 h-7 rounded-md flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/[0.06] transition-all"
                        onClick={() => handleOpenModal(customer)}
                      >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button 
                        className="w-7 h-7 rounded-md flex items-center justify-center text-text-tertiary hover:text-danger hover:bg-danger/10 transition-all"
                        onClick={() => setDeleteTarget(customer)}
                      >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative card w-full max-w-md p-6 animate-fade-up">
            <h3 className="text-[16px] font-semibold text-text-primary mb-5">
              {editingCustomer ? 'Edit Customer' : 'New Customer'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-text-tertiary">Full Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-text-tertiary">Email</label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-text-tertiary">Phone</label>
                  <input 
                    type="text" 
                    value={form.phone} 
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+55 11 99999-9999"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-text-tertiary">Observations</label>
                <textarea 
                  value={form.observations} 
                  onChange={e => setForm({ ...form, observations: e.target.value })}
                  placeholder="Notes about the customer..."
                  className="input-field min-h-[60px] resize-y"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button type="submit" disabled={saveLoading || !form.name.trim()} className="btn-primary flex-1">
                  {saveLoading ? 'Saving...' : 'Save Customer'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative card w-full max-w-xs p-6 animate-fade-up text-center border-danger/20">
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger mx-auto mb-4">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-text-primary mb-2">Delete Customer?</h3>
            <p className="text-[12px] text-text-muted mb-6">This will remove "{deleteTarget.name}". All sales associated with this client will remain in history.</p>
            <div className="flex gap-2">
              <button className="btn-primary bg-danger hover:bg-danger/90 flex-1 border-none" onClick={handleDelete}>Delete</button>
              <button className="btn-secondary flex-1" onClick={() => setDeleteTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  )
}
