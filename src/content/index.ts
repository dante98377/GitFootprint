import { getRepository } from '../github/repository'
import { getBranchReference } from '../github/reference'
import { getCommit } from '../github/commit'
import { getRepositoryTree } from '../github/tree'

function getRepositoryFromUrl(): {
    owner: string
    repo: string
} | null {
    const match = location.pathname.match(
        /^\/([^/]+)\/([^/]+)/,
    )

    if (!match) {
        return null
    }

    return {
        owner: match[1],
        repo: match[2],
    }
}

function formatSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`
    }

    if (bytes < 1024 ** 2) {
        return `${(bytes / 1024).toFixed(1)} KB`
    }

    if (bytes < 1024 ** 3) {
        return `${(bytes / 1024 ** 2).toFixed(1)} MB`
    }

    return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

function calculateTreeSize(
    tree: Awaited<ReturnType<typeof getRepositoryTree>>,
): number {
    return tree.tree
        .filter(item => item.type === 'blob')
        .reduce((total, item) => {
            return total + (item.size ?? 0)
        }, 0)
}

async function main(): Promise<void> {
    const repository = getRepositoryFromUrl()

    if (!repository) {
        return
    }

    console.log(
        'GitFootprint: repository',
        repository,
    )

    const data = await getRepository(
        repository.owner,
        repository.repo,
    )

    console.log(
        'GitFootprint: repository data',
        data,
    )

    const reference = await getBranchReference(
        repository.owner,
        repository.repo,
        data.default_branch,
    )

    console.log(
        'GitFootprint: branch reference',
        reference,
    )

    const commit = await getCommit(
        repository.owner,
        repository.repo,
        reference.object.sha,
    )

    console.log(
        'GitFootprint: commit',
        commit,
    )

    const tree = await getRepositoryTree(
        repository.owner,
        repository.repo,
        commit.tree.sha,
        true,
    )

    console.log(
        'GitFootprint: tree',
        tree,
    )

    const currentFilesSize = calculateTreeSize(tree)

    console.log(
        'GitFootprint: current files size',
        formatSize(currentFilesSize),
    )

    const about = [
        ...document.querySelectorAll(
            'h2[data-component="Heading"]',
        ),
    ].find(
        element =>
            element.textContent?.trim() === 'About',
    )

    if (!about) {
        console.log(
            'GitFootprint: About section not found',
        )

        return
    }

    if (
        document.querySelector(
            '.my-extension-element',
        )
    ) {
        return
    }

    const myDiv = document.createElement('div')

    myDiv.className =
        'my-extension-element'

    myDiv.innerText =
        `Repository size: ${formatSize(data.size * 1024)}\n` +
        `Current files: ${formatSize(currentFilesSize)}`

    about.parentElement?.after(myDiv)
}

main().catch(error => {
    console.error(
        'GitFootprint:',
        error,
    )
})