import React, { useState } from 'react'
import api from '../api'
import './Upload.css'
import { useNavigate } from 'react-router-dom'
import ImageCropper from '../components/ImageCropper'

const SECTORS = [
  'AI / Machine Learning',
  'FinTech',
  'HealthTech',
  'EdTech',
  'E-Commerce',
  'SaaS',
  'CleanTech',
  'Consumer',
  'Enterprise',
  'Marketplace',
  'Other'
]

const STAGES = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C+',
  'Growth'
]

export default function Upload() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('error')
  
  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [founderEmail, setFounderEmail] = useState('')
  const [sector, setSector] = useState('')
  const [stage, setStage] = useState('')
  const [raisingAmount, setRaisingAmount] = useState('')
  const [tagline, setTagline] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [linkedIn, setLinkedIn] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  
  // Cropper state
  const [showCropper, setShowCropper] = useState(false)
  const [rawThumbnail, setRawThumbnail] = useState(null)

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Store raw image and open cropper
      setRawThumbnail(URL.createObjectURL(file))
      setShowCropper(true)
    }
  }

  const handleCropComplete = (croppedFile, previewUrl) => {
    setThumbnail(croppedFile)
    setThumbnailPreview(previewUrl)
    setShowCropper(false)
    setRawThumbnail(null)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setRawThumbnail(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    
    try {
      const form = new FormData()
      form.append('title', title)
      form.append('description', description)
      
      // Pitch-specific fields (stored in description as JSON for now)
      const pitchMeta = JSON.stringify({
        companyName,
        founderEmail,
        sector,
        stage,
        raisingAmount,
        tagline,
        location,
        website,
        linkedIn
      })
      form.append('pitchMeta', pitchMeta)
      
      if (videoFile) form.append('videoFile', videoFile)
      if (thumbnail) form.append('thumbnail', thumbnail)

      await api.post('/videos', form, { 
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setMessageType('success')
      setMessage('Pitch uploaded successfully! Redirecting...')
      setTimeout(() => navigate('/my-pitches'), 1500)
    } catch (err) {
      setMessageType('error')
      setMessage(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-page">
      {/* Image Cropper Modal */}
      {showCropper && rawThumbnail && (
        <ImageCropper
          image={rawThumbnail}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      
      <div className="upload-container">
        <div className="upload-header">
          <span className="upload-tag">Submit Your Pitch</span>
          <h1>Share Your Vision</h1>
          <p>Upload your pitch video and connect with investors looking for their next opportunity.</p>
        </div>

        {message && (
          <div className={`upload-message ${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={submit} className="upload-form">
          {/* Video Upload Section */}
          <div className="upload-section">
            <h3>Pitch Video</h3>
            <div className="upload-media-grid">
              <div className="upload-media-box">
                <label htmlFor="video-upload" className="upload-dropzone">
                  {videoPreview ? (
                    <video src={videoPreview} className="upload-preview" />
                  ) : (
                    <>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Upload Video</span>
                      <small>MP4, MOV up to 100MB</small>
                    </>
                  )}
                </label>
                <input 
                  type="file" 
                  id="video-upload" 
                  accept="video/*" 
                  onChange={handleVideoChange}
                  hidden 
                  required
                />
              </div>

              <div className="upload-media-box">
                <label htmlFor="thumb-upload" className="upload-dropzone">
                  {thumbnailPreview ? (
                    <div className="thumbnail-preview-wrapper">
                      <img src={thumbnailPreview} alt="Thumbnail preview" className="upload-preview" />
                      <div className="thumbnail-overlay">
                        <span className="aspect-badge">16:9</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Upload Thumbnail</span>
                      <small>JPG, PNG — Cropped to 16:9</small>
                    </>
                  )}
                </label>
                <input 
                  type="file" 
                  id="thumb-upload" 
                  accept="image/*" 
                  onChange={handleThumbnailChange}
                  hidden 
                />
              </div>
            </div>
          </div>

          {/* Company Info Section */}
          <div className="upload-section">
            <h3>Company Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name *</label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Email *</label>
                <input 
                  type="email" 
                  value={founderEmail} 
                  onChange={e => setFounderEmail(e.target.value)}
                  placeholder="founder@company.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Sector *</label>
                <select value={sector} onChange={e => setSector(e.target.value)} required>
                  <option value="">Select sector</option>
                  {SECTORS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Stage *</label>
                <select value={stage} onChange={e => setStage(e.target.value)} required>
                  <option value="">Select stage</option>
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Raising Amount</label>
                <input 
                  type="text" 
                  value={raisingAmount} 
                  onChange={e => setRaisingAmount(e.target.value)}
                  placeholder="$500K - $1M"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>
          </div>

          {/* Pitch Details Section */}
          <div className="upload-section">
            <h3>Pitch Details</h3>
            <div className="form-group full-width">
              <label>Pitch Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="AI-Powered Analytics for Enterprise"
                required
              />
            </div>
            <div className="form-group full-width">
              <label>One-Line Tagline</label>
              <input 
                type="text" 
                value={tagline} 
                onChange={e => setTagline(e.target.value)}
                placeholder="Turning data into decisions"
                maxLength={100}
              />
            </div>
            <div className="form-group full-width">
              <label>Description *</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                placeholder="Tell investors about your company, the problem you're solving, and your vision..."
                rows={5}
                required
              />
            </div>
          </div>

          {/* Links Section */}
          <div className="upload-section">
            <h3>Links (Optional)</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Website</label>
                <input 
                  type="url" 
                  value={website} 
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              </div>
              <div className="form-group">
                <label>LinkedIn</label>
                <input 
                  type="url" 
                  value={linkedIn} 
                  onChange={e => setLinkedIn(e.target.value)}
                  placeholder="https://linkedin.com/in/founder"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg upload-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Uploading...
              </>
            ) : (
              <>
                Submit Pitch
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
