const debounce = (func: (...args) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout

  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

export async function updateTradeList(bearerToken: string, cardReference: string, amount: number): Promise<void> {
  if (!bearerToken) {
    return
  }

  try {
    const response = await fetch('https://api.altered.gg/ownership_lists/tradelist', {
      method: 'PUT',
      headers: {
        Authorization: bearerToken,
        'Accept-Language': 'fr-fr',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cards: [
          {
            card: `/cards/${cardReference}`,
            quantity: amount,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error('updateTradeList network response was not ok')
    }

    return
  } catch (error) {
    console.error('Error updating trade list:', error)
    throw error
  }
}

export const debouncedUpdateTradelist = debounce(updateTradeList, 1000)
