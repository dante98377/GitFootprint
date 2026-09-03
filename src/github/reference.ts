export interface GitHubReference {
    ref: string
    node_id: string
    object: {
        sha: string
        type: string
        url: string
    }
}

export async function getBranchReference(
    owner: string,
    repo: string,
    branch: string,
): Promise<GitHubReference> {
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`,
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