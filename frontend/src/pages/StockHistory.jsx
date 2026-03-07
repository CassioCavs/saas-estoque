import { useEffect, useState, useCallback } from 'react'
import Layout from '../components/Layout'
import { stockService, getErrorMessage } from '../services/api'

export default function StockHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHistory = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await stockService.getHistory()
      setHistory(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load stock history.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  return (
    <Layout title="Stock Movements" subtitle="Track every item entry and exit">
      
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 card opacity-50" />)}
        </div>
      ) : error ? (
        <div className="card p-12 text-center text-danger text-[13px]">{error}</div>
      ) : history.length === 0 ? (
        <div className="card py-20 text-center">
          <p className="text-text-muted text-[13px]">No movements recorded yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Product</th>
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">Type</th>
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">Qty</th>
                <th className="px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {history.map((move) => (
                <tr key={move.id} className="hover:bg-white/[0.01] transition-colors h-14">
                  <td className="px-5 py-2">
                    <span className="text-[12px] text-text-muted font-mono">
                      {new Date(move.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </td>
                  <td className="px-5 py-2 min-w-[200px]">
                    <span className="text-[13px] font-semibold text-text-primary">{move.product?.name || 'Deleted Product'}</span>
                  </td>
                  <td className="px-5 py-2 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      move.movement_type === 'in' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                      {move.movement_type === 'in' ? 'Entry' : 'Exit'}
                    </span>
                  </td>
                  <td className="px-5 py-2 text-center">
                    <span className={`text-[13px] font-bold font-mono ${
                      move.movement_type === 'in' ? 'text-success' : 'text-danger'
                    }`}>
                      {move.movement_type === 'in' ? '+' : '-'}{move.quantity}
                    </span>
                  </td>
                  <td className="px-5 py-2 max-w-[200px] truncate">
                    <span className="text-[12px] text-text-tertiary">{move.reason || '-'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </Layout>
  )
}
