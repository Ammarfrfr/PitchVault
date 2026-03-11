import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './HowItWorks.css'

export default function HowItWorks() {
  const { user } = useAuth()

  return (
    <div className="how-page">
      {/* Hero */}
      <section className="how-hero">
        <div className="section-tag">The Process</div>
        <h1>From pitch to <em>funded</em><br />in three steps.</h1>
        <p>PitchVault removes the friction between founders and investors. No cold emails, no gatekeepers — just your story, seen by the right people.</p>
      </section>

      {/* Steps */}
      <section className="how-steps">
        <div className="step-card">
          <div className="step-number">01</div>
          <div className="step-content">
            <h3>Upload Your Pitch</h3>
            <p>
              Record a 3–5 minute video telling your story. Cover the problem you're solving, 
              your solution, current traction, and what you're raising. No polished deck required — 
              authenticity wins.
            </p>
            <ul className="step-list">
              <li>Video uploads up to 100MB</li>
              <li>Add company details & contact info</li>
              <li>Choose your sector & funding stage</li>
              <li>Set a custom thumbnail</li>
            </ul>
          </div>
          <div className="step-visual">
            <div className="visual-card upload-visual">
              <div className="visual-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span>pitch_video.mp4</span>
            </div>
          </div>
        </div>

        <div className="step-card reverse">
          <div className="step-number">02</div>
          <div className="step-content">
            <h3>Get Discovered</h3>
            <p>
              Your pitch enters our curated marketplace where investors actively browse. 
              They filter by sector, stage, and geography — so your pitch surfaces to 
              people looking for exactly what you're building.
            </p>
            <ul className="step-list">
              <li>Searchable by sector & stage</li>
              <li>View counts & engagement metrics</li>
              <li>Featured pitch opportunities</li>
              <li>No algorithm games — quality wins</li>
            </ul>
          </div>
          <div className="step-visual">
            <div className="visual-card discover-visual">
              <div className="filter-pills">
                <span className="pill active">SaaS</span>
                <span className="pill">Fintech</span>
                <span className="pill">Seed</span>
              </div>
              <div className="mini-cards">
                <div className="mini-card"></div>
                <div className="mini-card"></div>
                <div className="mini-card"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="step-card">
          <div className="step-number">03</div>
          <div className="step-content">
            <h3>Connect Directly</h3>
            <p>
              Interested investors reach out via your listed email. No middlemen, no platform fees, 
              no awkward intros. Just a direct line from your pitch to potential capital.
            </p>
            <ul className="step-list">
              <li>Your email stays private until you share</li>
              <li>Direct founder-investor communication</li>
              <li>No commission or success fees</li>
              <li>Full control over your fundraise</li>
            </ul>
          </div>
          <div className="step-visual">
            <div className="visual-card connect-visual">
              <div className="email-preview">
                <div className="email-header">
                  <span className="email-dot"></span>
                  <span className="email-dot"></span>
                  <span className="email-dot"></span>
                </div>
                <div className="email-body">
                  <div className="email-line short"></div>
                  <div className="email-line"></div>
                  <div className="email-line"></div>
                  <div className="email-line medium"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="how-faq">
        <div className="section-tag">FAQ</div>
        <h2>Common questions</h2>
        
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Is PitchVault free for founders?</h4>
            <p>Yes, completely. Upload your pitch, get discovered, and connect with investors — all at no cost. We believe in removing barriers to fundraising.</p>
          </div>
          <div className="faq-item">
            <h4>What makes a good pitch video?</h4>
            <p>Authenticity over production value. Cover your problem, solution, traction, team, and ask. 3-5 minutes is the sweet spot. Investors want to see the founder, not a marketing video.</p>
          </div>
          <div className="faq-item">
            <h4>How do investors find my pitch?</h4>
            <p>Investors browse and filter by sector, funding stage, and keywords. The more complete your profile, the more discoverable you become.</p>
          </div>
          <div className="faq-item">
            <h4>Can I update my pitch later?</h4>
            <p>Absolutely. Edit your video, thumbnail, company details, or contact info anytime from your dashboard. Keep it fresh as your startup evolves.</p>
          </div>
          <div className="faq-item">
            <h4>Is my email shared publicly?</h4>
            <p>Your contact email is visible to logged-in users viewing your pitch. This allows interested investors to reach out directly.</p>
          </div>
          <div className="faq-item">
            <h4>What funding stages are supported?</h4>
            <p>Pre-seed through Growth. Whether you're raising your first check or scaling up, there's a place for your pitch.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="how-cta">
        <h2>Ready to share <em>your story?</em></h2>
        <p>Join thousands of founders who've found their investors on PitchVault.</p>
        <div className="how-cta-actions">
          {user ? (
            <Link to="/upload" className="btn-primary btn-large">Upload Your Pitch</Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary btn-large">Get Started Free</Link>
              <Link to="/login" className="btn-outline">Sign In</Link>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
