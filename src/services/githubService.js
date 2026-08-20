const GITHUB_USERNAME = 'omghori18'

export async function fetchRepositories() {
  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos`)

  if (!response.ok) {
    throw new Error('Unable to load repositories right now.')
  }

  const data = await response.json()
  return data
}
