import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import VideoCard from '../components/VideoCard'
import EditVideoModal from '../components/EditVideoModal'
import { useAuth } from '../contexts/AuthContext'
import './MyVideos.css'

export default function MyVideos() {
  const { user, loading: authLoading } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // selection and pending delete state
  const [selected, setSelected] = useState(() => new Set())
  const [pendingDeletes, setPendingDeletes] = useState(() => ({}))
  const pendingDeletesRef = useRef({})

  // edit modal
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    const fetchMyVideos = async () => {
      setLoading(true)
      try {
        const res = await api.get('/videos', { params: { page: 1, limit: 200 } })
        const list = res?.data?.data?.videos || res?.data?.videos || res?.data?.data || []
        
        const currentUserId = user._id || user.id
        
        const filtered = list.filter(v => {
          if (!v || !v.owner) return false
          const ownerId = typeof v.owner === 'string' ? v.owner : (v.owner._id || v.owner.id)
          return ownerId === currentUserId
        })
        
        setVideos(filtered)
      } catch (err) {
        setError(err?.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchMyVideos()
    }
  }, [authLoading, user])

  const handleSelectChange = (id, isChecked) => {
    setSelected(prev => {
      const copy = new Set(prev)
      if (isChecked) copy.add(id)
      else copy.delete(id)
      return copy
    })
  }

  const selectAll = (checked) => {
    if (checked) {
      setSelected(new Set(videos.map(v => v._id)))
    } else {
      setSelected(new Set())
    }
  }

  const scheduleDelete = (ids = []) => {
    const delay = 7000
    const timeouts = {}
    ids.forEach(id => {
      if (pendingDeletesRef.current[id]) return
      const t = setTimeout(async () => {
        try {
          await api.delete(`/videos/${id}`)
        } catch (err) {
          console.error('delete failed', err)
        }
        setVideos(prev => prev.filter(v => v._id !== id))
        setPendingDeletes(prev => {
          const copy = { ...prev }
          delete copy[id]
          pendingDeletesRef.current = copy
          return copy
        })
      }, delay)
      timeouts[id] = t
    })

    setPendingDeletes(prev => {
      const copy = { ...prev, ...timeouts }
      pendingDeletesRef.current = copy
      return copy
    })
    setSelected(prev => {
      const copy = new Set(prev)
      ids.forEach(id => copy.delete(id))
      return copy
    })
  }

  const cancelPending = (ids = []) => {
    setPendingDeletes(prev => {
      const copy = { ...prev }
      ids.forEach(id => {
        const t = copy[id]
        if (t) clearTimeout(t)
        delete copy[id]
      })
      pendingDeletesRef.current = copy
      return copy
    })
  }

  const handleBulkDelete = () => {
    if (selected.size === 0) return
    const ids = Array.from(selected)
    scheduleDelete(ids)
  }

  const handleDeleted = (id) => {
    setVideos(prev => prev.filter(v => v._id !== id))
  }

  const openEdit = (video) => {
    setEditing(video)
  }

  const onSaved = (updated) => {
    setVideos(prev => prev.map(v => v._id === updated._id ? updated : v))
  }

  const pendingCount = Object.keys(pendingDeletes).length

  if (authLoading) {
    return (
      <div className="mypitches-page">
        <div className="mypitches-loading">
          <div className="spinner-large"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mypitches-page">
        <div className="mypitches-empty">
          <h2>Please log in</h2>
          <p>You need to be logged in to view your pitches.</p>
          <Link to="/login" className="btn btn-primary">Log In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mypitches-page">
      <div className="mypitches-container">
        <div className="mypitches-header">
          <div>
            <h1>My Pitches</h1>
            <p>Manage your uploaded pitch videos</p>
          </div>
          <Link to="/upload" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Pitch
          </Link>
        </div>

        {/* Management Bar */}
        <div className="management-bar">
          <div className="management-left">
            <label className="select-all">
              <input 
                type="checkbox" 
                onChange={e => selectAll(e.target.checked)} 
                checked={selected.size === videos.length && videos.length > 0} 
              />
              <span>Select all</span>
            </label>
            <span className="pitch-count">{videos.length} pitch{videos.length !== 1 ? 'es' : ''}</span>
          </div>
          <div className="management-right">
            {selected.size > 0 && (
              <button onClick={handleBulkDelete} className="btn btn-danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                Delete ({selected.size})
              </button>
            )}
          </div>
        </div>

        {/* Undo Toast */}
        {pendingCount > 0 && (
          <div className="undo-toast">
            <span>{pendingCount} pitch{pendingCount !== 1 ? 'es' : ''} will be deleted</span>
            <button onClick={() => cancelPending(Object.keys(pendingDeletes))}>Undo</button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="mypitches-loading">
            <div className="spinner-large"></div>
            <p>Loading your pitches...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="mypitches-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h2>No pitches yet</h2>
            <p>Upload your first pitch video to get discovered by investors.</p>
            <Link to="/upload" className="btn btn-primary">Upload Your First Pitch</Link>
          </div>
        ) : (
          <div className="mypitches-grid">
            {videos.map(v => (
              <VideoCard
                key={v._id}
                video={v}
                onDeleted={handleDeleted}
                selectable={true}
                selected={selected.has(v._id)}
                onSelectChange={handleSelectChange}
                onEdit={openEdit}
              />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <EditVideoModal 
          video={editing} 
          onClose={() => setEditing(null)} 
          onSaved={onSaved} 
        />
      )}
    </div>
  )
}
