import { acceptTrade } from './acceptTrade'

export interface CardForTrade {
  reference: string
  amount: number
}

export async function startTrade(bearerToken: string, friendId: string, cards: CardForTrade[]): Promise<void> {
  if (!bearerToken) {
    return
  }

  try {
    const response = await fetch(`https://api.altered.gg/owner_exchange_requests`, {
      method: 'POST',
      headers: {
        Authorization: bearerToken,
        'Accept-Language': 'fr-fr',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        friend: `/users/${friendId}`,
        ownerExchangeCards: cards.map((card) => ({
          card: `/cards/${card.reference}`,
          quantity: card.amount,
        })),
      }),
    })

    if (!response.ok) {
      throw new Error('startTrade network response was not ok')
    }

    const contentLocation = response.headers.get('Content-Location') || response.headers.get('content-location')
    const tradeId = contentLocation?.split('/')[2]

    if (!tradeId) {
      return
    }

    return acceptTrade(bearerToken, tradeId)
  } catch (error) {
    console.error('Error starting trade:', error)
    throw error
  }
}
