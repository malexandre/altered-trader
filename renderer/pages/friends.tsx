import React, { useCallback, useContext, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { fetchFriends, fetchFriendsTradelist, Friend, FriendCard } from '../app/fetchFriendTradelist'
import { toast } from 'react-toastify'
import Modal from '../components/modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLayerGroup, faUsers } from '@fortawesome/free-solid-svg-icons'
import { MultiSelect } from 'react-multi-select-component'
import { CardForTrade, startTrade } from '../app/startTrade'
import { BearerTokenContext } from '../app/bearerTokenContext'
import { useRouter } from 'next/router'
import { FriendsContext, FriendTradelistsContext } from '../app/friendsContext'
import { Card, CardCollection } from '../app/fetchCollection'
import { UserCollectionContext } from '../app/collectionContext'

interface TradeListFilters {
  factions: Faction[]
  rarity: Rarity[]
  missing: boolean
}

function FriendModalCard({
  card,
  collectionCard,
  cardsToTrade,
  addToTrade,
}: {
  card: FriendCard
  collectionCard: Card | undefined
  cardsToTrade: CardForTrade[]
  addToTrade
}) {
  const amount = cardsToTrade.find((c) => c.reference === card.reference)?.amount || 0

  return (
    <div key={'modal-card' + card.reference}>
      <div className="relative">
        <img src={card.imagePath} alt={card.name} className="rounded-lg" style={{ width: '198px', height: '276px' }} />

        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            className={card.theyHave > amount ? 'btn-trade-plus' : 'btn-trade-disabled'}
            onClick={() => addToTrade(card, 1)}
          >
            +
          </button>
          <span className="p-1.5 bg-gray-300 text-xs rounded-lg text-center">{amount}</span>
          <button
            className={amount > 0 ? 'btn-trade-minus' : 'btn-trade-disabled'}
            onClick={() => addToTrade(card, -1)}
          >
            -
          </button>
        </div>

        <div className="absolute bottom-2 right-2 transform flex space-x-2 bg-black/40 p-2 rounded-lg">
          {!card.reference.includes('_U_') && (
            <div
              className="bg-blue-600 text-white rounded-full px-3 py-1 text-xs flex items-center"
              title="Dans ma collection quelque soit la version"
            >
              <FontAwesomeIcon icon={faLayerGroup} className="mr-1" />
              {collectionCard?.inMyCollection || 0}
            </div>
          )}
          <div className="bg-green-600 text-white rounded-full px-3 py-1 text-xs flex items-center">
            <FontAwesomeIcon icon={faUsers} className="mr-1" />
            {card.theyHave}
          </div>
        </div>
      </div>
    </div>
  )
}

function FriendModal({
  selectedFriend,
  cards,
  closeModal,
}: {
  selectedFriend: Friend
  cards: FriendCard[]
  closeModal
}) {
  const bearerToken = useContext(BearerTokenContext)
  const userCollection: CardCollection = useContext(UserCollectionContext)
  const [filters, setFilters] = useState<TradeListFilters>({ factions: [], rarity: [], missing: false })
  const [cardsToTrade, setCardsToTrade] = useState<CardForTrade[]>([])
  const router = useRouter()

  const cardsByVersionReference: { [cardReference: string]: Card } = {}

  for (const card of Object.values(userCollection)) {
    for (const version of card.versionOwned) {
      cardsByVersionReference[version.reference] = card
    }
  }

  const handleStartTrade = async () => {
    const numerOfCards = cardsToTrade.reduce((count, card) => count + card.amount, 0)
    toast.info(`Trade démarré avec ${selectedFriend.name} pour ${numerOfCards} cartes`)
    await startTrade(bearerToken, selectedFriend.id, cardsToTrade)
    router.push('/trades')
  }

  const addToTrade = (card: FriendCard, amount: number) => {
    const newCardsToTrade = [...cardsToTrade]
    const existingCardToTrade = newCardsToTrade.find((cardToTrade) => cardToTrade.reference === card.reference)

    if (existingCardToTrade) {
      existingCardToTrade.amount = Math.min(existingCardToTrade.amount + amount, card.theyHave)
    } else {
      newCardsToTrade.push({ reference: card.reference, amount })
    }

    setCardsToTrade(newCardsToTrade.filter((card) => card.amount > 0))
  }

  return (
    <Modal onClose={closeModal}>
      <h2 className="text-xl font-bold mb-4 text-center">{selectedFriend.name}</h2>
      <div className="flex w-full gap-4 mb-4 justify-center">
        <div className="space-y-2">
          <div className="text-center">Factions</div>
          <CustomSelect
            filter="factions"
            options={[
              { value: 'AX', label: 'Axiom' },
              { value: 'BR', label: 'Bravos' },
              { value: 'LY', label: 'Lyra' },
              { value: 'MU', label: 'Muna' },
              { value: 'OR', label: 'Ordis' },
              { value: 'YZ', label: 'Yzmir' },
            ]}
            currentFilters={filters}
            onChange={setFilters}
          />
        </div>
        <div className="space-y-2">
          <div className="text-center">Raretés</div>
          <CustomSelect
            filter="rarity"
            options={[
              { value: 'COMMON', label: 'Commune' },
              { value: 'RARE', label: 'Rare' },
              { value: 'UNIQUE', label: 'Uniques' },
            ]}
            currentFilters={filters}
            onChange={setFilters}
          />
        </div>

        <div className="space-x-2 flex align-middle justify-center items-center">
          <input
            id="missing"
            type="checkbox"
            defaultChecked={filters.missing}
            onClick={() => setFilters({ ...filters, missing: !filters.missing })}
          />
          <label className="text-center" htmlFor="missing">
            Manquantes
          </label>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 justify-center flex-grow overflow-y-auto">
        {cards
          .filter((card) => {
            const collectionCard = cardsByVersionReference[card.reference]

            if (filters.missing && collectionCard && collectionCard.inMyCollection >= 3) {
              return false
            }

            if (filters.factions.length && !filters.factions.includes(card.faction)) {
              return false
            }

            if (filters.rarity.length && !filters.rarity.includes(card.rarity)) {
              return false
            }

            return true
          })
          .map((card) => (
            <FriendModalCard
              card={card}
              cardsToTrade={cardsToTrade}
              addToTrade={addToTrade}
              collectionCard={cardsByVersionReference[card.reference]}
              key={'modal-' + card.reference}
            />
          ))}
      </div>
      <div className="bg-white text-center mt-4">
        <button onClick={handleStartTrade} className="btn-primary">
          Démarrer le Trade
        </button>
      </div>
    </Modal>
  )
}

export default function Friends() {
  const bearerToken = useContext(BearerTokenContext)
  const [loading, setLoading] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const { friends, setFriends } = useContext(FriendsContext)
  const { friendsTradelists, setFriendsTradelists } = useContext(FriendTradelistsContext)

  const loadFriendsWithoutTrades = useCallback(async () => {
    if (!bearerToken) {
      toast.error('Le bearer token est nécessaire pour recharger la collection')
      return
    }

    if (loading) {
      toast.error('Un chargement est déjà en cours')
      return
    }
    setLoading(true)

    try {
      const fetchedFriendData = await toast.promise(fetchFriends(bearerToken), {
        pending: 'Mise a jour des amis',
        success: 'Amis à jour 👌',
        error: 'Erreur durant le chargement des amis',
      })

      const newFriends = fetchedFriendData.map((friend): Friend => {
        const oldFriend = friends.find((f) => f.id == friend.id)

        if (oldFriend) {
          return { ...friend, updatedAt: oldFriend.updatedAt }
        }

        return friend
      })

      setFriends(newFriends)
      localStorage.setItem('friends', JSON.stringify(newFriends))
    } finally {
      setLoading(false)
    }
  }, [bearerToken])

  const loadFriendsWithTrades = useCallback(async () => {
    if (!bearerToken) {
      toast.error('Le bearer token est nécessaire pour recharger la collection')
      return
    }

    if (loading) {
      toast.error('Un chargement est déjà en cours')
      return
    }
    setLoading(true)

    try {
      const fetchedFriendsData = await toast.promise(fetchFriends(bearerToken), {
        pending: 'Mise a jour des amis',
        success: 'Amis à jour 👌',
        error: 'Erreur durant le chargement des amis',
      })

      const fetchedFriendsTradelists = await toast.promise(fetchFriendsTradelist(bearerToken, fetchedFriendsData), {
        pending: "Mise a jour des listes d'échange",
        success: "Listes d'échange à jour 👌",
        error: "Erreur durant la mise à jour des listes d'échange",
      })

      const newFriends = fetchedFriendsData.map(
        (friend): Friend => ({ ...friend, updatedAt: new Date().toISOString() })
      )
      setFriends(newFriends)
      setFriendsTradelists(fetchedFriendsTradelists)

      localStorage.setItem('friends', JSON.stringify(newFriends))
      localStorage.setItem('friendsTradelists', JSON.stringify(fetchedFriendsTradelists))
    } finally {
      setLoading(false)
    }
  }, [bearerToken])

  const openModal = async (friend) => {
    if (bearerToken) {
      const fetchedFriendsTradelists = await fetchFriendsTradelist(bearerToken, [friend])

      const newFriendsTradelists = { ...friendsTradelists, [friend.id]: fetchedFriendsTradelists[friend.id] }
      setFriendsTradelists(newFriendsTradelists)
      localStorage.setItem('friendsTradelists', JSON.stringify(newFriendsTradelists))

      const newFriends = friends.map((f) =>
        f.id === friend.id ? { ...friend, updatedAt: new Date().toISOString() } : f
      )
      setFriends(newFriends)
      localStorage.setItem('friends', JSON.stringify(newFriends))
    }
    setSelectedFriend(friend)
  }

  const closeModal = () => {
    setSelectedFriend(null)
  }

  return (
    <React.Fragment>
      <div className="h-full flex flex-col">
        <div className="text-center pb-4 space-x-2">
          <button type="button" className="btn-navbar" onClick={loadFriendsWithoutTrades}>
            Recharger les amis sans leurs échanges
          </button>
          <button type="button" className="btn-navbar" onClick={loadFriendsWithTrades}>
            Recharger avec les échanges (beaucoup plus long)
          </button>
        </div>
        <div className="flex-grow overflow-y-auto pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {friends.map((friend) => (
            <div key={friend.id} className="clickable-cards flex flex-col max-w-80" onClick={() => openModal(friend)}>
              <h2 className="text-xl font-bold mb-2 text-center">
                {friend.name} ({(friendsTradelists[friend.id] || []).reduce((total, card) => total + card.theyHave, 0)}{' '}
                cartes)
              </h2>
              <div className="text-sm">Dernière MAJ: {friend.updatedAt.replace('T', ' ').split('.')[0]}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedFriend && (
        <FriendModal
          closeModal={closeModal}
          selectedFriend={selectedFriend}
          cards={friendsTradelists[selectedFriend.id] || []}
        />
      )}
    </React.Fragment>
  )
}

const CustomSelect = ({
  filter,
  options,
  onChange,
  currentFilters,
}: {
  filter: 'factions' | 'rarity'
  options: { value: Faction | Rarity; label: string }[]
  onChange: (value: TradeListFilters) => void | Promise<void>
  currentFilters: TradeListFilters
}) => {
  const changeHandler = (selected: { value: string; label: string }[]) => {
    const values = selected.map((option) => option.value)

    onChange({ ...currentFilters, [filter]: values })
  }

  return (
    <MultiSelect
      options={options}
      value={options.filter((option) => currentFilters[filter].includes(option.value as never))}
      onChange={changeHandler}
      labelledBy={filter}
      className="w-80"
    />
  )
}
