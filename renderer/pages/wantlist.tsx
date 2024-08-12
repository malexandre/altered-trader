import React, { useContext, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { Card, CardCollection } from '../app/fetchCollection'
import { Friend, FriendCard } from '../app/fetchFriendTradelist'
import { toast } from 'react-toastify'
import Modal from '../components/modal'
import { CardForTrade, startTrade } from '../app/startTrade'
import { BearerTokenContext } from '../app/bearerTokenContext'
import { FriendsContext, FriendTradelistsContext } from '../app/friendsContext'
import { UserCollectionContext } from '../app/collectionContext'

interface CardsByFriend {
  wantedCards: { card: Card; available: number; wanted: number }[]
  friend: Friend
}

interface Wantlist {
  [cardReference: string]: {
    name: string
    quantity: number
  }
}

function buildWantlist() {
  const userCollection: CardCollection = useContext(UserCollectionContext)
  const wantlist: Wantlist = {}

  for (const card of Object.values(userCollection)) {
    for (const version of card.versionOwned) {
      if (!version.inMyWantlist) {
        continue
      }
      const totalPlayset = ['SPELL', 'PERMANENT', 'CHARACTER'].includes(card.cardType) ? 3 : 1
      wantlist[version.reference] = { name: card.name, quantity: Math.max(0, totalPlayset - card.inMyCollection) }
    }
  }

  return wantlist
}

function FriendModal({
  friend,
  wantedCards,
  wantlist,
  handleStartTrade,
  closeModal,
}: {
  friend: Friend
  wantedCards: FriendCard[]
  wantlist: Wantlist
  handleStartTrade: (friend: Friend) => void
  closeModal: () => void
}) {
  return (
    <Modal onClose={closeModal}>
      <h2 className="text-xl font-bold mb-4 text-center">{friend.name}</h2>
      <ul className="list-none m-4 flex flex-wrap gap-4 flex-grow overflow-y-auto">
        {wantedCards.map((wantedCard) => {
          return (
            <li key={`${friend.id}-${wantedCard.collectorNumber}`} className="relative h-[369px]">
              <img
                src={wantedCard.imagePath}
                alt={wantedCard.name}
                className="w-64 h-90"
                style={{ width: '264px', height: '369px' }}
              />
              <div className="absolute top-[291px] right-[12px] left-[195px] bottom-[22px] bg-black/90 flex items-center justify-center rounded">
                <div className="text-white">
                  {Math.min(wantlist[wantedCard.reference].quantity, wantedCard.theyHave)}/
                  {wantlist[wantedCard.reference].quantity}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="bg-white text-center">
        <button onClick={() => handleStartTrade(friend)} className="btn-primary">
          Démarrer le Trade
        </button>
      </div>
    </Modal>
  )
}

export default function Wantlist() {
  const bearerToken = useContext(BearerTokenContext)
  const { friends } = useContext(FriendsContext)
  const { friendsTradelists } = useContext(FriendTradelistsContext)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)

  const wantlist = buildWantlist()
  const friendsWithCardsFromWantlist = friends.filter((friend) => {
    const tradelist = friendsTradelists[friend.id]

    return tradelist && !!tradelist.find((card) => !!wantlist[card.reference])
  })

  const handleStartTrade = (friend: Friend) => {
    const wantedCards: CardForTrade[] = friendsTradelists[friend.id]
      .filter((card) => !!wantlist[card.reference])
      .map((card) => ({
        reference: card.reference,
        amount: Math.min(card.theyHave, wantlist[card.reference].quantity),
      }))
    toast.info(
      `Trade démarré avec ${friend.name} pour ${wantedCards.reduce((amount, card) => amount + card.amount, 0)} cartes`
    )
    startTrade(bearerToken, friend.id, wantedCards)
    setSelectedFriend(null)
  }

  const openModal = (friend) => {
    setSelectedFriend(friend)
  }

  const closeModal = () => {
    setSelectedFriend(null)
  }

  return (
    <React.Fragment>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Available Traders</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {friendsWithCardsFromWantlist.map((friend) => {
            const wantedCards = friendsTradelists[friend.id]
              .filter((card) => !!wantlist[card.reference])
              .map((card) => ({
                name: card.name,
                quantity: Math.min(card.theyHave, wantlist[card.reference].quantity),
              }))

            const wantedCardsText = wantedCards.map((wantedCard) => `${wantedCard.quantity} ${wantedCard.name}`)

            return (
              <div
                key={friend.id}
                className="clickable-cards flex flex-col max-w-80"
                onClick={() => openModal(friend)}
                title={wantedCardsText.join('\n')}
              >
                <h2 className="text-xl font-bold mb-2">
                  {friend.name} ({wantedCards.reduce((quantity, card) => quantity + card.quantity, 0)} cartes)
                </h2>
                <p className="truncate">{wantedCardsText.join(', ')}</p>
              </div>
            )
          })}
        </div>
      </div>

      {selectedFriend && (
        <FriendModal
          friend={selectedFriend}
          wantedCards={friendsTradelists[selectedFriend.id].filter((card) => !!wantlist[card.reference])}
          wantlist={wantlist}
          handleStartTrade={handleStartTrade}
          closeModal={closeModal}
        />
      )}
    </React.Fragment>
  )
}
