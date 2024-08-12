import React, { useCallback, useContext, useEffect, useState } from 'react'
import Filter, { SearchFilters } from '../components/collection/collectionFilter'
import CardsComponent from '../components/collection/cardList'
import 'react-toastify/dist/ReactToastify.css'
import { UserCollectionDispatchContext } from '../app/collectionContext'
import { toast } from 'react-toastify'
import { fetchMyCollection } from '../app/fetchCollection'
import { BearerTokenContext } from '../app/bearerTokenContext'

export default function CollectionPage() {
  const bearerToken = useContext(BearerTokenContext)
  const collectionDispatch = useContext(UserCollectionDispatchContext)
  const [loading, setLoading] = useState(false)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    cardType: [],
    factions: [],
    rarity: [],
    inExtra: false,
    missing: false,
    inMyWantlist: false,
  })
  useEffect(() => {
    const userCollection = localStorage.getItem('userCollection')
    if (userCollection && collectionDispatch) {
      collectionDispatch({ collection: JSON.parse(userCollection), type: 'collectionFetched' })
    }
  }, [])

  const loadData = useCallback(async () => {
    if (!collectionDispatch) {
      toast.error('Collection inaccessible')
      return
    }

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
      const fetchedCollection = await toast.promise(fetchMyCollection(bearerToken), {
        pending: 'Mise à jour de la collection',
        success: 'Collection à jour 👌',
        error: 'Erreur durant le chargement de la collection',
      })
      collectionDispatch({ collection: fetchedCollection, type: 'collectionFetched' })
    } finally {
      setLoading(false)
    }
  }, [bearerToken])

  return (
    <div className="h-full flex flex-col">
      <div className="text-center pb-4">
        <button type="button" className="btn-navbar" onClick={() => loadData()}>
          Recharger la collection
        </button>
      </div>
      <div className="flex-grow overflow-y-auto pt-4">
        <Filter currentFilters={searchFilters} onChange={setSearchFilters} />
        {<CardsComponent filters={searchFilters} />}
      </div>
    </div>
  )
}
