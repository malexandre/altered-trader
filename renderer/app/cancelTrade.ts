export async function cancelTrade(bearerToken: string, tradeId: string): Promise<void> {
  if (!bearerToken) {
    return
  }

  try {
    const response = await fetch(
      `https://api.altered.gg/owner_exchange_requests/${tradeId}/cancel
`,
      {
        method: 'PUT',
        headers: {
          Authorization: bearerToken,
          'Accept-Language': 'fr-fr',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    )

    if (!response.ok) {
      throw new Error('cancelTrade network response was not ok')
    }

    return
  } catch (error) {
    console.error('Error canceling trade:', error)
    throw error
  }
}
