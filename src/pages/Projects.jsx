import { useEffect, useMemo, useState } from 'react'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import RepoList from '../components/RepoList'
import SearchBar from '../components/SearchBar'
import { fetchRepositories } from '../services/githubService'

function Projects() {
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadRepositories = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchRepositories()
      setRepositories(data)
    } catch (err) {
      setError(err.message || 'Something went wrong while fetching repositories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRepositories()
  }, [])

  const filteredRepositories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return repositories
    }

    return repositories.filter((repo) => repo.name.toLowerCase().includes(query))
  }, [repositories, searchTerm])

  return (
    <div className="page-shell page-inner">
      <section className="page-heading">
        <div>
          <p className="section-label">PROJECTS</p>
          <h1>My Work</h1>
          <p className="section-subtitle">
            A collection of repositories fetched dynamically from GitHub.
          </p>
        </div>
      </section>

      {loading && <Spinner />}

      {!loading && error && <ErrorMessage message={error} onRetry={loadRepositories} />}

      {!loading && !error && (
        <>
          <SearchBar
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <RepoList repositories={filteredRepositories} />
        </>
      )}
    </div>
  )
}

export default Projects
