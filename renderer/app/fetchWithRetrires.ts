class NonRetriableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NonRetriableError'
  }
}

export default async function fetchWithRetries(
  bearerToken: string,
  url: string,
  method: 'GET' | 'PUT' | 'POST',
  body?: string,
  maxRetries = 3
): Promise<Response> {
  let retries = 0

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: bearerToken,
          'Accept-Language': 'fr-fr',
          'Content-Type': 'application/json',
        },
        body,
      })

      if (response.status === 500 || response.status === 401) {
        console.error(`${url} request failed with status code ${response.status}. Not retrying.`)
        throw new NonRetriableError(`Request failed with status code ${response.status}`)
      }

      if (!response.ok) {
        throw new Error(`${url} network response was not ok`)
      }

      return response
    } catch (error) {
      if (error instanceof NonRetriableError) {
        throw error
      }

      retries += 1
      console.log(`Retrying ${url}... (${retries}/${maxRetries})`)

      if (retries >= maxRetries) {
        console.error('Failed to retrieve ${url} after maximum retries', error)
        throw error
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  throw new Error('Failed to fetch ${url}')
}
