import { Fragment, useContext, useEffect, useState } from 'react'
import fetchTrades, { Trade } from '../app/fetchTrades'
import { BearerTokenContext } from '../app/bearerTokenContext'
import Modal from '../components/modal'
import { acceptTrade } from '../app/acceptTrade'
import { cancelTrade } from '../app/cancelTrade'
import { toast } from 'react-toastify'

export default function Trades() {
  const bearerToken = useContext(BearerTokenContext)
  const [trades, setTrades] = useState<Trade[]>([])
  const [tradeSelected, selectTrade] = useState<Trade | null>(null)

  const selectedSending = tradeSelected?.sending.reduce((amount, card) => amount + card.quantity, 0)
  const selectedReceiving = tradeSelected?.receiving.reduce((amount, card) => amount + card.quantity, 0)

  let selectedWording = {
    sending: 'envoyées',
    receiving: 'reçues',
  }
  if (tradeSelected?.status === 'in_progress' || tradeSelected?.status === 'draft') {
    selectedWording = {
      sending: 'proposées',
      receiving: `demandées à ${tradeSelected.tradeWith}`,
    }
  }

  const closeModal = () => selectTrade(null)

  const fetchData = async () => {
    if (!bearerToken) {
      return
    }

    const trades = await fetchTrades(bearerToken)
    if (trades) {
      setTrades(trades)
    }
  }

  useEffect(() => {
    fetchData()
  }, [bearerToken])

  return (
    <Fragment>
      <h1 className="text-2xl font-bold mb-8 text-center">Échanges</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {trades.map((trade) => {
          const sending = trade.sending.reduce((amount, card) => amount + card.quantity, 0)
          const receiving = trade.receiving.reduce((amount, card) => amount + card.quantity, 0)

          let wording = {
            status: 'Terminé',
            sending: 'envoyées',
            receiving: 'reçues',
          }

          if (trade.status === 'in_progress' || trade.status === 'draft') {
            wording = {
              status: 'En cours',
              sending: 'proposées',
              receiving: `demandées à ${trade.tradeWith}`,
            }
          }

          return (
            <div className="clickable-cards" onClick={() => selectTrade(trade)}>
              <h2 className="text-xl font-bold mb-2">{trade.tradeWith}</h2>
              <div>{wording.status}</div>
              <div>
                {sending} cartes {wording.sending}
              </div>
              <div>
                {receiving} cartes {wording.receiving}
              </div>
            </div>
          )
        })}
      </div>

      {tradeSelected && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4 text-center">{tradeSelected.tradeWith}</h2>
          <div className="flex-grow overflow-y-auto grid grid-cols-2 gap-4">
            <div>
              <h3 className="capitalize text-center text-lg mb-4">
                {selectedWording.sending} ({selectedSending})
              </h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {tradeSelected.sending.map((sendingCard) => (
                  <div className="relative">
                    <img
                      src={sendingCard.card.imagePath}
                      alt={sendingCard.card.reference}
                      className="rounded-lg"
                      style={{ width: '132px', height: '184px' }}
                    />
                    <div className="absolute bottom-2 right-2 bg-white text-xs rounded p-2">{sendingCard.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="capitalize text-center text-lg mb-4">
                {selectedWording.receiving} ({selectedReceiving})
              </h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {tradeSelected.receiving.map((receivingCard) => (
                  <div className="relative">
                    <img
                      src={receivingCard.card.imagePath}
                      alt={receivingCard.card.reference}
                      className="rounded-lg"
                      style={{ width: '132px', height: '184px' }}
                    />
                    <div className="absolute bottom-2 right-2 bg-white text-xs rounded p-2">
                      {receivingCard.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {tradeSelected.status === 'draft' && (
            <div className="bg-white text-center mt-4">
              <button
                onClick={() => {
                  if (window.confirm('Voulez-vous vraiment envoyer cet échange ?')) {
                    acceptTrade(bearerToken, tradeSelected.id)
                    toast.info('Échange envoyé !')
                    closeModal()
                    fetchData()
                    selectTrade(null)
                  }
                }}
                className="btn-primary"
              >
                Envoyer l'échange
              </button>

              <button
                onClick={async () => {
                  if (window.confirm("Voulez-vous vraiment annuler cet échange ? L'annuler sera définitif")) {
                    await cancelTrade(bearerToken, tradeSelected.id)
                    toast.info('Échange annulé')
                    closeModal()
                    fetchData()
                    selectTrade(null)
                  }
                }}
                className="btn-secondary"
              >
                Annuler l'échange
              </button>
            </div>
          )}
          {tradeSelected.status === 'in_progress' && tradeSelected.myTurn && !tradeSelected.initiatedByMe && (
            <div className="bg-white text-center mt-4">
              <button
                onClick={() => {
                  if (window.confirm("Voulez-vous vraiment accepter ce trade ? L'accepter sera définitif")) {
                    acceptTrade(bearerToken, tradeSelected.id)
                    toast.info('Contre échange proposé !')
                    closeModal()
                    fetchData()
                    selectTrade(null)
                  }
                }}
                className="btn-primary"
              >
                Proposer le contre échange
              </button>

              <button
                onClick={async () => {
                  if (window.confirm('Voulez-vous vraiment refuser cet échange ? Le refuser sera définitif')) {
                    await cancelTrade(bearerToken, tradeSelected.id)
                    toast.info('Échange refusé')
                    closeModal()
                    fetchData()
                    selectTrade(null)
                  }
                }}
                className="btn-secondary"
              >
                Refuser l'échange
              </button>
            </div>
          )}
        </Modal>
      )}
    </Fragment>
  )
}
