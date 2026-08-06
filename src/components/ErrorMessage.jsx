function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state-card state-card-error" role="alert">
      <p>{message}</p>
      <button type="button" className="button button-primary" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

export default ErrorMessage
