export interface GitHubCommit {
    sha: string
    tree: {
        sha: string
        url: string
    }
}

export async function getCommit(
    owner: string,
    repo: string,
    commitSha: string,
): Promise<GitHubCommit> {
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/commits/${commitSha}`,
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