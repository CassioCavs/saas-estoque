import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Lazy load pages to reduce main bundle size
const Login          = lazy(() => import('./pages/Login'))
const Register       = lazy(() => import('./pages/Register'))
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const Products       = lazy(() => import('./pages/Products'))
const CreateProduct  = lazy(() => import('./pages/CreateProduct'))
const EditProduct    = lazy(() => import('./pages/EditProduct'))
const Categories     = lazy(() => import('./pages/Categories'))
const CategoryProducts = lazy(() => import('./pages/CategoryProducts'))
const Customers      = lazy(() => import('./pages/Customers'))
const Sales          = lazy(() => import('./pages/Sales'))
const Reports        = lazy(() => import('./pages/Reports'))
const History        = lazy(() => import('./pages/History'))
const Alerts         = lazy(() => import('./pages/Alerts'))

export default function App() {
  return (
    <BrowserRouter>
      {/* Fallback spinner matching application theme */}
      <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="w-10 h-10 border-4 border-white/10 border-t-accent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/dashboard"         element={<Dashboard />} />
          <Route path="/products"          element={<Products />} />
          <Route path="/create-product"    element={<CreateProduct />} />
          <Route path="/edit-product/:id"  element={<EditProduct />} />
          <Route path="/categories"        element={<Categories />} />
          <Route path="/categories/:id/products" element={<CategoryProducts />} />
          <Route path="/customers"         element={<Customers />} />
          <Route path="/sales"             element={<Sales />} />
          <Route path="/reports"           element={<Reports />} />
          <Route path="/history"           element={<History />} />
          <Route path="/alerts"            element={<Alerts />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
