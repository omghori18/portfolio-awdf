function Spinner() {
  return (
    <div className="state-card" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>Loading repositories...</p>
    </div>
  )
}

export default Spinner
