import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const GridIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

const BoxIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const LogoutIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: GridIcon },
  { to: '/products',  label: 'Products',  icon: BoxIcon  },
]

export default function Sidebar() {
  const { logout, getUser } = useAuth()
  const user = getUser()
  const initials = (user?.name ?? user?.email ?? 'U').slice(0, 2).toUpperCase()

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[216px] flex flex-col z-40"
      style={{
        background: 'rgba(9,9,16,0.96)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Logo ── */}
      <div className="px-4 pt-5 pb-[18px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div className="logo-glow relative flex-shrink-0 w-[28px] h-[28px] rounded-[8px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6d6afe 0%, #9b8fff 100%)', boxShadow: '0 2px 8px rgba(109,106,254,0.35), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-semibold text-text-primary tracking-[-0.02em]">StockWise</span>
          </div>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md text-text-muted"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            v1
          </span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-2.5 pt-0.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted select-none">
          Navigation
        </p>
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <span style={{ color: isActive ? '#ededf2' : 'currentColor', opacity: isActive ? 1 : 0.55, transition: 'opacity 0.15s' }}>
                  <Icon />
                </span>
                {label}
                {isActive && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div className="px-2.5 pb-3 pt-2 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* User row */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg">
          <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold text-accent"
            style={{ background: 'rgba(109,106,254,0.13)', border: '1px solid rgba(109,106,254,0.22)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-text-primary leading-tight truncate tracking-[-0.01em]">
              {user?.name ?? 'User'}
            </p>
            <p className="text-[10px] text-text-muted leading-tight truncate mt-px">
              {user?.email ?? ''}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className="nav-item w-full text-left group"
          style={{ color: 'rgba(239,68,68,0.6)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.6)'}
        >
          <span style={{ opacity: 0.7 }}><LogoutIcon /></span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
