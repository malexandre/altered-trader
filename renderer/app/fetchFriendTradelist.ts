import { Card, CardCollection } from './fetchCollection'
import fetchWithRetries from './fetchWithRetrires'
import allcards from './allcards.json'

interface ApiFriendCard {
  reference: string
  imagePath: string
  inMyCollection: number
  quantity: number
  name: string
}

export interface FriendCard {
  cardType: CardType
  rarity: Rarity
  imagePath: string
  theyHave: number
  faction: Faction
  name: string
  collectorNumber: string
  reference: string
}

export interface Friend {
  name: string
  id: string
  // cards: FriendCard[]
  updatedAt: string
}

interface ApiFriend {
  userFriend: {
    nickName: string
    id: string
  }
}

export const fetchFriends = async (bearerToken: string): Promise<Friend[]> => {
  const response = await fetchWithRetries(
    bearerToken,
    'https://api.altered.gg/user_friendships?itemsPerPage=500&page=1',
    'GET'
  )
  const data = await response.json()
  return data['hydra:member'].map((member: ApiFriend) => ({
    name: member.userFriend.nickName,
    id: member.userFriend.id,
  }))
}

const fetchUniqueCardInfo = async (authToken: string, cardReference: string): Promise<FriendCard> => {
  const localStorageCard = localStorage.getItem(cardReference)

  if (localStorageCard) {
    return JSON.parse(localStorageCard)
  }

  const response = await fetchWithRetries(authToken, `https://api.altered.gg/cards/${cardReference}`, 'GET')
  const data = await response.json()
  const card = {
    name: data.name,
    faction: data.mainFaction.reference,
    rarity: data.rarity.reference,
    cardType: data.cardType.reference,
    collectorNumber: data.collectorNumber,
    imagePath: data.imagePath,
    theyHave: 1,
    reference: data.reference,
  }

  localStorage.setItem(cardReference, JSON.stringify(card))

  return card
}

const fetchFromFriendTradelist = async (bearerToken: string, url: string) => {
  const response = await fetchWithRetries(bearerToken, url, 'GET')
  const data = await response.json()
  const cards: FriendCard[] = []
  const promises: Promise<FriendCard>[] = []

  for (const friendCard of data['hydra:member'] as ApiFriendCard[]) {
    const baseCard = Object.values(allcards as CardCollection).find((card) =>
      card.versionOwned.map((version) => version.reference).includes(friendCard.reference)
    )

    if (baseCard) {
      cards.push({
        name: friendCard.name,
        imagePath: friendCard.imagePath,
        theyHave: friendCard.quantity,
        rarity: baseCard.rarity,
        cardType: baseCard.cardType,
        faction: baseCard.faction,
        collectorNumber: baseCard.collectorNumber,
        reference: friendCard.reference,
      })
    } else if (friendCard.reference.includes('_U_')) {
      promises.push(fetchUniqueCardInfo(bearerToken, friendCard.reference))
    }
  }

  return cards.concat(await Promise.all(promises))
}

export const fetchFriendsTradelist = async (
  bearerToken: string,
  friends: Friend[]
): Promise<{ [friendId: string]: FriendCard[] }> => {
  const promises = friends.map(async (friend) => {
    const result = await fetchFriendTradelist(bearerToken, friend)
    return { [friend.id]: result }
  })

  const results = await Promise.all(promises)
  return Object.assign({}, ...results)
}

export const fetchFriendTradelist = async (bearerToken: string, friend: Friend): Promise<FriendCard[]> => {
  const cards: FriendCard[] = []
  const promises = [
    fetchFromFriendTradelist(
      bearerToken,
      `https://api.altered.gg/ownership_lists/tradelist/users/${friend.id}?itemsPerPage=1000&page=1&cardType[]=SPELL&cardType[]=PERMANENT&cardType[]=CHARACTER&rarity[]=RARE&rarity[]=COMMON`
    ),
    fetchFromFriendTradelist(
      bearerToken,
      `https://api.altered.gg/ownership_lists/tradelist/users/${friend.id}?itemsPerPage=1000&page=1&cardType[]=SPELL&cardType[]=PERMANENT&cardType[]=CHARACTER&rarity[]=UNIQUE`
    ),
  ]
  const results = await Promise.all(promises)

  for (const result of results) {
    cards.push(...result)
  }

  return cards
}
