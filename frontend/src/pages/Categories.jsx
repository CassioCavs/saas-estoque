import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { categoriesService, getErrorMessage } from '../services/api'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState({ name: '' })
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await categoriesService.getAll()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load categories.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const handleOpenModal = (category = null) => {
    setEditingCategory(category)
    setForm({ name: category ? category.name : '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaveLoading(true)
    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory.id, form)
      } else {
        await categoriesService.create(form)
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to save category.'))
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await categoriesService.delete(deleteTarget.id)
      setDeleteTarget(null)
      fetchCategories()
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete category.'))
    }
  }

  return (
    <Layout title="Categories" subtitle="Manage your product organization">
      
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[14px] font-semibold text-text-primary">
          All Categories <span className="ml-2 text-text-muted font-normal">({categories.length})</span>
        </h2>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Category
        </button>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="grid gap-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-[52px] card opacity-50" />)}
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-danger text-[13px]">{error}</div>
      ) : categories.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-text-muted text-[13px]">No categories found.</p>
          <button className="mt-4 text-accent text-[12px] font-medium" onClick={() => handleOpenModal()}>
            Create your first category
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="px-5 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {categories.map((category) => (
                <tr key={category.id} className="group hover:bg-white/[0.015] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-[13.5px] font-medium text-text-primary group-hover:text-accent transition-colors">
                        {category.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link 
                        to={`/categories/${category.id}/products`}
                        className="p-1.5 rounded-md hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-all"
                        title="View Products"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                      <button 
                        onClick={() => handleOpenModal(category)}
                        className="p-1.5 rounded-md hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-all"
                        title="Edit"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(category)}
                        className="p-1.5 rounded-md hover:bg-white/[0.06] text-text-muted hover:text-danger transition-all"
                        title="Delete"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
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
          <div className="relative card w-full max-w-sm p-6 animate-fade-up">
            <h3 className="text-[16px] font-semibold text-text-primary mb-4">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-text-tertiary">Category Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({ name: e.target.value })}
                  placeholder="e.g. Electronics"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saveLoading || !form.name.trim()} className="btn-primary flex-1">
                  {saveLoading ? 'Saving...' : 'Save Category'}
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
            <h3 className="text-[15px] font-semibold text-text-primary mb-2">Delete Category?</h3>
            <p className="text-[12px] text-text-muted mb-6">This will permanently remove "{deleteTarget.name}". This action cannot be undone.</p>
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
