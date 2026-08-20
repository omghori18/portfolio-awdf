import { Link } from 'react-router-dom'
import Header from '../data/Header'
import About from '../data/About'
import Skills from '../data/Skills'
import Footer from '../data/Footer'

function Home() {
  const skills = ['React', 'JavaScript', 'CSS', 'Git']

  return (
    <div className="page-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-label">STUDENT PORTFOLIO</span>
          <h1>Om Ghori</h1>
          <p className="hero-description">
            I create polished React interfaces with thoughtful spacing, accessible
            components, and modern visual rhythm.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" to="/projects">
              View Projects
            </Link>
            <Link className="button button-secondary" to="/contact">
              Contact Me
            </Link>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <Header name="Om Ghori" />
        <div className="detail-grid">
          <About
            title="About Me"
            description="I am a student developer who enjoys building accessible and polished web experiences with modern React tools."
          />
          <Skills skillList={skills} />
        </div>
      </section>

      <Footer name="Om Ghori" />
    </div>
  )
}

export default Home
