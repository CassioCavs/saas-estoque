import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsService } from "../services/api";

/* ── Icons ─────────────────────────────────────────────────────────── */
const EditIcon = () => (
  <svg
    width="13"
    height="13"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.9}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.9}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

/* ── Stock badge ────────────────────────────────────────────────────── */
function StockBadge({ stock, minStock = 0, unit = "un" }) {
  const s = Number(stock);
  const min = Number(minStock || 0);
  const displayUnit = unit === "un" ? "" : ` ${unit}`;

  if (s === 0)
    return (
      <span
        className="badge text-danger"
        style={{
          background: "rgba(239,68,68,0.09)",
          border: "1px solid rgba(239,68,68,0.22)",
        }}
      >
        <span className="w-1 h-1 rounded-full bg-danger opacity-80" />
        Out of stock
      </span>
    );
  if (s <= min)
    return (
      <span
        className="badge text-warning"
        style={{
          background: "rgba(245,158,11,0.09)",
          border: "1px solid rgba(245,158,11,0.22)",
        }}
      >
        <span className="w-1 h-1 rounded-full bg-warning opacity-80" />
        Low · {s}
        {displayUnit}
      </span>
    );
  return (
    <span
      className="badge text-success"
      style={{
        background: "rgba(34,197,94,0.09)",
        border: "1px solid rgba(34,197,94,0.2)",
      }}
    >
      <span className="w-1 h-1 rounded-full bg-success opacity-80" />
      {s}
      {displayUnit}
    </span>
  );
}

/* ── Delete modal ───────────────────────────────────────────────────── */
function DeleteModal({ product, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
        onClick={onCancel}
      />
      {/* Dialog */}
      <div
        className="relative card animate-fade-up p-6 w-full max-w-[360px]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.09), 0 30px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-4 text-danger"
          style={{
            background: "rgba(239,68,68,0.09)",
            border: "1px solid rgba(239,68,68,0.22)",
          }}
        >
          <TrashIcon size={14} />
        </div>

        <h3 className="text-[14px] font-semibold text-text-primary tracking-[-0.015em] mb-1">
          Delete product
        </h3>
        <p className="text-[12px] text-text-secondary leading-relaxed mb-5">
          Permanently delete{" "}
          <span className="text-text-primary font-medium">
            "{product?.name}"
          </span>
          ? This cannot be undone.
        </p>

        <div className="flex gap-2">
          <button
            className="btn-secondary flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn-danger flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="w-3.5 h-3.5 spinner" />
            ) : (
              <>
                <TrashIcon size={12} /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Loading skeleton ───────────────────────────────────────────────── */
function TableSkeleton() {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="grid gap-4 px-5 py-3"
        style={{
          gridTemplateColumns: "1fr 110px 150px 88px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {["w-12", "w-8", "w-16", "w-10"].map((w, i) => (
          <div key={i} className={`h-2.5 skeleton ${w}`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="grid gap-4 px-5 py-[14px] items-center"
          style={{
            gridTemplateColumns: "1fr 110px 150px 88px",
            borderBottom: "1px solid var(--color-border-subtle)",
            animationDelay: `${i * 0.06}s`,
          }}
        >
          <div className="space-y-1.5">
            <div
              className="skeleton h-2.5"
              style={{ width: `${48 + ((i * 17) % 40)}%` }}
            />
            <div className="skeleton h-2 w-14" />
          </div>
          <div className="skeleton h-2.5 w-16" />
          <div className="skeleton h-5 w-20 rounded-md" />
          <div className="flex justify-end gap-1.5">
            <div className="skeleton w-6 h-6 rounded-md" />
            <div className="skeleton w-6 h-6 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────────────── */
function EmptyState({ onAdd }) {
  return (
    <div className="card flex flex-col items-center justify-center py-[72px] text-center px-8 relative overflow-hidden">
      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Icon */}
      <div className="relative mb-5">
        <div
          className="w-14 h-14 rounded-[16px] flex items-center justify-center"
          style={{
            background: "rgba(109,106,254,0.08)",
            border: "1px solid rgba(109,106,254,0.18)",
          }}
        >
          <svg
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 24 24"
            stroke="rgba(109,106,254,0.7)"
            strokeWidth={1.5}
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        {/* Orbiting dots */}
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{
            background: "rgba(109,106,254,0.3)",
            border: "1px solid rgba(109,106,254,0.4)",
          }}
        />
        <div
          className="absolute -bottom-0.5 -left-1 w-2 h-2 rounded-full"
          style={{
            background: "rgba(167,139,250,0.2)",
            border: "1px solid rgba(167,139,250,0.3)",
          }}
        />
      </div>

      <h3 className="text-[14px] font-semibold text-text-primary tracking-[-0.015em] mb-1.5">
        No products yet
      </h3>
      <p className="text-[12px] text-text-tertiary leading-relaxed mb-6 max-w-[240px]">
        Your inventory is empty. Add your first product to start tracking stock.
      </p>

      <button className="btn-primary" onClick={onAdd}>
        <svg
          width="12"
          height="12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add first product
      </button>
    </div>
  );
}

/* ── Column header ──────────────────────────────────────────────────── */
function ColHeader({ children, align = "left" }) {
  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-[0.07em] text-text-muted select-none ${align === "right" ? "text-right" : ""}`}
    >
      {children}
    </span>
  );
}

/* ── Main ───────────────────────────────────────────────────────────── */
export default function ProductsTable({ products, loading, onRefresh, onAdd }) {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [justDeleted, setJustDeleted] = useState(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await productsService.delete(deleteTarget.id);
      setJustDeleted(deleteTarget.id);
      setTimeout(() => setJustDeleted(null), 800);
      onRefresh();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <TableSkeleton />;
  if (!products || products.length === 0)
    return <EmptyState onAdd={onAdd || (() => navigate("/create-product"))} />;

  const totalValue = products.reduce(
    (s, p) => s + Number(p.price) * Number(p.stock),
    0,
  );

  return (
    <>
      <div className="card overflow-hidden">
        {/* ── Column headers ── */}
        <div
          className="grid gap-4 px-5 py-[11px] items-center"
          style={{
            gridTemplateColumns: "1fr 110px 150px 88px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-badge-bg)",
          }}
        >
          <ColHeader>Product</ColHeader>
          <ColHeader>Price</ColHeader>
          <ColHeader>Stock</ColHeader>
          <ColHeader align="right">Actions</ColHeader>
        </div>

        {/* ── Rows ── */}
        {products.map((product, idx) => {
          const isLeaving = justDeleted === product.id;
          return (
            <div
              key={product.id}
              className="grid gap-4 px-5 items-center row-reveal group relative"
              style={{
                gridTemplateColumns: "1fr 110px 150px 88px",
                borderBottom: "1px solid var(--color-border-subtle)",
                animationDelay: `${idx * 28}ms`,
                height: "52px",
                transition: "background 0.12s, opacity 0.3s",
                background: isLeaving ? "rgba(239,68,68,0.05)" : "transparent",
                opacity: isLeaving ? 0.4 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLeaving)
                  e.currentTarget.style.background =
                    "var(--color-nav-hover-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Left accent line on hover */}
              <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-accent opacity-0 group-hover:opacity-40 transition-opacity duration-150" />

              {/* Name + ID */}
              <div className="min-w-0 pl-1">
                <p className="text-[13px] font-medium text-text-primary truncate tracking-[-0.01em] leading-tight">
                  {product.name}
                </p>
                <p className="text-[10px] text-text-muted font-mono mt-0.5 leading-tight">
                  #{String(product.id).padStart(5, "0")}
                </p>
              </div>

              {/* Price */}
              <span className="text-[13px] font-mono text-text-secondary tabular-nums">
                ${Number(product.price).toFixed(2)}
              </span>

              {/* Stock */}
              <div>
                <StockBadge
                  stock={product.stock}
                  minStock={product.min_stock}
                  unit={product.unit_type}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 translate-x-1 group-hover:translate-x-0">
                <button
                  onClick={() => navigate(`/edit-product/${product.id}`)}
                  title="Edit product"
                  className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center text-text-tertiary hover:text-text-primary transition-all duration-120"
                  style={{
                    background: "rgba(255,255,255,0)",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0)";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => setDeleteTarget(product)}
                  title="Delete product"
                  className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center text-text-tertiary transition-all duration-120"
                  style={{
                    background: "rgba(255,255,255,0)",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
                    e.currentTarget.style.color = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0)";
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.color = "";
                  }}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          );
        })}

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-between px-5 py-[10px]"
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-badge-bg)",
          }}
        >
          <span className="text-[11px] text-text-muted">
            {products.length} {products.length === 1 ? "product" : "products"}
          </span>
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-text-muted">Total value</span>
            <span className="text-text-secondary font-mono ml-1.5">
              ${totalValue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </>
  );
}
