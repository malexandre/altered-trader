import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Card } from '../../app/fetchCollection'
import { faExchangeAlt, faLayerGroup, faMinus, faPlus, faUsers } from '@fortawesome/free-solid-svg-icons'
import { faSquare, faSquareCheck } from '@fortawesome/free-regular-svg-icons'
import { toast } from 'react-toastify'
import { debouncedUpdateTradelist } from '../../app/updateTradelist'
import { useContext } from 'react'
import { BearerTokenContext } from '../../app/bearerTokenContext'
import { UserCollectionDispatchContext } from '../../app/collectionContext'
import { BearerTokenUndefined, toggleWantlist } from '../../app/toggleWantlist'

export default function CardDetail({ card }: { card: Card }) {
  const bearerToken = useContext(BearerTokenContext)
  const collectionDispatch = useContext(UserCollectionDispatchContext)

  const handleUpdateTradelist = async (cardReference: string, amountToChange: number) => {
    const version = card.versionOwned.find((owned) => owned.reference === cardReference)
    if (!version) return

    const newAmount = Math.max(0, Math.min(version.inMyCollection, amountToChange))

    const newCard: Card = JSON.parse(JSON.stringify(card))
    const newVersion = newCard.versionOwned.find((owned) => owned.reference === cardReference)
    if (!newVersion) return
    newVersion.inMyTradelist = newAmount
    newCard.inMyTradelist = newCard.versionOwned.reduce((amount, version) => amount + version.inMyTradelist, 0)

    if (collectionDispatch) collectionDispatch({ type: 'cardsUpdated', cardsUpdated: [newCard] })
    debouncedUpdateTradelist(bearerToken, cardReference, newAmount)
  }

  const handleToggleWantlist = (cardReference: string) => {
    return async (event) => {
      event.stopPropagation()
      console.log('in handleToggleWantlist', cardReference)
      const toastId = toast.loading('Mise à jour de la wantlist...')
      try {
        const version = card.versionOwned.find((owned) => owned.reference === cardReference)
        if (!version) throw new Error('Version non trouvée')

        const newCard: Card = JSON.parse(JSON.stringify(card))
        const newVersion = newCard.versionOwned.find((owned) => owned.reference === cardReference)
        if (!newVersion) throw new Error('Version non trouvée')
        newVersion.inMyWantlist = await toggleWantlist(bearerToken, cardReference)
        newCard.inMyWantlist = newCard.versionOwned.reduce(
          (inMyWantlist, version) => inMyWantlist || version.inMyWantlist,
          false
        )

        if (collectionDispatch) collectionDispatch({ type: 'cardsUpdated', cardsUpdated: [newCard] })
      } catch (e) {
        if (e instanceof BearerTokenUndefined) {
          toast.update(toastId, {
            render: 'Le bearer token est nécessaire pour mettre à jour la wantlist',
            type: 'error',
            isLoading: false,
            autoClose: 5000,
            closeOnClick: true,
            draggable: true,
          })
          return
        }

        toast.update(toastId, {
          render: `Erreur durant la mise à jour de la wantlist: ${e.message}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000,
          closeOnClick: true,
          draggable: true,
        })
        return
      }
      toast.update(toastId, {
        render: `Wantlist mise à jour !`,
        type: 'info',
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      })
    }
  }

  return (
    <div className="flex h-full items-center align-middle">
      <div className="m-4">
        <img src={card.imagePath} alt={card.name} className="rounded-lg" width={264} height={369} loading="lazy" />
      </div>

      <div className="ml-6 flex-grow">
        <h2 className="text-2xl font-bold mb-4 text-center">{card.name}</h2>
        <div className="mb-4 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-[20px]">
              <FontAwesomeIcon icon={faLayerGroup} className="text-blue-600" />
            </span>
            <span>{card.inMyCollection} dans ma collection</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-[20px]">
              <FontAwesomeIcon icon={faExchangeAlt} className="text-red-600" />
            </span>
            <span>{card.inMyTradelist} dans ma trade list</span>
          </div>
          {/* <div className="flex items-center space-x-2">
            <span className="w-[20px]">
              <FontAwesomeIcon icon={faUsers} className="text-green-600" />
            </span>
            <span>{card.theyHave} dans les trade list de mes amis</span>
          </div> */}
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Versions :</h3>
          <table className="w-full table-auto">
            <tbody>
              {card.versionOwned.map((version) => (
                <tr key={version.id}>
                  <td className="p-2 w-1 whitespace-nowrap">
                    {version.reference.includes('COREKS') ? 'Kickstarter' : 'Retail'}
                  </td>
                  <td className="p-2 w-1 whitespace-nowrap pr-8">
                    : <FontAwesomeIcon icon={faLayerGroup} className="text-blue-600 ml-4 mr-2" />
                    <span className="w-[20px]">{version.inMyCollection}</span>
                    <FontAwesomeIcon icon={faExchangeAlt} className="text-red-600 ml-4 mr-2" />
                    <span className="w-[20px]">{version.inMyTradelist}</span>
                  </td>
                  <td className="p-2 space-x-2">
                    <button className="btn-trade" onClick={handleToggleWantlist(version.reference)}>
                      <FontAwesomeIcon icon={version.inMyWantlist ? faSquareCheck : faSquare} className="mr-2" />
                      Dans la wantlist
                    </button>
                  </td>
                  <td className="w-1/2 p-2 space-x-2">
                    <button
                      className={version.inMyTradelist > 0 ? 'btn-trade-minus' : 'btn-trade-disabled'}
                      onClick={() => handleUpdateTradelist(version.reference, version.inMyTradelist - 1)}
                      title="Enlever un exemplaire de la trade list"
                      disabled={version.inMyTradelist <= 0}
                    >
                      <FontAwesomeIcon icon={faMinus} className="mr-1" />
                      <span>Trade</span>
                    </button>
                    <button
                      className={
                        version.inMyCollection > version.inMyTradelist ? 'btn-trade-plus' : 'btn-trade-disabled'
                      }
                      onClick={() => handleUpdateTradelist(version.reference, version.inMyTradelist + 1)}
                      title="Ajouter un exemplaire à la trade list"
                      disabled={version.inMyCollection <= version.inMyTradelist}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-1" />
                      <span>Trade</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-semibold">Amis proposant la carte en trade :</h3>
          <ul className="list-disc list-inside">
            {Object.entries(card.friendsOwn).map(([friendName, count]) => (
              <li key={friendName}>
                {friendName}: {count}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
