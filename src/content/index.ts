import { getRepository } from '../github/repository'
import { getCompleteRepositoryTree } from '../github/tree'
// import { getGitHubToken, setGitHubToken, removeGitHubToken } from '../auth/github-token'

import {
    getLargestFiles,
    type LargestFile,
} from '../analysis/largest-files'

import {
    getCachedRepositoryAnalysis,
    setCachedRepositoryAnalysis,
} from '../cache/repository-cache'

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

function formatSize(
    bytes: number,
): string {
    if (bytes < 1024) {
        return `${bytes} B`
    }

    if (bytes < 1024 ** 2) {
        return `${(
            bytes / 1024
        ).toFixed(1)} KB`
    }

    if (bytes < 1024 ** 3) {
        return `${(
            bytes / 1024 ** 2
        ).toFixed(1)} MB`
    }

    return `${(
        bytes / 1024 ** 3
    ).toFixed(1)} GB`
}

function calculateSnapshotSize(
    tree: Awaited<
        ReturnType<
            typeof getCompleteRepositoryTree
        >
    >,
): number {
    return tree.tree
        .filter(
            item => item.type === 'blob',
        )
        .reduce(
            (total, item) => {
                return (
                    total +
                    (item.size ?? 0)
                )
            },
            0,
        )
}

function injectStyles(): void {
    if (
        document.querySelector(
            '#gitfootprint-styles',
        )
    ) {
        return
    }

    const style =
        document.createElement(
            'style',
        )

    style.id =
        'gitfootprint-styles'

    style.textContent = `
        .gitfootprint {
            margin-bottom: 6px;
            font-size: 12px;
            color: var(
                --fgColor-default,
                #1f2328
            );
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
            color: var(
                --fgColor-muted,
                #656d76
            );
        }

        .gitfootprint-row strong {
            font-weight: 500;
            font-variant-numeric: tabular-nums;
        }

        .gitfootprint-warning {
            margin-top: 6px;
            color: var(
                --fgColor-muted,
                #656d76
            );
            font-size: 11px;
        }

        .gitfootprint-largest {
            margin-top: 10px;
        }

        .gitfootprint-section-title {
            margin-bottom: 4px;
            font-size: 11px;
            font-weight: 600;
            color: var(
                --fgColor-default,
                #1f2328
            );
        }

        .gitfootprint-largest
        .gitfootprint-row span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `

    document.head.appendChild(style)
}

function createSizeElement(
    githubRepositorySize: string,
    currentSnapshotSize: string,
    filesCount: number,
    truncated: boolean,
    largestFiles: LargestFile[],
): HTMLDivElement {
    const element =
        document.createElement(
            'div',
        )

    element.className =
        'gitfootprint'

    element.innerHTML = `
        <div class="gitfootprint-header">
            <span class="gitfootprint-icon">
                ◉
            </span>

            <span>
                GitFootprint
            </span>
        </div>

        <div class="gitfootprint-row">
            <span>
                GitHub Repository Size
            </span>

            <strong>
                ${githubRepositorySize}
            </strong>
        </div>

        <div class="gitfootprint-row">
            <span>
                Current Snapshot Size
            </span>

            <strong>
                ${currentSnapshotSize}
            </strong>
        </div>

        <div class="gitfootprint-row">
            <span>
                Files
            </span>

            <strong>
                ${filesCount.toLocaleString()}
            </strong>
        </div>

        <div class="gitfootprint-largest">
            <div class="gitfootprint-section-title">
                Largest files
            </div>

            ${largestFiles
                .map(
                    file => `
                        <div class="gitfootprint-row">
                            <span title="${file.path}">
                                ${file.path}
                            </span>

                            <strong>
                                ${formatSize(
                                    file.size,
                                )}
                            </strong>
                        </div>
                    `,
                )
                .join('')}
        </div>

        ${
            truncated
                ? `
                    <div class="gitfootprint-warning">
                        Repository is too large
                        to analyze completely.
                        Values may be incomplete.
                    </div>
                `
                : ''
        }
    `

    return element
}

async function main(): Promise<void> {
    const about = [
            ...document.querySelectorAll(
                'h2[data-component="Heading"]',
            ),
        ].find(
            element =>
                element.textContent?.trim() ===
                'About',
        )

        if (!about) {
            return
        }

    injectStyles()

    const load =
        document.createElement(
            'div',
        )

    load.className =
        'gitfootprint_load'

    load.textContent = 'Loading...'

    about.parentElement?.after(load)

    const repository =
        getRepositoryFromUrl()

    if (!repository) {
        return
    }

    if (
        document.querySelector(
            '.gitfootprint',
        )
    ) {
        return
    }

    const cached =
        await getCachedRepositoryAnalysis(
            repository.owner,
            repository.repo,
        )

    let githubRepositorySize: number
    let currentSnapshotSize: number
    let filesCount: number
    let largestFiles: LargestFile[]
    let truncated: boolean

    if (cached) {
        githubRepositorySize =
            cached.githubRepositorySize

        currentSnapshotSize =
            cached.currentSnapshotSize

        filesCount =
            cached.filesCount

        largestFiles =
            cached.largestFiles

        truncated = false
    } else {
        const data =
            await getRepository(
                repository.owner,
                repository.repo,
            )

        const tree =
            await getCompleteRepositoryTree(
                repository.owner,
                repository.repo,
                data.default_branch,
            )

        const files =
            tree.tree.filter(
                item =>
                    item.type === 'blob',
            )

        largestFiles =
            getLargestFiles(
                files,
                5,
            )

        currentSnapshotSize =
            calculateSnapshotSize(
                tree,
            )

        filesCount =
            files.length

        githubRepositorySize =
            data.size * 1024

        truncated =
            tree.truncated

        if (tree.truncated) {
            console.warn(
                'GitFootprint: repository tree is incomplete',
                {
                    files: filesCount,
                    snapshotSize:
                        formatSize(
                            currentSnapshotSize,
                        ),
                },
            )
        }

        if (!tree.truncated) {
            await setCachedRepositoryAnalysis(
                {
                    owner:
                        repository.owner,

                    repo:
                        repository.repo,

                    branch:
                        data.default_branch,

                    treeSha:
                        tree.sha,

                    githubRepositorySize,

                    currentSnapshotSize,

                    filesCount,

                    largestFiles,

                    cachedAt:
                        Date.now(),
                },
            )
        }
    }

    const element =
        createSizeElement(
            formatSize(
                githubRepositorySize,
            ),
            formatSize(
                currentSnapshotSize,
            ),
            filesCount,
            truncated,
            largestFiles,
        )

    load.replaceWith(element)
}

main().catch(error => {
    console.error(
        'GitFootprint:',
        error,
    )
})