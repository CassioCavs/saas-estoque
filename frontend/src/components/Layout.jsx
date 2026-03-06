import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Sidebar from './Sidebar'

export default function Layout({ children, title, subtitle }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen flex ambient-bg">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: '216px' }}>

        {/* ── Top bar ── */}
        <header
          className="sticky top-0 z-30 flex items-center px-7 h-[52px]"
          style={{
            background: 'rgba(8,8,14,0.82)',
            borderBottom: '1px solid rgba(255,255,255,0.055)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-[13px] font-semibold text-text-primary tracking-[-0.02em] leading-none">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-text-muted mt-[3px] leading-none">{subtitle}</p>
            )}
          </div>

          {/* Connection pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-text-muted"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
            Live
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 px-7 py-7 animate-fade-up">
          {children}
        </main>
      </div>
    </div>
  )
}
