// https://api.altered.gg/owner_exchange_requests?isActive=false&itemsPerPage=30&page=1

import fetchWithRetries from './fetchWithRetrires'

type TradeStatus = 'completed' | 'canceled' | 'in_progress' | 'draft'

interface ApiTradeCard {
  card: {
    reference: string
    imagePath: string
  }
  quantity: number
}

interface ApiTradeListItem {
  id: string
  status: TradeStatus
  friend: {
    id: string
    nickName: string
    uniqueId: string
  }
  myTurn: boolean
}

interface ApiTradeDetail {
  id: string
  sender: {
    id: string
    nickName: string
    uniqueId: string
  }
  status: TradeStatus
  friend: {
    id: string
    nickName: string
    uniqueId: string
  }
  myTurn: boolean
  ownerExchangeCardsSender: ApiTradeCard[]
  ownerExchangeCardsReceiver: ApiTradeCard[]
}

export interface Trade {
  id: string
  tradeWith: string
  initiatedByMe: boolean
  status: TradeStatus
  sending: ApiTradeCard[]
  receiving: ApiTradeCard[]
  myTurn: boolean
}

export default async function fetchTrades(bearerToken: string) {
  if (!bearerToken) {
    return []
  }

  const tradesResponse = await fetchWithRetries(
    bearerToken,
    'https://api.altered.gg/owner_exchange_requests?itemsPerPage=1000&page=1',
    'GET'
  )
  const data = await tradesResponse.json()
  const apiTrades = data['hydra:member']

  const promises: Promise<Trade>[] = []

  for (const apiTrade of apiTrades) {
    if (apiTrade.status === 'canceled') {
      continue
    }

    promises.push(buildTradeFromApiObject(bearerToken, apiTrade))
  }

  return await Promise.all(promises)
}

async function buildTradeFromApiObject(bearerToken: string, apiTrade: ApiTradeListItem): Promise<Trade> {
  const tradesResponse = await fetchWithRetries(
    bearerToken,
    `https://api.altered.gg/owner_exchange_requests/${apiTrade.id}`,
    'GET'
  )
  const apiTradeDetail: ApiTradeDetail = await tradesResponse.json()

  return {
    id: apiTrade.id,
    tradeWith: apiTrade.friend.nickName,
    status: apiTrade.status,
    initiatedByMe: apiTradeDetail.sender.id !== apiTrade.friend.id,
    sending:
      apiTradeDetail.sender.id === apiTrade.friend.id
        ? apiTradeDetail.ownerExchangeCardsSender
        : apiTradeDetail.ownerExchangeCardsReceiver,
    receiving:
      apiTradeDetail.sender.id === apiTrade.friend.id
        ? apiTradeDetail.ownerExchangeCardsReceiver
        : apiTradeDetail.ownerExchangeCardsSender,
    myTurn: apiTradeDetail.myTurn,
  }
}
