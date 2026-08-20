function RepoList({ repositories }) {
  if (!repositories.length) {
    return (
      <div className="state-card">
        <p>No repositories matched your search.</p>
      </div>
    )
  }

  return (
    <div className="project-grid">
      {repositories.map((repo) => (
        <article key={repo.id} className="project-card">
          <div>
            <h2>{repo.name}</h2>
            <p>{repo.description || 'No description provided.'}</p>
          </div>
          <div className="project-meta">
            <div className="tech-badges">
              <span>{repo.language || 'Code'}</span>
              <span>⭐ {repo.stargazers_count}</span>
            </div>
            <div className="project-actions">
              <a
                className="button button-outline"
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
              >
                View Repo
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export default RepoList
