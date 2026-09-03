export interface GitHubTreeItem {
    path: string
    mode: string
    type: string
    sha: string
    size?: number
    url: string
}

export interface GitHubTree {
    sha: string
    url: string
    tree: GitHubTreeItem[]
    truncated: boolean
}

export async function getRepositoryTree(
    owner: string,
    repo: string,
    treeSha: string,
    recursive = false,
): Promise<GitHubTree> {
    const recursiveQuery = recursive
        ? '?recursive=1'
        : ''

    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}${recursiveQuery}`,
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