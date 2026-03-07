import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { reportsService, getErrorMessage } from '../services/api'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'

export default function Reports() {
  const [salesReport, setSalesReport] = useState(null)
  const [stockReport, setStockReport] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true); setError('')
      try {
        const [salesRes, stockRes, topRes] = await Promise.all([
          reportsService.getSales(),
          reportsService.getStock(),
          reportsService.getTopProducts(5)
        ])
        setSalesReport(salesRes.data)
        setStockReport(stockRes.data)
        setTopProducts(topRes.data)
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load report data.'))
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  if (loading) return (
    <Layout title="Analytics" subtitle="Real-time business insights">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[1, 2, 3].map(i => <div key={i} className="h-32 card animate-pulse opacity-50" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2].map(i => <div key={i} className="h-80 card animate-pulse opacity-50" />)}
      </div>
    </Layout>
  )

  const COLORS = ['#6d6afe', '#9b8fff', '#3b82f6', '#10b981', '#f59e0b']

  return (
    <Layout title="Analytics" subtitle="Real-time business insights">
      
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <SummaryCard 
          title="Total Revenue" 
          value={`$${salesReport?.total_revenue?.toLocaleString() || '0'}`} 
          subtitle={`${salesReport?.total_sales || 0} total sales`}
          icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
          color="accent"
        />
        <SummaryCard 
          title="Inventory Value" 
          value={`$${stockReport?.total_stock_value?.toLocaleString() || '0'}`} 
          subtitle={`${stockReport?.total_stock || 0} units in stock`}
          icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>}
          color="success"
        />
        <SummaryCard 
          title="Units Sold" 
          value={salesReport?.total_products_sold?.toLocaleString() || '0'} 
          subtitle="All-time volume"
          icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        
        {/* Top Products Chart */}
        <div className="card p-6 min-h-[400px] flex flex-col">
          <h3 className="text-[15px] font-bold text-text-primary mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Best Selling Products
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="product_name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="total_sold" radius={[0, 4, 4, 0]} barSize={24}>
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="card p-6 min-h-[400px] flex flex-col">
          <h3 className="text-[15px] font-bold text-text-primary mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Revenue Contribution
          </h3>
          <div className="h-[300px] w-full flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProducts}
                    dataKey="total_revenue"
                    nameKey="product_name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-4 pr-4">
              {topProducts.map((p, i) => (
                <div key={p.product_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[12px] text-text-muted truncate">{p.product_name}</span>
                  </div>
                  <span className="text-[12px] font-mono text-text-primary ml-2">${p.total_revenue.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </Layout>
  )
}

function SummaryCard({ title, value, subtitle, icon, color }) {
  const colorMap = {
    accent: 'text-accent bg-accent/10 border-accent/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20'
  }
  
  return (
    <div className="card p-6 flex items-start justify-between group hover:border-white/20 transition-all">
      <div>
        <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2">{title}</p>
        <h4 className="text-[26px] font-black text-white tracking-tight leading-none mb-2">{value}</h4>
        <p className="text-[12px] text-text-muted font-medium">{subtitle}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  )
}
