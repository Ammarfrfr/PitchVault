import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { toSecureUrl } from '../api'
import { useAuth } from '../contexts/AuthContext'
import './Home.css'

// Sample pitch data for demo (until backend has real pitches)
const demoPitches = [
  {
    _id: '1',
    companyName: 'NeuralStack AI',
    tagline: 'Automating backend infrastructure with LLMs',
    sector: 'Deep Tech',
    views: 1200,
    thumbnailColor: 'linear-gradient(135deg, #1a1a2e, #16213e)',
  },
  {
    _id: '2',
    companyName: 'GreenRoot',
    tagline: 'Carbon credits marketplace for emerging markets',
    sector: 'Climate',
    views: 890,
    thumbnailColor: 'linear-gradient(135deg, #0d1b0d, #1a3a1a)',
  },
  {
    _id: '3',
    companyName: 'Payloop',
    tagline: 'Cross-border payments for Southeast Asia',
    sector: 'Fintech',
    views: 2100,
    thumbnailColor: 'linear-gradient(135deg, #2a1a0d, #3d2a12)',
  },
  {
    _id: '4',
    companyName: 'MediScan',
    tagline: 'AI diagnostics for tier-2 hospitals',
    sector: 'HealthTech',
    views: 3400,
    thumbnailColor: 'linear-gradient(135deg, #1a0d2a, #2d1a3d)',
  },
]

// Sample investors
const investors = [
  { initials: 'RS', name: 'Rohit Sharma', firm: 'Sequoia India', focus: 'SaaS · AI · Fintech', color: '#1a1a2e' },
  { initials: 'PK', name: 'Priya Kapoor', firm: 'Lightspeed Venture', focus: 'Climate · HealthTech', color: '#0d1b0d' },
  { initials: 'AM', name: 'Arjun Mehta', firm: 'Matrix Partners', focus: 'Consumer · D2C · EdTech', color: '#2a1a0d' },
  { initials: 'SV', name: 'Sneha Verma', firm: 'Accel India', focus: 'Deep Tech · B2B SaaS', color: '#1a0d2a' },
]

export default function Home() {
  const [pitches, setPitches] = useState(demoPitches)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Helper to check auth and redirect
  const requireAuth = (e, targetPath) => {
    if (!user) {
      e.preventDefault()
      navigate('/login', { state: { from: targetPath, message: 'Please sign in to view pitches' } })
    }
  }

  // Fetch real pitches when API is ready
  useEffect(() => {
    const fetchPitches = async () => {
      try {
        const res = await api.get('/videos', { params: { page: 1, limit: 4 } })
        const list = res?.data?.data?.videos || res?.data?.videos || []
        if (list.length > 0) {
          setPitches(list)
        }
      } catch (err) {
        // Keep demo data if API fails
        console.log('Using demo pitches')
      }
    }
    fetchPitches()
  }, [])

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-left">
          <div className="section-tag">For Founders</div>
          <h1>
            Your pitch.<br />
            <em>Their capital.</em><br />
            One platform.
          </h1>
          <p className="hero-sub">
            Upload your founder story. Reach investors who are actively looking. 
            No cold emails. No gatekeepers. Just your vision — seen by the right people.
          </p>
          <div className="hero-actions">
            <Link to={user ? "/upload" : "/login"} className="btn-primary" onClick={(e) => requireAuth(e, '/upload')}>
              Upload Your Pitch
            </Link>
            <Link to="/browse" className="btn-text" onClick={(e) => requireAuth(e, '/browse')}>
              Browse Pitches →
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">2.4K</div>
              <div className="stat-label">Founders</div>
            </div>
            <div className="stat">
              <div className="stat-num">840</div>
              <div className="stat-label">Active Investors</div>
            </div>
            <div className="stat">
              <div className="stat-num">$120M</div>
              <div className="stat-label">Raised via Platform</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="feed-label">Live Pitches</div>
          {pitches.map((pitch, i) => (
            <Link 
              to={user ? (pitch.videoFile ? `/pitch/${pitch._id}` : '/browse') : '/login'} 
              key={pitch._id} 
              className="pitch-card"
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={(e) => requireAuth(e, pitch.videoFile ? `/pitch/${pitch._id}` : '/browse')}
            >
              <div 
                className="pitch-thumb" 
                style={{ background: pitch.thumbnailColor || (pitch.thumbnail ? `url(${toSecureUrl(pitch.thumbnail)})` : 'linear-gradient(135deg, #1a1a2e, #16213e)'), backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="play-btn">▶</div>
              </div>
              <div className="pitch-info">
                <div>
                  <div className="pitch-company">{pitch.companyName || pitch.title}</div>
                  <div className="pitch-tagline">{pitch.tagline || pitch.description?.slice(0, 60)}</div>
                </div>
                <div className="pitch-meta">
                  <span className="sector-badge">{pitch.sector || 'Startup'}</span>
                  <span className="pitch-views">{(pitch.views || 0).toLocaleString()} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how">
        <div className="section-tag">Process</div>
        <h2>Three steps to <em>your</em> next round.</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-title">Upload Your Pitch</div>
            <div className="step-desc">
              Record a 3–5 minute video. Tell your story — the problem, your solution, 
              traction, and what you're raising. No deck required.
            </div>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div className="step-title">Get Discovered</div>
            <div className="step-desc">
              Investors browse by sector, stage, and geography. Your pitch surfaces 
              to the right people based on what they're actively looking for.
            </div>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div className="step-title">Connect Directly</div>
            <div className="step-desc">
              Interested investors reach out via your listed email. No middlemen. 
              No platform fees. Just a direct line to capital.
            </div>
          </div>
        </div>
      </section>

      {/* Investors Section */}
      <section className="section investors-section" id="investors">
        <div className="section-tag">Network</div>
        <h2>Investors <em>actively</em><br />browsing right now.</h2>
        <div className="investor-grid">
          {investors.map((inv, i) => (
            <div key={i} className="investor-card">
              <div className="investor-avatar" style={{ background: inv.color }}>
                {inv.initials}
              </div>
              <div className="investor-name">{inv.name}</div>
              <div className="investor-firm">{inv.firm}</div>
              <div className="investor-focus">{inv.focus}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-wrapper">
          <div className="cta-badge">Start Today</div>
          <h2>Your next investor is<br /><em>already looking.</em></h2>
          <p>
            Join 2,400+ founders who've uploaded their pitch. 
            No gatekeepers. No cold emails. Just your vision—seen by the right people.
          </p>
          <div className="cta-actions">
            <Link to={user ? "/upload" : "/login"} className="btn-primary btn-large" onClick={(e) => requireAuth(e, '/upload')}>
              Upload Your Pitch
            </Link>
            <Link to="/browse" className="btn-outline" onClick={(e) => requireAuth(e, '/browse')}>
              Explore Pitches
            </Link>
          </div>
        </div>
        
        <div className="cta-stats-row">
          <div className="cta-stat">
            <span className="cta-stat-num">$120M+</span>
            <span className="cta-stat-label">Raised via platform</span>
          </div>
          <div className="cta-stat">
            <span className="cta-stat-num">840</span>
            <span className="cta-stat-label">Active investors</span>
          </div>
          <div className="cta-stat">
            <span className="cta-stat-num">48hrs</span>
            <span className="cta-stat-label">Avg. time to first view</span>
          </div>
          <div className="cta-stat">
            <span className="cta-stat-num">15%</span>
            <span className="cta-stat-label">Pitches get funded</span>
          </div>
        </div>
      </section>
    </div>
  )
}
