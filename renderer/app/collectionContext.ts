import { createContext, Dispatch } from 'react'
import { Card, CardCollection } from './fetchCollection'
import { Friend } from './fetchFriendTradelist'

export const UserCollectionContext = createContext<CardCollection>({})
export const UserCollectionDispatchContext = createContext<Dispatch<CollectionAction> | null>(null)

export interface CollectionAction {
  collection?: CardCollection
  cardsUpdated?: Card[]
  type: 'cardsUpdated' | 'collectionFetched'
}

export function collectionReducer(collection: CardCollection, action: CollectionAction) {
  switch (action.type) {
    case 'collectionFetched': {
      if (action.collection) {
        localStorage.setItem('userCollection', JSON.stringify(action.collection))
        return JSON.parse(JSON.stringify(action.collection))
      }

      return collection
    }

    case 'cardsUpdated': {
      const newCollection = JSON.parse(JSON.stringify(collection))

      for (const card of action.cardsUpdated || []) {
        newCollection[card.collectorNumber] = card
      }

      localStorage.setItem('userCollection', JSON.stringify(newCollection))
      return newCollection
    }

    default: {
      throw Error('Unknown action: ' + action.type)
    }
  }
}
