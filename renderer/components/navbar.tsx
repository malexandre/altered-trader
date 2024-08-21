import React, { useContext } from 'react'
import Link from 'next/link'
import { CardCollection } from '../app/fetchCollection'
import { UserCollectionContext } from '../app/collectionContext'

const Navbar = ({
  bearerToken,
  setBearerToken,
}: {
  bearerToken: string
  setBearerToken: (value: string) => void | Promise<void>
}) => {
  const userCollection: CardCollection = useContext(UserCollectionContext)
  const cardsInWantlist = Object.values(userCollection).reduce((total, card) => {
    const totalPlayset = ['SPELL', 'PERMANENT', 'CHARACTER'].includes(card.cardType) ? 3 : 1

    return card.inMyWantlist ? total + Math.max(0, totalPlayset - card.inMyCollection) : total
  }, 0)

  return (
    <nav className="bg-gray-800 p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <ul className="flex space-x-4">
          <li>
            <Link className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium" href="/collection">
              My Collection
            </Link>
          </li>
          <li>
            <Link className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium" href="/stats">
              Stats
            </Link>
          </li>
          <li>
            <Link className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium" href="/wantlist">
              Wantlist ({cardsInWantlist})
            </Link>
          </li>
          <li>
            <Link className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium" href="/trades">
              Échanges
            </Link>
          </li>
          <li>
            <Link className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium" href="/friends">
              Amis
            </Link>
          </li>
          <li>
            <Link className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium" href="/uniques">
              Uniques au trade
            </Link>
          </li>
        </ul>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Bearer Token"
            value={bearerToken}
            onChange={(e) => setBearerToken(e.target.value)}
            className="px-3 py-2 rounded-md text-sm"
          />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
