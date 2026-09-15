import type { LargestFile } from '../analysis/largest-files'

export interface CachedRepositoryAnalysis {
    owner: string
    repo: string
    branch: string
    treeSha: string

    githubRepositorySize: number
    currentSnapshotSize: number
    filesCount: number
    largestFiles: LargestFile[]

    cachedAt: number
}

const CACHE_TTL = 10 * 60 * 1000

function getCacheKey(
    owner: string,
    repo: string,
): string {
    return `repository:${owner}/${repo}`
}

export async function getCachedRepositoryAnalysis(
    owner: string,
    repo: string,
): Promise<CachedRepositoryAnalysis | null> {
    const key = getCacheKey(
        owner,
        repo,
    )

    const result =
        await chrome.storage.local.get(key)

    const cached =
        result[key] as CachedRepositoryAnalysis | undefined

    if (!cached) {
        return null
    }

    const age =
        Date.now() - cached.cachedAt

    if (age >= CACHE_TTL) {
        await chrome.storage.local.remove(key)

        return null
    }

    return cached
}

export async function setCachedRepositoryAnalysis(
    analysis: CachedRepositoryAnalysis,
): Promise<void> {
    const key = getCacheKey(
        analysis.owner,
        analysis.repo,
    )

    await chrome.storage.local.set({
        [key]: analysis,
    })
}