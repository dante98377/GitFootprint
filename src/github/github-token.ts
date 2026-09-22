const TOKEN_KEY = 'githubToken'

export async function getGitHubToken(): Promise<string | null> {
    const result =
        await chrome.storage.local.get([
            TOKEN_KEY,
        ])

    const token =
        result[TOKEN_KEY]

    if (typeof token !== 'string') {
        return null
    }

    const normalizedToken = token.trim()

    if (!normalizedToken) {
        return null
    }

    return normalizedToken
}

export async function setGitHubToken(
    token: string,
): Promise<void> {
    await chrome.storage.local.set({
        [TOKEN_KEY]: token.trim(),
    })
}

export async function removeGitHubToken(): Promise<void> {
    await chrome.storage.local.remove([
        TOKEN_KEY,
    ])
}