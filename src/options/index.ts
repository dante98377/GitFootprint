import {
    getGitHubToken,
    setGitHubToken,
    removeGitHubToken,
} from '../github/github-token'

const tokenInput =
    document.querySelector<HTMLInputElement>(
        '#github-token',
    )

const saveButton =
    document.querySelector<HTMLButtonElement>(
        '#save-token',
    )

const removeButton =
    document.querySelector<HTMLButtonElement>(
        '#remove-token',
    )

const status =
    document.querySelector<HTMLParagraphElement>(
        '#status',
    )

if (
    tokenInput === null ||
    saveButton === null ||
    removeButton === null ||
    status === null
) {
    throw new Error(
        'GitFootprint options: required elements not found',
    )
}

const input = tokenInput
const save = saveButton
const remove = removeButton
const statusElement = status

async function loadToken(): Promise<void> {
    const token =
        await getGitHubToken()

    if (token !== null) {
        input.value = token

        statusElement.textContent =
            'GitHub token is configured.'

        return
    }

    statusElement.textContent =
        'GitHub token is not configured.'
}

save.addEventListener(
    'click',
    async () => {
        const token =
            input.value.trim()

        if (!token) {
            statusElement.textContent =
                'Enter a GitHub token.'

            return
        }

        try {
            await setGitHubToken(token)

            statusElement.textContent =
                'GitHub token saved.'
        } catch (error) {
            console.error(
                'GitFootprint options:',
                error,
            )

            statusElement.textContent =
                'Failed to save GitHub token.'
        }
    },
)

remove.addEventListener(
    'click',
    async () => {
        try {
            await removeGitHubToken()

            input.value = ''

            statusElement.textContent =
                'GitHub token removed.'
        } catch (error) {
            console.error(
                'GitFootprint options:',
                error,
            )

            statusElement.textContent =
                'Failed to remove GitHub token.'
        }
    },
)

loadToken().catch(error => {
    console.error(
        'GitFootprint options:',
        error,
    )

    statusElement.textContent =
        'Failed to load GitHub token.'
})