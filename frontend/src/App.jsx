import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login          from './pages/Login'
import Register       from './pages/Register'
import Dashboard      from './pages/Dashboard'
import Products       from './pages/Products'
import CreateProduct  from './pages/CreateProduct'
import EditProduct    from './pages/EditProduct'
import Categories     from './pages/Categories'
import CategoryProducts from './pages/CategoryProducts'
import Customers      from './pages/Customers'
import Sales          from './pages/Sales'
import Reports        from './pages/Reports'
import History        from './pages/History'
import Alerts         from './pages/Alerts'

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
