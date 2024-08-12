export class BearerTokenUndefined extends Error {
  constructor() {
    super('Bearer token must be defined for api calls')
    this.name = 'BearerTokenUndefined'
  }
}

export async function toggleWantlist(bearerToken: string, cardReference: string): Promise<boolean> {
  if (!bearerToken) {
    throw new BearerTokenUndefined()
  }

  const currentStatus = await fetchCurrentWantlistStatus(bearerToken, cardReference)

  if (currentStatus) {
    await removeFromWantlist(bearerToken, cardReference)
    return false
  }

  await addToWantlist(bearerToken, cardReference)
  return true
}

async function fetchCurrentWantlistStatus(bearerToken: string, cardReference: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.altered.gg/cards/${cardReference}`, {
      method: 'GET',
      headers: {
        Authorization: bearerToken,
        'Accept-Language': 'fr-fr',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('getCurrentWantlistStatus network response was not ok')
    }

    const data = await response.json()
    return data.inMyWantlist
  } catch (error) {
    console.error('Error fetching card want list status:', error)
    throw error
  }
}

async function addToWantlist(bearerToken: string, cardReference: string): Promise<void> {
  if (!bearerToken) {
    return
  }

  try {
    const response = await fetch(`https://api.altered.gg/card_user_list_cards`, {
      method: 'POST',
      headers: {
        Authorization: bearerToken,
        'Accept-Language': 'fr-fr',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'wantlist', cards: [`/cards/${cardReference}`] }),
    })

    if (!response.ok) {
      throw new Error('addToWantlist network response was not ok')
    }

    return
  } catch (error) {
    console.error('Error adding card to want list:', error)
    throw error
  }
}

async function removeFromWantlist(bearerToken: string, cardReference: string): Promise<void> {
  if (!bearerToken) {
    return
  }

  try {
    const response = await fetch(`https://api.altered.gg/card_user_lists/wantlist/cards/${cardReference}`, {
      method: 'DELETE',
      headers: {
        Authorization: bearerToken,
        'Accept-Language': 'fr-fr',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('removeFromWantlist network response was not ok')
    }

    return
  } catch (error) {
    console.error('Error removing card from want list:', error)
    throw error
  }
}
