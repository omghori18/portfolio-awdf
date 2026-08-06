import { useState } from 'react'

function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'Please enter your full name.'
    }

    if (!email.trim()) {
      nextErrors.email = 'Please enter your email address.'
    } else if (!email.includes('@')) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!subject.trim()) {
      nextErrors.subject = 'Please enter a subject.'
    }

    if (!message.trim()) {
      nextErrors.message = 'Please enter a message.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      setSuccessMessage('Message submitted successfully!')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setShowHelp(false)
    } else {
      setSuccessMessage('')
    }
  }

  const handleMessageChange = (event) => {
    const value = event.target.value
    if (value.length <= 500) {
      setMessage(value)
    }
  }

  return (
    <div className="page-shell page-inner">
      <section className="page-heading">
        <div>
          <p className="section-label">CONTACT</p>
          <h1>Let&apos;s Connect</h1>
          <p className="section-subtitle">
            Have a question, internship opportunity, collaboration idea, or just want to say hello? Fill out the form below and I&apos;ll get back to you.
          </p>
        </div>
      </section>

      <section className="contact-card card">
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="input-field"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="Enter your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              className="input-field"
              placeholder="Enter a subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
            {errors.subject && <p className="field-error">{errors.subject}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              className="input-field"
              placeholder="Type your message here..."
              value={message}
              onChange={handleMessageChange}
              rows={6}
            />
            {errors.message && <p className="field-error">{errors.message}</p>}
          </div>

          <div className="message-preview-card">
            <div className="message-preview-header">
              <h2>Live Message Preview</h2>
            </div>
            <div className="message-preview-body">
              {message.trim() ? (
                <pre className="message-preview-content">{message}</pre>
              ) : (
                <p className="message-preview-placeholder">Your message will appear here...</p>
              )}
            </div>
          </div>

          <div className="contact-row">
            <span className="character-count">Characters: {message.length} / 500</span>
            <button
              type="button"
              className="button button-outline"
              onClick={() => setShowHelp((current) => !current)}
            >
              {showHelp ? 'Hide Help' : 'Show Help'}
            </button>
          </div>

          {showHelp && (
            <div className="help-box">
              Start with a short greeting, mention your goal, and share what you&apos;re looking to build.
            </div>
          )}

          <div className="form-footer">
            <button type="submit" className="button button-primary">
              Send Message
            </button>
            {successMessage && <p className="success-message">{successMessage}</p>}
          </div>
        </form>
      </section>
    </div>
  )
}

export default Contact
