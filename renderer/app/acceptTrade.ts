export async function acceptTrade(bearerToken: string, tradeId: string): Promise<void> {
  if (!bearerToken) {
    return
  }

  try {
    const response = await fetch(`https://api.altered.gg/owner_exchange_requests/${tradeId}/accept`, {
      method: 'PUT',
      headers: {
        Authorization: bearerToken,
        'Accept-Language': 'fr-fr',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      throw new Error('acceptTrade network response was not ok')
    }

    return
  } catch (error) {
    console.error('Error accepting trade:', error)
    throw error
  }
}
