import { githubFetch } from './api'

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
    const response = await githubFetch(
        `https://api.github.com/repos/${owner}/${repo}`,
    )

    return response.json()
}