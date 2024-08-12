import allcards from './allcards.json'

class NonRetriableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NonRetriableError'
  }
}

export interface Card {
  cardType: CardType
  cardSubTypes: string[]
  rarity: Rarity
  imagePath: string
  inMyTradelist: number
  inMyCollection: number
  theyHave: number
  inMyWantlist: boolean
  faction: Faction
  name: string
  collectorNumber: string
  friendsOwn: {
    [name: string]: number
  }
  versionOwned: {
    id: string
    reference: string
    inMyTradelist: number
    inMyCollection: number
    inMyWantlist: boolean
  }[]
}

export type CardCollection = { [collectorNumber: string]: Card }

function fetchByFaction(bearerToken: string, faction: Faction) {
  return [
    fetchCards(
      {
        cardType: [],
        factions: [faction],
        rarity: ['COMMON'],
      },
      bearerToken
    ),
    fetchCards(
      {
        cardType: [],
        factions: [faction],
        rarity: ['RARE'],
      },
      bearerToken
    ),
    fetchCards(
      {
        cardType: [],
        factions: [faction],
        rarity: ['UNIQUE'],
      },
      bearerToken
    ),
  ]
}

export async function fetchMyCollection(bearerToken: string): Promise<CardCollection> {
  if (!bearerToken) {
    return {}
  }

  const requests: Promise<ApiCard[]>[] = []

  requests.push(...fetchByFaction(bearerToken, 'AX'))
  requests.push(...fetchByFaction(bearerToken, 'BR'))
  requests.push(...fetchByFaction(bearerToken, 'LY'))
  requests.push(...fetchByFaction(bearerToken, 'MU'))
  requests.push(...fetchByFaction(bearerToken, 'OR'))
  requests.push(...fetchByFaction(bearerToken, 'YZ'))

  const results = await Promise.all(requests)

  const collection: CardCollection = JSON.parse(JSON.stringify(allcards as unknown as CardCollection))

  for (const fetchedCards of results) {
    for (const fetchedCard of fetchedCards) {
      let card = collection[fetchedCard.collectorNumberFormatted]

      if (!card) {
        card = createCardFromApiCard(fetchedCard)
        collection[fetchedCard.collectorNumberFormatted] = card
      }

      card.inMyCollection += fetchedCard.inMyCollection
      card.inMyTradelist += fetchedCard.inMyTradelist
      card.inMyWantlist ||= fetchedCard.inMyWantlist

      const version = card.versionOwned.find((owned) => owned.reference == fetchedCard.reference)

      if (version) {
        version.inMyCollection += fetchedCard.inMyCollection
        version.inMyTradelist += fetchedCard.inMyTradelist
        version.inMyWantlist ||= fetchedCard.inMyWantlist
      } else {
        card.versionOwned.push({
          id: fetchedCard.id,
          reference: fetchedCard.reference,
          inMyCollection: fetchedCard.inMyCollection,
          inMyTradelist: fetchedCard.inMyTradelist,
          inMyWantlist: fetchedCard.inMyWantlist,
        })
      }
    }
  }

  return collection
}

const buildQueryString = (filters: { cardType: CardType[]; factions: Faction[]; rarity: Rarity[] }) => {
  const query = new URLSearchParams()

  if (filters.factions.length > 0) {
    query.append('factions', filters.factions.join(','))
  }

  if (filters.rarity.length > 0) {
    query.append('rarity', filters.rarity.join(','))
  }

  if (filters.cardType.length > 0) {
    query.append('cardType', filters.cardType.join(','))
  }
  query.append('itemsPerPage', '150')
  query.append('page', '1')
  query.append('collection', 'true')

  return query.toString()
}

const fetchCards = async (
  filters: { cardType: CardType[]; factions: Faction[]; rarity: Rarity[] },
  authToken: string,
  maxRetries = 3
): Promise<ApiCard[]> => {
  const baseUrl = 'https://api.altered.gg/cards'
  const queryString = buildQueryString(filters)
  const url = `${baseUrl}?${queryString}`

  let retries = 0

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: authToken,
          'Accept-Language': 'fr-fr',
        },
      })

      if (response.status === 500 || response.status === 401) {
        console.error(`Collection request failed with status code ${response.status}. Not retrying.`)
        throw new NonRetriableError(`Request failed with status code ${response.status}`)
      }

      if (!response.ok) {
        throw new Error('fetchCards network response was not ok')
      }

      const data = await response.json()
      return data['hydra:member']
    } catch (error) {
      if (error instanceof NonRetriableError) {
        throw error
      }

      retries += 1
      console.log(`Retrying... (${retries}/${maxRetries})`)

      if (retries >= maxRetries) {
        console.error('Failed to retrieve collection after maximum retries', error)
        throw error
      }

      await new Promise((resolve) => setTimeout(resolve, 500)) // Wait for 1 second before retrying
    }
  }

  throw new Error('Failed to fetch collection')
}

function createCardFromApiCard(fetchedCard: ApiCard): Card {
  return {
    name: fetchedCard.name,
    faction: fetchedCard.mainFaction.reference,
    rarity: fetchedCard.rarity.reference,
    inMyCollection: 0,
    inMyTradelist: 0,
    theyHave: 0,
    inMyWantlist: false,
    cardType: fetchedCard.cardType.reference,
    cardSubTypes: fetchedCard.cardSubTypes.reduce((subtypes: string[], subtype: ApiCardSubType) => {
      subtypes.push(subtype.name)
      subtypes.push(subtype.reference)
      return subtypes
    }, []),
    collectorNumber: fetchedCard.collectorNumberFormatted,
    imagePath: fetchedCard.imagePath,
    friendsOwn: {},
    versionOwned: [],
  }
}
