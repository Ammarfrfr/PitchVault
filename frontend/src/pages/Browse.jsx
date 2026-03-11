import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import VideoCard from '../components/VideoCard'
import './Browse.css'

const SECTORS = [
  'All',
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
]

const STAGES = [
  'All Stages',
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C+',
]

export default function Browse() {
  const [pitches, setPitches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSector, setSelectedSector] = useState('All')
  const [selectedStage, setSelectedStage] = useState('All Stages')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchPitches = async () => {
      setLoading(true)
      try {
        const res = await api.get('/videos', { params: { page: 1, limit: 50 } })
        const list = res?.data?.data?.videos || res?.data?.videos || res?.data?.data || []
        setPitches(list)
      } catch (err) {
        setError(err?.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPitches()
  }, [])

  // Parse pitch meta helper
  const getPitchMeta = (video) => {
    try {
      if (video.pitchMeta) {
        return typeof video.pitchMeta === 'string' ? JSON.parse(video.pitchMeta) : video.pitchMeta
      }
    } catch (e) {}
    return {}
  }

  // Filter pitches
  const filteredPitches = pitches.filter(pitch => {
    const meta = getPitchMeta(pitch)
    
    // Sector filter
    if (selectedSector !== 'All') {
      if (meta.sector !== selectedSector) return false
    }
    
    // Stage filter
    if (selectedStage !== 'All Stages') {
      if (meta.stage !== selectedStage) return false
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const title = (pitch.title || '').toLowerCase()
      const company = (meta.companyName || '').toLowerCase()
      const desc = (pitch.description || '').toLowerCase()
      if (!title.includes(query) && !company.includes(query) && !desc.includes(query)) {
        return false
      }
    }
    
    return true
  })

  return (
    <div className="browse-page">
      <div className="browse-container">
        {/* Header */}
        <div className="browse-header">
          <h1>Browse Pitches</h1>
          <p>Discover startups raising their next round</p>
        </div>

        {/* Filters */}
        <div className="browse-filters">
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search pitches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              value={selectedSector} 
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              {SECTORS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select 
              value={selectedStage} 
              onChange={(e) => setSelectedStage(e.target.value)}
            >
              {STAGES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="browse-loading">
            <div className="spinner-large"></div>
            <p>Loading pitches...</p>
          </div>
        ) : error ? (
          <div className="browse-error">
            <p>Error loading pitches: {error}</p>
          </div>
        ) : filteredPitches.length === 0 ? (
          <div className="browse-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <h2>No pitches found</h2>
            <p>
              {searchQuery || selectedSector !== 'All' || selectedStage !== 'All Stages'
                ? 'Try adjusting your filters'
                : 'Be the first to upload a pitch!'}
            </p>
            <Link to="/upload" className="btn btn-primary">Upload Pitch</Link>
          </div>
        ) : (
          <>
            <div className="browse-results-info">
              <span>{filteredPitches.length} pitch{filteredPitches.length !== 1 ? 'es' : ''} found</span>
            </div>
            <div className="browse-grid">
              {filteredPitches.map(pitch => (
                <VideoCard key={pitch._id} video={pitch} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
