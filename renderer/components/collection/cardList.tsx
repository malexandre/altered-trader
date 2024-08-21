import { useContext } from 'react'
import { CardCollection } from '../../app/fetchCollection'
import { SearchFilters } from './collectionFilter'
import { UserCollectionContext } from '../../app/collectionContext'
import CardComponent from './card'

export default function CardsComponent({ filters }: { filters: SearchFilters }) {
  const userCollection: CardCollection = useContext(UserCollectionContext)

  return (
    <div className="flex flex-wrap gap-4">
      {Object.values(userCollection)
        .filter((card) => {
          if (card.cardType === 'FOILER') {
            return false
          }

          if (filters.rarity.length && !filters.rarity.includes(card.rarity)) {
            return false
          }

          if (filters.cardType.length && !filters.cardType.includes(card.cardType)) {
            return false
          }

          if (filters.factions.length && !filters.factions.includes(card.faction)) {
            return false
          }

          if (
            filters.missing &&
            (card.inMyCollection >= 3 ||
              (card.inMyCollection == 1 && (card.rarity == 'UNIQUE' || card.cardType == 'HERO')))
          ) {
            return false
          }

          if (
            filters.inExtra &&
            (card.inMyCollection <= 3 || (card.cardType == 'CHARACTER' && card.inMyCollection <= 1))
          ) {
            return false
          }

          if (filters.inMyWantlist && !card.inMyWantlist) {
            return false
          }

          if (!filters.missing && card.inMyCollection === 0) {
            return false
          }

          return true
        })
        .map((card) => (
          <CardComponent key={card.collectorNumber} card={card} />
        ))}
    </div>
  )
}
