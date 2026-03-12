import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // Get redirect path and message from state
  const from = location.state?.from || '/'
  const authMessage = location.state?.message || null
  const registerMessage = location.state?.message // from register page

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    // ========== CLIENT-SIDE VALIDATION ==========
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Please enter your email or username')
      return
    }
    if (!password) {
      setError('Please enter your password')
      return
    }

    setLoading(true)

    try {
      const payload = { password }
      const normalized = trimmedEmail.toLowerCase()
      if (normalized.includes('@')) {
        payload.email = normalized
      } else {
        payload.username = normalized
      }

      await login(payload)
      navigate(from, { replace: true })
    } catch (err) {
      // Use backend error message if available, otherwise show generic
      const backendMsg = err?.response?.data?.message
      setError(backendMsg || 'Login failed. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            Pitch<span>Vault</span>
          </Link>
          <h1>Welcome back</h1>
          <p>Sign in to continue to your dashboard</p>
        </div>

        {/* Auth required message */}
        {authMessage && !error && (
          <div className="auth-info">{authMessage}</div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@company.com"
              className="input-light"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-light"
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
