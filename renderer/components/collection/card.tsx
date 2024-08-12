import { Fragment, useState } from 'react'
import { Card } from '../../app/fetchCollection'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faExchangeAlt, faLayerGroup, faPlus } from '@fortawesome/free-solid-svg-icons'
import Modal from '../modal'
import CardDetail from './cardDetail'

export default function CardComponent({ card }: { card: Card }) {
  const [cardDetailsOpened, setCardDetailsOpened] = useState(false)

  const traders = Object.entries(card.friendsOwn)
    .map(([name, count]) => `${name} (${count})`)
    .join(', ')

  return (
    <Fragment>
      <div
        key={card.collectorNumber}
        className="relative"
        style={{ width: '264px', height: '369px' }}
        onClick={() => setCardDetailsOpened(true)}
      >
        <img
          src={card.imagePath}
          alt={card.name}
          className="w-full h-full rounded-lg"
          width={264}
          height={369}
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 flex space-x-2 bg-black/40 p-2 rounded-lg">
          {card.inMyWantlist && (
            <div
              className="bg-green-600 text-white rounded-full px-3 py-1 text-xs flex items-center"
              title={`Dispo chez: ${traders}`}
            >
              <FontAwesomeIcon icon={faCartShopping} className="mr-1" />
            </div>
          )}
          <div className="bg-blue-600 text-white rounded-full px-3 py-1 text-xs flex items-center">
            <FontAwesomeIcon icon={faLayerGroup} className="mr-1" />
            {card.inMyCollection}
          </div>
          <div className="relative bg-red-600 text-white rounded-full px-3 py-1 text-xs flex items-center">
            <FontAwesomeIcon icon={faExchangeAlt} className="mr-1" />
            {card.inMyTradelist}
          </div>
        </div>
      </div>

      {cardDetailsOpened && (
        <Modal onClose={() => setCardDetailsOpened(false)}>
          <CardDetail card={card} />
        </Modal>
      )}
    </Fragment>
  )
}
