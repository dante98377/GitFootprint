export interface GitHubRepository {
    name: string
    full_name: string
    size: number
    default_branch: string
}

export async function getRepository(
    owner: string,
    repo: string,
): Promise<GitHubRepository> {
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