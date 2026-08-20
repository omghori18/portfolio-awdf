function Header({ name }) {
  return (
    <header className="header">
      <p className="eyebrow">Student Portfolio</p>
      <h1>{name}</h1>
      <p>Building simple, clean, and user-friendly web applications.</p>
    </header>
  )
}

export default Header
