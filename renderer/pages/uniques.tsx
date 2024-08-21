import React, { useContext, useState } from 'react'
import { FriendsContext, FriendTradelistsContext } from '../app/friendsContext'
import { Friend, FriendCard } from '../app/fetchFriendTradelist'

interface Uniques {
  [uniqueId: string]: {
    friend: Friend
    card: FriendCard
  }
}

export default function Uniques() {
  const [factionFilter, setFactionFilter] = useState<Faction | undefined>(undefined)
  const { friends } = useContext(FriendsContext)
  const { friendsTradelists } = useContext(FriendTradelistsContext)

  const uniques: Uniques = {}

  for (const friendId in friendsTradelists) {
    const friend = friends.find((friend) => friend.id === friendId)

    if (!friend) {
      continue
    }

    for (const card of friendsTradelists[friendId]) {
      if (card.rarity === 'UNIQUE') {
        uniques[card.reference] = { friend, card }
      }
    }
  }

  return (
    <React.Fragment>
      <div className="h-full flex flex-col">
        <div className="text-center pb-4 space-x-2">
          <div className="space-y-2">
            <select
              value={factionFilter}
              onChange={(event) => setFactionFilter(event.target.value as Faction)}
              className="border-2 p-1 rounded"
            >
              <option value={undefined} label="Toutes les factions" />
              <option value="AX" label="Axiom" />
              <option value="BR" label="Bravos" />
              <option value="LY" label="Lyra" />
              <option value="MU" label="Muna" />
              <option value="OR" label="Ordis" />
              <option value="YZ" label="Yzmir" />
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {Object.values(uniques)
            .filter((unique) => {
              if (unique.card.cardType === 'FOILER') {
                return false
              }

              if (factionFilter && unique.card.faction !== factionFilter) {
                return false
              }

              return true
            })
            .map(({ friend, card }) => (
              <div key={card.collectorNumber} className="relative" style={{ width: '264px', height: '369px' }}>
                <img
                  src={card.imagePath}
                  alt={card.name}
                  className="w-full h-full rounded-lg"
                  width={264}
                  height={369}
                  loading="lazy"
                />
                <div className="absolute bottom-2 right-2 flex space-x-2 bg-black/60 p-2 rounded-lg text-white">
                  {friend.name}
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* 
      {selectedFriend && (
        <FriendModal
          closeModal={closeModal}
          selectedFriend={selectedFriend}
          cards={friendsTradelists[selectedFriend.id] || []}
        />
      )} */}
    </React.Fragment>
  )
}
