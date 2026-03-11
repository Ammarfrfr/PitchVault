import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'
import './Video.css'

// Generate avatar with initials
const getInitialsAvatar = (name) => {
  const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#c9a84c" width="100" height="100"/><text x="50" y="50" font-size="40" fill="#0a0a0a" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-weight="600">${initials}</text></svg>`)}`
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Parse pitch meta
const parsePitchMeta = (video) => {
  try {
    if (video.pitchMeta) {
      return typeof video.pitchMeta === 'string' ? JSON.parse(video.pitchMeta) : video.pitchMeta
    }
  } catch (e) {
    return null
  }
  return null
}

export default function Video() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/videos/${id}`)
        const data = res?.data?.data || res?.data

        if (!data || typeof data === 'string' || (typeof data === 'object' && !data.videoFile)) {
          const listRes = await api.get('/videos', { params: { page: 1, limit: 100 } })
          const list = listRes?.data?.data?.videos || listRes?.data?.videos || []
          const found = list.find(v => v._id === id)
          if (found) {
            setVideo(found)
          } else {
            setError('Pitch not found')
          }
        } else {
          setVideo(data)
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchVideo()
  }, [id])

  if (loading) {
    return (
      <div className="pitch-page">
        <div className="pitch-loading">
          <div className="spinner-large"></div>
          <p>Loading pitch...</p>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="pitch-page">
        <div className="pitch-error-state">
          <h2>Pitch Not Found</h2>
          <p>{error || 'This pitch may have been removed or is unavailable.'}</p>
          <Link to="/" className="btn btn-primary">Browse Pitches</Link>
        </div>
      </div>
    )
  }

  const userId = user?._id || user?.id
  const ownerId = typeof video.owner === 'string' ? video.owner : (video.owner?._id || video.owner?.id)
  const isOwner = userId && ownerId && userId === ownerId
  
  const ownerName = video.owner?.fullName || video.owner?.username || 'Unknown'
  const ownerAvatar = video.owner?.avatar || getInitialsAvatar(ownerName)
  
  const pitchMeta = parsePitchMeta(video)
  const companyName = pitchMeta?.companyName || ownerName
  const founderEmail = pitchMeta?.founderEmail
  const sector = pitchMeta?.sector
  const stage = pitchMeta?.stage
  const raisingAmount = pitchMeta?.raisingAmount
  const tagline = pitchMeta?.tagline
  const location = pitchMeta?.location
  const website = pitchMeta?.website
  const linkedIn = pitchMeta?.linkedIn

  return (
    <div className="pitch-page">
      <div className="pitch-content">
        {/* Video Player */}
        <div className="pitch-player-section">
          {video.videoFile ? (
            <video 
              controls 
              src={video.videoFile} 
              className="pitch-player"
              poster={video.thumbnail}
            />
          ) : (
            <div className="pitch-player-fallback">
              <img src={video.thumbnail} alt={video.title} />
              <p>Video playback unavailable</p>
            </div>
          )}
        </div>

        {/* Pitch Details */}
        <div className="pitch-details">
          <div className="pitch-details-main">
            {/* Header */}
            <div className="pitch-header-section">
              {sector && <span className="pitch-sector">{sector}</span>}
              <h1>{video.title}</h1>
              {tagline && <p className="pitch-tagline">{tagline}</p>}
            </div>

            {/* Company & Founder */}
            <div className="pitch-founder-section">
              <img src={ownerAvatar} alt={companyName} className="pitch-founder-avatar" />
              <div className="pitch-founder-info">
                <h3>{companyName}</h3>
                <span>{ownerName}</span>
              </div>
            </div>

            {/* Meta Info */}
            <div className="pitch-meta-grid">
              {stage && (
                <div className="pitch-meta-item">
                  <span className="meta-label">Stage</span>
                  <span className="meta-value">{stage}</span>
                </div>
              )}
              {raisingAmount && (
                <div className="pitch-meta-item">
                  <span className="meta-label">Raising</span>
                  <span className="meta-value">{raisingAmount}</span>
                </div>
              )}
              {location && (
                <div className="pitch-meta-item">
                  <span className="meta-label">Location</span>
                  <span className="meta-value">{location}</span>
                </div>
              )}
              <div className="pitch-meta-item">
                <span className="meta-label">Posted</span>
                <span className="meta-value">{formatDate(video.createdAt)}</span>
              </div>
              <div className="pitch-meta-item">
                <span className="meta-label">Views</span>
                <span className="meta-value">{video.views?.toLocaleString() || 0}</span>
              </div>
            </div>

            {/* Description */}
            <div className="pitch-description">
              <h4>About the Company</h4>
              <p>{video.description}</p>
            </div>

            {/* Links */}
            {(website || linkedIn) && (
              <div className="pitch-links">
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer" className="pitch-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                    Website
                  </a>
                )}
                {linkedIn && (
                  <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="pitch-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="pitch-sidebar">
            {/* Contact Card */}
            <div className="pitch-contact-card">
              <h4>Interested in this pitch?</h4>
              <p>Connect with the founder directly to learn more about this opportunity.</p>
              {founderEmail ? (
                <a href={`mailto:${founderEmail}?subject=Interest in ${companyName} - PitchVault`} className="btn btn-primary btn-block">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Contact Founder
                </a>
              ) : (
                <p className="no-email">Contact information not available</p>
              )}
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="pitch-owner-actions">
                <h4>Manage Pitch</h4>
                <PublishToggle 
                  videoId={video._id} 
                  isPublished={!!video.isPublished} 
                  onChange={(val) => setVideo(prev => ({ ...prev, isPublished: val }))} 
                />
                <DeleteButton 
                  videoId={video._id} 
                  onDeleted={() => navigate('/my-pitches')} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PublishToggle({ videoId, isPublished, onChange }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const toggle = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.patch(`/videos/toggle/publish/${videoId}`)
      const updated = res?.data?.data || res?.data
      onChange(updated?.isPublished ?? !isPublished)
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="publish-toggle">
      <button onClick={toggle} disabled={loading} className={`btn btn-outline btn-block ${isPublished ? '' : 'unpublished'}`}>
        {loading ? 'Updating...' : isPublished ? 'Make Private' : 'Make Public'}
      </button>
      <p className="publish-status">
        Status: <strong>{isPublished ? 'Public' : 'Private'}</strong>
      </p>
      {error && <div className="action-error">{error}</div>}
    </div>
  )
}

function DeleteButton({ videoId, onDeleted }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const doDelete = async () => {
    if (!window.confirm('Delete this pitch? This action cannot be undone.')) return
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/videos/${videoId}`)
      onDeleted?.()
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="delete-action">
      <button onClick={doDelete} disabled={loading} className="btn btn-danger btn-block">
        {loading ? 'Deleting...' : 'Delete Pitch'}
      </button>
      {error && <div className="action-error">{error}</div>}
    </div>
  )
}
