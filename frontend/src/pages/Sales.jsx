import { useState } from 'react'
import Layout from '../components/Layout'
import { salesService } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import PosModal from '../components/PDV/PosModal'
import { formatBRL, formatDateBR } from '../utils/format'

export default function Sales() {
  const [pdvOpen, setPdvOpen] = useState(false)
  
  const { data: sales, loading, error, refetch: fetchSales } = useFetch(salesService.getAll)

  return (
    <Layout title="Vendas" subtitle="Gerencie sua receita e pedidos">
      
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[14px] font-semibold text-text-primary">
          Histórico de Vendas <span className="ml-2 text-text-muted font-normal">({sales.length})</span>
        </h2>
        <button className="btn-primary" onClick={() => setPdvOpen(true)}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova Venda (PDV)
        </button>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="grid gap-3 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-[60px] card opacity-50" />)}
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-danger text-[13px]">
          {error}
          <button onClick={fetchSales} className="ml-4 text-[11px] underline">Tentar novamente</button>
        </div>
      ) : sales.length === 0 ? (
        <div className="card py-20 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted" style={{ background: 'var(--color-badge-bg)' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-text-muted text-[13px]">Nenhuma venda registrada ainda.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr style={{ background: 'var(--color-badge-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">ID da Venda</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">Cliente</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">Itens</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">Pagamento</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider">Data</th>
                <th className="px-5 py-3 font-medium text-text-muted uppercase text-[10px] tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody style={{ borderColor: 'var(--color-border-subtle)' }} className="divide-y">
              {sales.map((sale) => (
                <tr key={sale.id} className="transition-colors" onMouseEnter={e => e.currentTarget.style.background = 'var(--color-nav-hover-bg)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="px-5 py-4 font-mono text-[11px] text-text-muted">#{String(sale.id).padStart(6, '0')}</td>
                  <td className="px-5 py-4 font-medium text-text-primary">{sale.customer?.name || 'Cliente avulso'}</td>
                  <td className="px-5 py-4 text-text-secondary text-[12px] max-w-[150px] truncate" title={sale.items?.length + " itens"}>
                    {sale.items?.length || 0} {(sale.items?.length || 0) === 1 ? 'item' : 'itens'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] font-medium text-text-primary capitalize">
                        {sale.payments?.map(p => p.method).join(', ') || 'N/D'}
                      </span>
                      {sale.change_given > 0 && (
                        <span className="text-[10px] text-success font-mono bg-success/10 px-1.5 rounded w-max mt-1">Troco: {formatBRL(sale.change_given)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-text-secondary text-[12px]">{formatDateBR(sale.created_at)}</td>
                  <td className="px-5 py-4 text-right font-semibold text-accent">{formatBRL(sale.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pdvOpen && (
        <PosModal 
          onClose={() => setPdvOpen(false)} 
          onSuccess={fetchSales} 
        />
      )}
    </Layout>
  )
}
