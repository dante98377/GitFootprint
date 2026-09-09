import type { GitHubTreeItem } from '../github/tree'

export interface LargestFile {
    path: string
    size: number
}

export function getLargestFiles(
    files: GitHubTreeItem[],
    limit: number,
): LargestFile[] {
    return files
        .filter(file => file.type === 'blob')
        .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))
        .slice(0, limit)
        .map(file => ({
            path: file.path,
            size: file.size ?? 0,
        }))
}