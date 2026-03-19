import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/api";

const GridIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const BoxIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const TagIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CartIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const ChartIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const HistoryIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const AlertIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const navLinks = [
  { to: "/sales", label: "Sales", icon: CartIcon },
  { to: "/dashboard", label: "Dashboard", icon: GridIcon },
  { to: "/products", label: "Products", icon: BoxIcon },
  { to: "/categories", label: "Categories", icon: TagIcon },
  { to: "/customers", label: "Customers", icon: UsersIcon },
  { to: "/reports", label: "Analytics", icon: ChartIcon },
  { to: "/history", label: "History", icon: HistoryIcon },
  { to: "/alerts", label: "Alerts", icon: AlertIcon },
];

export default function Sidebar() {
  const { logout, getUser } = useAuth();
  const user = getUser();
  const initials = (user?.name ?? user?.email ?? "U").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (_) {
      // Se falhar no backend, segue com logout local para não bloquear o usuário
    } finally {
      logout();
    }
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[216px] flex flex-col z-40"
      style={{
        background: "var(--color-sidebar-bg)",
        borderRight: "1px solid var(--color-border)",
        backdropFilter: "blur(20px)",
        transition: "background 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="px-4 pt-5 pb-[18px]"
        style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="logo-glow relative flex-shrink-0 w-[28px] h-[28px] rounded-[8px] flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #6d6afe 0%, #9b8fff 100%)",
              boxShadow:
                "0 2px 8px rgba(109,106,254,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-semibold text-text-primary tracking-[-0.02em]">
              StockWise
            </span>
          </div>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-md text-text-muted"
            style={{
              background: "var(--color-badge-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            v1
          </span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        <p className="px-2.5 pt-0.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted select-none">
          Navigation
        </p>
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            {({ isActive }) => (
              <>
                <span
                  style={{
                    color: isActive
                      ? "var(--color-text-primary)"
                      : "currentColor",
                    opacity: isActive ? 1 : 0.55,
                    transition: "opacity 0.15s",
                  }}
                >
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
      <div
        className="px-2.5 pb-3 pt-2 space-y-0.5"
        style={{ borderTop: "1px solid var(--color-border-subtle)" }}
      >
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg group transition-colors">
          <div
            className="w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold text-accent"
            style={{
              background: "rgba(109,106,254,0.13)",
              border: "1px solid rgba(109,106,254,0.22)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-text-primary truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-text-muted truncate opacity-60">
              Admin
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-tertiary hover:text-danger hover:bg-danger/10 transition-all"
            title="Logout"
            aria-label="Logout"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
