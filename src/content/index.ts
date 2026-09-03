function getRepositoryFromUrl(): { owner: string; repo: string } | null {
  const match = location.pathname.match(/^\/([^/]+)\/([^/]+)/)

  if (!match) {
    return null
  }

  return {
    owner: match[1],
    repo: match[2],
  }
}

async function getRepository(
  owner: string,
  repo: string,
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status}`,
    )
  }

  return response.json()
}

async function main() {
  const repository = getRepositoryFromUrl()

  if (!repository) {
    return
  }

  console.log('GitFootprint loaded')
  console.log('Repository:', repository)

  const data = await getRepository(
    repository.owner,
    repository.repo,
  )

  console.log('GitHub API:', data)
}

main().catch((error) => {
  console.error('GitFootprint:', error)
})