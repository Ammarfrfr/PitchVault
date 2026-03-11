import { useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

export default function Layout({ children }) {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isHome = location.pathname === '/'

  const handleLogout = async () => {
    await logout()
    setMobileMenuOpen(false)
    navigate('/')
  }

  // Handle auth-gated navigation
  const handleProtectedClick = (e, path) => {
    if (!user) {
      e.preventDefault()
      setMobileMenuOpen(false)
      navigate('/login', { state: { from: path, message: 'Please sign in to continue' } })
    }
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="layout">
      {/* Navigation */}
      <nav className={`nav ${isHome ? 'nav-home' : ''}`}>
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          Pitch<span>Vault</span>
        </Link>

        <ul className="nav-links">
          <li>
            <NavLink 
              to={user ? "/browse" : "/login"} 
              onClick={(e) => handleProtectedClick(e, '/browse')}
            >
              Browse Pitches
            </NavLink>
          </li>
          <li><NavLink to="/how-it-works">How it works</NavLink></li>
          {user ? (
            <>
              <li><NavLink to="/upload">Upload Pitch</NavLink></li>
              <li><NavLink to="/my-pitches">My Pitches</NavLink></li>
              <li><NavLink to="/profile">Profile</NavLink></li>
              <li>
                <button onClick={handleLogout} className="nav-link-btn">
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li><NavLink to="/login">Sign In</NavLink></li>
              <li>
                <Link to="/register" className="nav-cta">Get Started</Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile menu button */}
        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`} 
          aria-label="Menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <ul className="mobile-nav-links">
              <li>
                <NavLink 
                  to={user ? "/browse" : "/login"} 
                  onClick={(e) => {
                    handleProtectedClick(e, '/browse')
                    closeMobileMenu()
                  }}
                >
                  Browse Pitches
                </NavLink>
              </li>
              <li>
                <NavLink to="/how-it-works" onClick={closeMobileMenu}>
                  How it works
                </NavLink>
              </li>
              {user ? (
                <>
                  <li>
                    <NavLink to="/upload" onClick={closeMobileMenu}>
                      Upload Pitch
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/my-pitches" onClick={closeMobileMenu}>
                      My Pitches
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/profile" onClick={closeMobileMenu}>
                      Profile
                    </NavLink>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="mobile-nav-btn">
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <NavLink to="/login" onClick={closeMobileMenu}>
                      Sign In
                    </NavLink>
                  </li>
                  <li>
                    <Link to="/register" className="mobile-nav-cta" onClick={closeMobileMenu}>
                      Get Started
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              Pitch<span>Vault</span>
            </div>
            <p className="footer-tagline">
              Where founders meet capital.<br />
              No cold emails. No gatekeepers.
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/browse">Browse Pitches</Link></li>
                <li><Link to="/upload">Upload Pitch</Link></li>
                <li><Link to="/how-it-works">How It Works</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <ul>
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Get Started</Link></li>
                <li><Link to="/profile">Profile</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><Link to="#">Terms of Service</Link></li>
                <li><Link to="#">Privacy Policy</Link></li>
                <li><Link to="#">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-copy">
            © {new Date().getFullYear()} PitchVault. Built for founders, by founders.
          </div>
        </div>
      </footer>
    </div>
  )
}
