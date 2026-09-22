import { getGitHubToken } from './github-token'

export async function githubFetch(
    url: string,
): Promise<Response> {
    const token = await getGitHubToken()

    const headers: HeadersInit = {
        Accept: 'application/vnd.github+json',
    }

    if (token !== null) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
        headers,
    })

    if (!response.ok) {
        const body = await response.text()

        let message = 'Unknown error'

        try {
            const json = JSON.parse(body)

            if (
                typeof json.message ===
                'string'
            ) {
                message = json.message
            }
        } catch {
            if (body) {
                message = body
            }
        }

        const remaining =
            response.headers.get(
                'x-ratelimit-remaining',
            )

        const reset =
            response.headers.get(
                'x-ratelimit-reset',
            )

        console.error(
            'GitFootprint: GitHub API error',
            {
                status: response.status,
                message,
                remaining,
                reset,
            },
        )

        throw new Error(
            `GitHub API error: ${response.status} - ${message}`,
        )
    }

    return response
}