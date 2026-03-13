import { useEffect, useState, useCallback } from 'react'
import Layout from '../components/Layout'
import { stockService, getErrorMessage } from '../services/api'

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHistory = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await stockService.getHistory()
      setHistory(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load history.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const getActionDetails = (item) => {
    const { action, entity, entity_id } = item
    
    const colors = {
      create: 'text-success bg-success/10 border-success/20',
      update: 'text-accent bg-accent/10 border-accent/20',
      delete: 'text-danger bg-danger/10 border-danger/20',
      sale:   'text-warning bg-warning/10 border-warning/20',
      stock:  'text-info bg-info/10 border-info/20',
    }

    let label = action
    let type = 'update'

    if (action.includes('create')) { label = 'Created'; type = 'create' }
    if (action.includes('update')) { label = 'Updated'; type = 'update' }
    if (action.includes('delete')) { label = 'Deleted'; type = 'delete' }
    if (action.includes('sale'))   { label = 'Sale';    type = 'sale' }
    if (action.includes('stock'))  { label = 'Stock';   type = 'stock' }

    return { label, entity, entity_id, style: colors[type] }
  }

  return (
    <Layout title="Activity History" subtitle="Monitor all system events and changes">
      
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 card opacity-50" />)}
        </div>
      ) : error ? (
        <div className="card p-12 text-center text-danger text-[13px]">{error}</div>
      ) : history.length === 0 ? (
        <div className="card py-20 text-center">
          <p className="text-text-muted text-[13px]">No activities recorded yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Time</th>
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Action</th>
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Entity</th>
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {history.map((item) => {
                const { label, entity, entity_id, style } = getActionDetails(item)
                return (
                  <tr key={item.id} className="hover:bg-white/[0.01] transition-colors h-14">
                    <td className="px-5 py-2">
                      <span className="text-[12px] text-text-muted font-mono">
                        {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </td>
                    <td className="px-5 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border ${style}`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-5 py-2">
                      <span className="text-[13px] font-medium text-text-primary capitalize">{entity}</span>
                    </td>
                    <td className="px-5 py-2">
                      <span className="text-[11px] font-mono text-text-tertiary">#{String(entity_id).padStart(5, '0')}</span>
                    </td>
                    <td className="px-5 py-2 max-w-[300px] truncate">
                      <span className="text-[12px] text-text-tertiary">
                        {item.action.replace('_', ' ')} for {entity} #{entity_id}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

    </Layout>
  )
}
