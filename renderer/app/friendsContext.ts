import { createContext, Dispatch, SetStateAction } from 'react'
import { Friend, FriendCard } from './fetchFriendTradelist'

export const FriendsContext = createContext<{
  friends: Friend[]
  setFriends: Dispatch<SetStateAction<Friend[]>>
}>({ friends: [], setFriends: () => {} })

export const FriendTradelistsContext = createContext<{
  friendsTradelists: { [friendId: string]: FriendCard[] }
  setFriendsTradelists: Dispatch<SetStateAction<{ [friendId: string]: FriendCard[] }>>
}>({ friendsTradelists: {}, setFriendsTradelists: () => {} })
