export async function githubFetch(
    url: string,
): Promise<Response> {
    const response = await fetch(url, {
        headers: {
            Accept: 'application/vnd.github+json',
        },
    })

    if (!response.ok) {
        const body = await response.text()

        let message = 'Unknown error'

        try {
            const data = JSON.parse(body)

            if (typeof data.message === 'string') {
                message = data.message
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