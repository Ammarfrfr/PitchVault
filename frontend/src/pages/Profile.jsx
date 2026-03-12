import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import './Profile.css'

// Generate a default avatar with user initials
const getDefaultAvatar = (name) => {
  const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#c9a84c" width="100" height="100"/><text x="50" y="50" font-size="40" fill="#0a0a0a" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-weight="600">${initials}</text></svg>`)}`
}

export default function Profile() {
  const { user, fetchCurrentUser, logout } = useAuth()
  const [avatarFile, setAvatarFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('info')
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  
  // Settings state
  const [activeTab, setActiveTab] = useState('account')
  const [accountForm, setAccountForm] = useState({
    fullName: '',
    email: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Initialize form with user data when user changes
  useEffect(() => {
    if (user) {
      setAccountForm({
        fullName: user.fullName || '',
        email: user.email || ''
      })
    }
  }, [user])

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-empty">
          <h2>Please log in</h2>
          <p>You need to be logged in to view your profile.</p>
          <Link to="/login" className="btn btn-primary">Log In</Link>
        </div>
      </div>
    )
  }

  const showMessage = (msg, type = 'info') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(null), 5000)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const uploadAvatar = async (e) => {
    e.preventDefault()
    if (!avatarFile) return showMessage('Select an avatar file first', 'error')
    setLoading(true)
    try {
      const form = new FormData()
      form.append('avatar', avatarFile)
      await api.patch('/users/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      await fetchCurrentUser()
      setAvatarFile(null)
      setAvatarPreview(null)
      showMessage('Avatar updated successfully!', 'success')
    } catch (err) {
      showMessage(err?.response?.data?.message || err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const uploadCover = async (e) => {
    e.preventDefault()
    if (!coverFile) return showMessage('Select a cover image first', 'error')
    setLoading(true)
    try {
      const form = new FormData()
      form.append('coverImage', coverFile)
      await api.patch('/users/update-cover-image', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      await fetchCurrentUser()
      setCoverFile(null)
      setCoverPreview(null)
      showMessage('Cover image updated successfully!', 'success')
    } catch (err) {
      showMessage(err?.response?.data?.message || err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Update account details
  const handleAccountUpdate = async (e) => {
    e.preventDefault()
    if (!accountForm.fullName && !accountForm.email) {
      return showMessage('Please fill in at least one field', 'error')
    }
    setLoading(true)
    try {
      await api.patch('/users/update-account', {
        fullName: accountForm.fullName,
        email: accountForm.email
      })
      await fetchCurrentUser()
      showMessage('Account details updated successfully!', 'success')
    } catch (err) {
      showMessage(err?.response?.data?.message || err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    const { oldPassword, newPassword, confirmPassword } = passwordForm
    
    // ========== SPECIFIC VALIDATION ==========
    if (!oldPassword) {
      return showMessage('Please enter your current password', 'error')
    }
    if (!newPassword) {
      return showMessage('Please enter a new password', 'error')
    }
    if (!confirmPassword) {
      return showMessage('Please confirm your new password', 'error')
    }
    if (newPassword.length < 8) {
      return showMessage('New password must be at least 8 characters', 'error')
    }
    if (newPassword !== confirmPassword) {
      return showMessage('New passwords do not match', 'error')
    }
    if (oldPassword === newPassword) {
      return showMessage('New password must be different from your current password', 'error')
    }
    
    setLoading(true)
    try {
      await api.patch('/users/change-password', {
        oldPassword,
        newPassword
      })
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      showMessage('Password changed successfully!', 'success')
    } catch (err) {
      // Backend will return specific error messages
      showMessage(err?.response?.data?.message || 'Failed to change password. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Cover Image */}
        <div className="profile-cover">
          {(coverPreview || user.coverImage) ? (
            <img 
              src={coverPreview || user.coverImage} 
              alt="Cover"
            />
          ) : (
            <div className="cover-placeholder"></div>
          )}
          <div className="cover-overlay">
            <label className="cover-upload-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Change Cover
              <input type="file" accept="image/*" onChange={handleCoverChange} hidden />
            </label>
          </div>
        </div>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <img 
                src={avatarPreview || user.avatar || getDefaultAvatar(user.fullName)} 
                alt={user.fullName}
                className="profile-avatar"
              />
              <label className="avatar-upload-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </label>
            </div>
            <div className="profile-info">
              <h1>{user.fullName}</h1>
              <p className="profile-username">@{user.username}</p>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>
          <div className="profile-actions">
            <Link to="/my-pitches" className="btn btn-outline">
              My Pitches
            </Link>
            <button onClick={logout} className="btn btn-secondary">
              Log Out
            </button>
          </div>
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`profile-message ${messageType}`}>
            {message}
          </div>
        )}

        {/* Upload Actions */}
        {(avatarPreview || coverPreview) && (
          <div className="profile-uploads">
            {avatarPreview && (
              <div className="upload-preview-card">
                <h4>New Avatar</h4>
                <img src={avatarPreview} alt="New avatar preview" className="preview-image avatar" />
                <div className="upload-actions">
                  <button onClick={uploadAvatar} disabled={loading} className="btn btn-primary btn-sm">
                    {loading ? 'Uploading...' : 'Save Avatar'}
                  </button>
                  <button onClick={() => { setAvatarFile(null); setAvatarPreview(null) }} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {coverPreview && (
              <div className="upload-preview-card">
                <h4>New Cover</h4>
                <img src={coverPreview} alt="New cover preview" className="preview-image cover" />
                <div className="upload-actions">
                  <button onClick={uploadCover} disabled={loading} className="btn btn-primary btn-sm">
                    {loading ? 'Uploading...' : 'Save Cover'}
                  </button>
                  <button onClick={() => { setCoverFile(null); setCoverPreview(null) }} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div>
              <span className="stat-label">Pitches</span>
              <span className="stat-value">View your uploads</span>
            </div>
            <Link to="/my-pitches" className="stat-link">→</Link>
          </div>
          <div className="stat-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <div>
              <span className="stat-label">New Pitch</span>
              <span className="stat-value">Upload a pitch video</span>
            </div>
            <Link to="/upload" className="stat-link">→</Link>
          </div>
        </div>

        {/* Settings Section */}
        <div className="settings-section">
          <h2>Account Settings</h2>
          
          <div className="settings-tabs">
            <button 
              className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Account Details
            </button>
            <button 
              className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Change Password
            </button>
          </div>

          {/* Account Details Form */}
          {activeTab === 'account' && (
            <form onSubmit={handleAccountUpdate} className="settings-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={accountForm.fullName}
                  onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })}
                  placeholder={user.fullName}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  placeholder={user.email}
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="input-disabled"
                />
                <small className="input-hint">Username cannot be changed</small>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Password Change Form */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="settings-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
