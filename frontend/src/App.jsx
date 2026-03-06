import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login      from './pages/Login'
import Register   from './pages/Register'
import Dashboard      from './pages/Dashboard'
import Products       from './pages/Products'
import CreateProduct  from './pages/CreateProduct'
import EditProduct    from './pages/EditProduct'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — Layout handles the auth redirect */}
        <Route path="/dashboard"         element={<Dashboard />} />
        <Route path="/products"          element={<Products />} />
        <Route path="/create-product"    element={<CreateProduct />} />
        <Route path="/edit-product/:id"  element={<EditProduct />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
