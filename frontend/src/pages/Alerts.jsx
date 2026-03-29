import { useEffect, useState, useCallback } from 'react'
import Layout from '../components/Layout'
import { alertsService, getErrorMessage } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchAlerts = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await alertsService.getLowStock()
      setAlerts(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao carregar alertas de estoque.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  return (
    <Layout title="Alertas de Estoque" subtitle="Monitore níveis críticos do inventário">
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-40 card opacity-50" />)}
        </div>
      ) : error ? (
        <div className="card p-12 text-center text-danger text-[13px]">{error}</div>
      ) : alerts.length === 0 ? (
        <div className="card py-24 text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 text-success">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-text-primary mb-2 tracking-tight">Tudo em ordem!</h3>
          <p className="text-text-muted text-[13px]">Nenhum produto está no ou abaixo do estoque mínimo no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {alerts.map((product) => (
            <div key={product.id} className="card p-5 border-danger/20 hover:border-danger/40 transition-all flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-danger/5 -translate-y-10 translate-x-10 rotate-45 group-hover:bg-danger/10 transition-colors" />
              
              <div className="flex-1 mb-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-col">
                    <h4 className="text-[14px] font-bold text-text-primary line-clamp-1">{product.name}</h4>
                    <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest mt-0.5">#{String(product.id).padStart(5, '0')}</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center text-danger">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase mb-1">Estoque Atual</p>
                    <p className="text-[20px] font-black text-danger tracking-tight">{product.stock}</p>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <div>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase mb-1">Estoque Mínimo</p>
                    <p className="text-[15px] font-bold text-text-muted">{product.min_stock}</p>
                  </div>
                </div>
              </div>

              <button 
                className="btn-secondary w-full text-[12px] h-9 border-white/10 hover:bg-white/5"
                onClick={() => navigate(`/edit-product/${product.id}`)}
              >
                Repor Estoque
              </button>
            </div>
          ))}
        </div>
      )}

    </Layout>
  )
}
