import { githubFetch } from './api'

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

const MAX_TREE_REQUESTS = 30
const TREE_REQUEST_DELAY = 100

function delay(
    milliseconds: number,
): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds)
    })
}

export async function getRepositoryTree(
    owner: string,
    repo: string,
    branch: string,
): Promise<GitHubTree> {
    const response = await githubFetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    )

    return response.json()
}

export async function getTree(
    owner: string,
    repo: string,
    treeSha: string,
): Promise<GitHubTree> {
    const response = await githubFetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}`,
    )

    return response.json()
}

export async function getCompleteRepositoryTree(
    owner: string,
    repo: string,
    branch: string,
): Promise<GitHubTree> {
    const tree = await getRepositoryTree(
        owner,
        repo,
        branch,
    )

    if (!tree.truncated) {
        return tree
    }

    const rootTree = await getTree(
        owner,
        repo,
        tree.sha,
    )

    const files: GitHubTreeItem[] = []

    const queue: string[] = [rootTree.sha]

    let queueIndex = 0
    let treeRequests = 0

    const visited = new Set<string>()

    while (queueIndex < queue.length) {
        const treeSha = queue[queueIndex]

        queueIndex++

        if (visited.has(treeSha)) {
            continue
        }

        if (treeRequests >= MAX_TREE_REQUESTS) {
            return {
                ...rootTree,
                tree: files,
                truncated: true,
            }
        }

        visited.add(treeSha)

        if (treeRequests > 0) {
            await delay(
                TREE_REQUEST_DELAY,
            )
        }

        treeRequests++

        const currentTree = await getTree(
            owner,
            repo,
            treeSha,
        )

        for (const item of currentTree.tree) {
            if (item.type === 'blob') {
                files.push(item)

                continue
            }

            if (item.type === 'tree') {
                queue.push(item.sha)
            }
        }
    }

    return {
        ...rootTree,
        tree: files,
        truncated: false,
    }
}