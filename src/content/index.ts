import { getRepository } from '../github/repository'
import { getCompleteRepositoryTree } from '../github/tree'

function getRepositoryFromUrl(): {
    owner: string
    repo: string
} | null {
    const match = location.pathname.match(
        /^\/([^/]+)\/([^/]+)/
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

function calculateSnapshotSize(
    tree: Awaited<
        ReturnType<typeof getCompleteRepositoryTree>
    >,
): number {
    return tree.tree
        .filter(item => item.type === 'blob')
        .reduce((total, item) => {
            return total + (item.size ?? 0)
        }, 0)
}

function injectStyles(): void {
    if (document.querySelector('#gitfootprint-styles')) {
        return
    }

    const style = document.createElement('style')

    style.id = 'gitfootprint-styles'

    style.textContent = `
        .my-extension-element {
            margin-bottom: 6px;
            font-size: 12px;
            color: var(--fgColor-default, #1f2328);
        }

        .gitfootprint-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
            font-size: 12px;
            font-weight: 600;
        }

        .gitfootprint-icon {
            font-size: 9px;
        }

        .gitfootprint-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            padding: 4px 0;
        }

        .gitfootprint-row span {
            color: var(--fgColor-muted, #656d76);
        }

        .gitfootprint-row strong {
            font-weight: 500;
            font-variant-numeric: tabular-nums;
        }

        .gitfootprint-warning {
            margin-top: 6px;
            color: var(--fgColor-muted, #656d76);
            font-size: 11px;
        }
    `

    document.head.appendChild(style)
}

function createSizeElement(
    githubRepositorySize: string,
    currentSnapshotSize: string,
    filesCount: number,
    truncated: boolean,
): HTMLDivElement {
    const element = document.createElement('div')

    element.className = 'my-extension-element'

    element.innerHTML = `
        <div class="gitfootprint-header">
            <span class="gitfootprint-icon">◉</span>
            <span>GitFootprint</span>
        </div>

        <div class="gitfootprint-row">
            <span>GitHub Repository Size</span>
            <strong>${githubRepositorySize}</strong>
        </div>

        <div class="gitfootprint-row">
            <span>Current Snapshot Size</span>
            <strong>${currentSnapshotSize}</strong>
        </div>

        <div class="gitfootprint-row">
            <span>Files</span>
            <strong>${filesCount.toLocaleString()}</strong>
        </div>

        ${
            truncated
                ? `
                    <div class="gitfootprint-warning">
                        Repository is too large to analyze completely.
                        Values may be incomplete.
                    </div>
                `
                : ''
        }
    `

    return element
}

async function main(): Promise<void> {
    const repository = getRepositoryFromUrl()

    if (!repository) {
        return
    }

    if (
        document.querySelector(
            '.my-extension-element',
        )
    ) {
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

    const tree = await getCompleteRepositoryTree(
        repository.owner,
        repository.repo,
        data.default_branch,
    )

    console.log(
        'GitFootprint: tree',
        tree,
    )

    const files = tree.tree.filter(
        item => item.type === 'blob',
    )

    const currentSnapshotSize =
        calculateSnapshotSize(tree)

    const filesCount = files.length

    console.log(
        'GitFootprint: current snapshot size',
        formatSize(currentSnapshotSize),
    )

    console.log(
        'GitFootprint: files count',
        filesCount,
    )

    if (tree.truncated) {
        console.warn(
            'GitFootprint: repository tree is incomplete',
            {
                files: filesCount,
                snapshotSize: formatSize(
                    currentSnapshotSize,
                ),
            },
        )
    }

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

    injectStyles()

    const element = createSizeElement(
        formatSize(data.size * 1024),
        formatSize(currentSnapshotSize),
        filesCount,
        tree.truncated,
    )

    about.parentElement?.after(element)
}

main().catch(error => {
    console.error(
        'GitFootprint:',
        error,
    )
})