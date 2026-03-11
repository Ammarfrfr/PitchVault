import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import api from '../api'
import './VideoCard.css'

// Generate avatar with initials
const getInitialsAvatar = (name) => {
  const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#c9a84c" width="100" height="100"/><text x="50" y="50" font-size="40" fill="#0a0a0a" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-weight="600">${initials}</text></svg>`)}`
}

// Format duration
const formatDuration = (seconds) => {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

// Parse pitch meta from description if available
const parsePitchMeta = (video) => {
  try {
    // Check if pitchMeta is stored in description as JSON
    if (video.pitchMeta) {
      return typeof video.pitchMeta === 'string' ? JSON.parse(video.pitchMeta) : video.pitchMeta
    }
  } catch (e) {
    return null
  }
  return null
}

export default function VideoCard({ 
  video, 
  onDeleted, 
  showOwner = true, 
  showActions = false,
  selectable = false,
  selected = false,
  onSelectChange,
  onEdit
}) {
  const { user } = useAuth()
  const [deleting, setDeleting] = useState(false)

  if (!video) return null

  const userId = user?._id || user?.id
  const ownerId = typeof video.owner === 'string' ? video.owner : (video.owner?._id || video.owner?.id)
  const isOwner = userId && ownerId && userId === ownerId
  const ownerName = video.owner?.fullName || video.owner?.username || 'Unknown'
  const ownerAvatar = video.owner?.avatar || getInitialsAvatar(ownerName)
  
  const pitchMeta = parsePitchMeta(video)
  const companyName = pitchMeta?.companyName || ownerName
  const sector = pitchMeta?.sector
  const stage = pitchMeta?.stage

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Delete this pitch? This cannot be undone.')) return
    
    setDeleting(true)
    try {
      await api.delete(`/videos/${video._id}`)
      onDeleted?.(video._id)
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete pitch')
    } finally {
      setDeleting(false)
    }
  }

  const handleCheckboxChange = (e) => {
    e.stopPropagation()
    onSelectChange?.(video._id, e.target.checked)
  }

  const handleEditClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(video)
  }

  return (
    <article className={`pitch-card ${selected ? 'selected' : ''}`}>
      {selectable && (
        <label className="pitch-checkbox" onClick={e => e.stopPropagation()}>
          <input 
            type="checkbox" 
            checked={selected} 
            onChange={handleCheckboxChange}
          />
        </label>
      )}

      <Link to={`/pitch/${video._id}`} className="pitch-card-link">
        {/* Thumbnail */}
        <div className="pitch-thumbnail">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            loading="lazy"
          />
          {video.duration && (
            <span className="pitch-duration">{formatDuration(video.duration)}</span>
          )}
          {sector && (
            <span className="pitch-sector-badge">{sector}</span>
          )}
        </div>

        {/* Info */}
        <div className="pitch-info">
          <div className="pitch-header">
            <h3 className="pitch-title">{video.title}</h3>
            {stage && (
              <span className="pitch-stage">{stage}</span>
            )}
          </div>
          
          <div className="pitch-company">
            {showOwner && (
              <img 
                src={ownerAvatar} 
                alt={companyName}
                className="pitch-avatar"
              />
            )}
            <span className="pitch-company-name">{companyName}</span>
          </div>

          <div className="pitch-meta">
            {video.views !== undefined && (
              <span className="pitch-views">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {video.views.toLocaleString()}
              </span>
            )}
            {video.createdAt && (
              <span className="pitch-date">{formatDate(video.createdAt)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Actions for owner */}
      {(showActions || selectable) && isOwner && (
        <div className="pitch-actions">
          <button onClick={handleEditClick} className="pitch-action-btn edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button 
            onClick={handleDelete} 
            disabled={deleting}
            className="pitch-action-btn delete"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      )}
    </article>
  )
}

