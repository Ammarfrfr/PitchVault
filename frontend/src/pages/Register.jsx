import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import './Auth.css'

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // ========== CLIENT-SIDE VALIDATION ==========
    const { fullName, email, username, password } = formData
    
    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!username.trim()) {
      setError('Please choose a username')
      return
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username.trim())) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }
    if (!password) {
      setError('Please create a password')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)

    try {
      const form = new FormData()
      form.append('fullName', fullName.trim())
      form.append('email', email.trim().toLowerCase())
      form.append('username', username.trim().toLowerCase())
      form.append('password', password)
      if (avatar) form.append('avatar', avatar)

      await api.post('/users/register', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      navigate('/login', { state: { message: 'Account created! Please sign in.' } })
    } catch (err) {
      const backendMsg = err?.response?.data?.message
      setError(backendMsg || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container auth-container-wide">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            Pitch<span>Vault</span>
          </Link>
          <h1>Create your account</h1>
          <p>Join thousands of founders sharing their vision</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Avatar Upload */}
          <div className="avatar-upload">
            <label className="avatar-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                hidden
              />
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
              ) : (
                <div className="avatar-placeholder">
                  <span>+</span>
                </div>
              )}
            </label>
            <span className="avatar-hint">Upload photo</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="input-light"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="input-light"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="founder@company.com"
              className="input-light"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-light"
              required
              minLength={8}
            />
            <span className="form-hint">Must be at least 8 characters</span>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
