import React, { useState } from 'react'
import api from '../api'
import './EditVideoModal.css'

export default function EditVideoModal({ video, onClose, onSaved }) {
  const [title, setTitle] = useState(video.title || '')
  const [description, setDescription] = useState(video.description || '')
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setThumbnail(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('title', title)
      form.append('description', description)
      if (thumbnail) form.append('thumbnail', thumbnail)
      const res = await api.patch(`/videos/${video._id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      const updated = res?.data?.data || res?.data
      onSaved?.(updated)
      onClose?.()
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Pitch</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={save} className="modal-form">
          <div className="form-group">
            <label>Pitch Title</label>
            <input 
              type="text"
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter pitch title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your pitch..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Thumbnail</label>
            <div className="thumbnail-upload">
              <div className="thumbnail-preview">
                <img 
                  src={thumbnailPreview || video.thumbnail} 
                  alt="Thumbnail"
                />
              </div>
              <label className="thumbnail-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
                Change Thumbnail
                <input type="file" accept="image/*" onChange={handleThumbnailChange} hidden />
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
