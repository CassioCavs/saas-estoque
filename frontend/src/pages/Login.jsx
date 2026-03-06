import { useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authService, getErrorMessage } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { saveSession, isAuthenticated } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldFocus, setFieldFocus] = useState('')

  const successMessage = location.state?.message

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
      const { data } = await authService.login({
        username: form.email,  // Backend expects 'username' field
        password: form.password
      })
      const token = data.access_token ?? data.token ?? data.data?.token
      const user  = data.user ?? data.data?.user ?? { email: form.email }
      if (!token) throw new Error('No token received')
      saveSession(token, user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid credentials.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#08080e' }}>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.018]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(109,106,254,0.07) 0%, transparent 65%)' }} />

      <div className="relative w-full max-w-[340px] animate-fade-up">

        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="logo-glow w-[38px] h-[38px] rounded-[11px] flex items-center justify-center mb-4 cursor-default"
            style={{ background: 'linear-gradient(135deg, #6d6afe 0%, #9b8fff 100%)', boxShadow: '0 4px 16px rgba(109,106,254,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h1 className="text-[17px] font-semibold text-text-primary tracking-[-0.025em]">StockWise</h1>
          <p className="text-[12px] text-text-tertiary mt-1 tracking-[-0.005em]">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="card p-5" style={{ background: 'rgba(255,255,255,0.03)', boxShadow: '0 0 0 1px rgba(255,255,255,0.09), 0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          {/* Success message */}
          {successMessage && (
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-[12px] text-success animate-fade-in mb-4"
              style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)' }}>
              <svg className="flex-shrink-0 mt-[1px]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-[12px] text-danger animate-fade-in"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)' }}>
                <svg className="flex-shrink-0 mt-[1px]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-text-tertiary tracking-[-0.005em]" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  id="email" type="email" name="email" value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFieldFocus('email')}
                  onBlur={() => setFieldFocus('')}
                  placeholder="you@company.com"
                  className="input-field"
                  autoComplete="email" autoFocus
                />
                {/* Floating label hint */}
                {fieldFocus === 'email' && form.email && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-accent opacity-70">✓</span>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-text-tertiary tracking-[-0.005em]" htmlFor="password">
                Password
              </label>
              <input
                id="password" type="password" name="password" value={form.password}
                onChange={handleChange}
                onFocus={() => setFieldFocus('password')}
                onBlur={() => setFieldFocus('')}
                placeholder="••••••••"
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            {/* Submit */}
            <div className="pt-0.5">
              <button type="submit" disabled={loading} className="btn-primary w-full" style={{ height: '36px' }}>
                {loading
                  ? <><span className="w-3.5 h-3.5 spinner" /> Signing in…</>
                  : 'Sign in →'
                }
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-5 text-center">
            <p className="text-[12px] text-text-tertiary">
              Don't have an account?{' '}
              <a href="/register" className="text-accent hover:text-accent-hover transition-colors font-medium">
                Create one
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-text-muted mt-5 tracking-[-0.005em]">
          Secure · Encrypted · Private
        </p>
      </div>
    </div>
  )
}
