import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService, getErrorMessage } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldFocus, setFieldFocus] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields.')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await authService.register(formData)
      navigate('/login', {
        state: { message: 'Registration successful! Please log in.' }
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--color-surface-0)', transition: 'background 0.25s ease' }}>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.018]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(109,106,254,0.06) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm animate-fade-up">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="logo-glow w-10 h-10 rounded-[10px] bg-accent flex items-center justify-center mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">Create Account</h1>
          <p className="text-sm text-text-muted mt-1">Join our inventory management platform</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-sm text-danger animate-fade-in"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFieldFocus('name')}
                onBlur={() => setFieldFocus('')}
                className="input-field"
                placeholder="Enter your full name"
                style={{
                  borderColor: fieldFocus === 'name' ? 'rgba(109,106,254,0.5)' : undefined,
                  boxShadow: fieldFocus === 'name' ? '0 0 0 3px rgba(109,106,254,0.1)' : undefined,
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFieldFocus('email')}
                onBlur={() => setFieldFocus('')}
                className="input-field"
                placeholder="Enter your email"
                style={{
                  borderColor: fieldFocus === 'email' ? 'rgba(109,106,254,0.5)' : undefined,
                  boxShadow: fieldFocus === 'email' ? '0 0 0 3px rgba(109,106,254,0.1)' : undefined,
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFieldFocus('password')}
                onBlur={() => setFieldFocus('')}
                className="input-field"
                placeholder="Create a password (min. 8 characters)"
                style={{
                  borderColor: fieldFocus === 'password' ? 'rgba(109,106,254,0.5)' : undefined,
                  boxShadow: fieldFocus === 'password' ? '0 0 0 3px rgba(109,106,254,0.1)' : undefined,
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
              style={{
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:text-accent-hover transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}