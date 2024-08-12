import React, { useContext } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { CardCollection } from '../app/fetchCollection'
import { UserCollectionContext } from '../app/collectionContext'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
import { FriendCard } from '../app/fetchFriendTradelist'
import { FriendTradelistsContext } from '../app/friendsContext'

Chart.register(...registerables)

class CollectionStat {
  private _count: number
  private _total: number

  constructor() {
    this._count = 0
    this._total = 0
  }

  get count(): number {
    return this._count
  }

  get total(): number {
    return this._total
  }

  get ratio(): number {
    return this._count / this._total
  }

  addToSet(owned: number, total: number) {
    this._count += owned
    this._total += total
  }
}

class CollectionSet {
  total: CollectionStat
  AX: CollectionStat
  BR: CollectionStat
  LY: CollectionStat
  MU: CollectionStat
  OR: CollectionStat
  YZ: CollectionStat

  constructor() {
    this.total = new CollectionStat()
    this.AX = new CollectionStat()
    this.BR = new CollectionStat()
    this.LY = new CollectionStat()
    this.MU = new CollectionStat()
    this.OR = new CollectionStat()
    this.YZ = new CollectionStat()
  }
}

interface Stats {
  commonMasterSet: CollectionSet
  rareMasterSet: CollectionSet
  commonPlaySet: CollectionSet
  rarePlaySet: CollectionSet
  availableInFriendTradelists: CollectionSet
  missingAndAvailableInFriendTradelists: CollectionSet
  uniqueInCollection: CollectionSet
  uniqueInFriendTradelists: CollectionSet
}

const commonBackgroundColor = [
  'rgba(165, 42, 42, 0.2)',
  'rgba(255, 0, 0, 0.2)',
  'rgba(255, 192, 203, 0.2)',
  'rgba(0, 128, 0, 0.2)',
  'rgba(0, 0, 255, 0.2)',
  'rgba(128, 0, 128, 0.2)',
]

const rareBackgroundColor = [
  'rgba(139, 34, 34, 0.4)',
  'rgba(205, 0, 0, 0.4)',
  'rgba(219, 112, 147, 0.4)',
  'rgba(0, 100, 0, 0.4)',
  'rgba(0, 0, 205, 0.4)',
  'rgba(75, 0, 130, 0.4)',
]

function CollectionSetComponent({
  name,
  commonSet,
  rareSet,
}: {
  name: string
  commonSet: CollectionSet
  rareSet: CollectionSet
}) {
  const faction = ['AX', 'BR', 'LY', 'MU', 'OR', 'YZ']

  const computeRatio = (stat: CollectionStat, commonStat: CollectionStat, rareStat: CollectionStat) =>
    (stat.count * 100) / (commonStat.total + rareStat.total)

  const computeTooltip = (faction: Faction) => {
    const factionCount = commonSet[faction].count + rareSet[faction].count
    const factionTotal = commonSet[faction].total + rareSet[faction].total
    const factionRatio = Math.round((factionCount * 100) / factionTotal)
    const commonStat: CollectionStat = commonSet[faction]
    const rareStat: CollectionStat = rareSet[faction]

    return [
      `${factionCount}/${factionTotal} (${factionRatio}%):`,
      `  Communes: ${commonStat.count}/${commonStat.total} (${Math.round(commonStat.ratio * 100)}%)`,
      `  Rares: ${rareStat.count}/${rareStat.total} (${Math.round(rareStat.ratio * 100)}%)`,
    ]
  }

  const aggregateCount = commonSet.total.count + rareSet.total.count
  const aggregateTotal = commonSet.total.total + rareSet.total.total
  const aggregateRatio = Math.round((aggregateCount * 100) / aggregateTotal)

  const data = {
    labels: ['Axiom', 'Bravos', 'Lyra', 'Muna', 'Ordis', 'Yzmir'],
    datasets: [
      {
        label: 'Common',
        data: [
          computeRatio(commonSet.AX, commonSet.AX, rareSet.AX),
          computeRatio(commonSet.BR, commonSet.BR, rareSet.BR),
          computeRatio(commonSet.LY, commonSet.LY, rareSet.LY),
          computeRatio(commonSet.MU, commonSet.MU, rareSet.MU),
          computeRatio(commonSet.OR, commonSet.OR, rareSet.OR),
          computeRatio(commonSet.YZ, commonSet.YZ, rareSet.YZ),
        ],
        backgroundColor: commonBackgroundColor,
        borderWidth: 0,
      },
      {
        label: 'Rare',
        data: [
          computeRatio(rareSet.AX, commonSet.AX, rareSet.AX),
          computeRatio(rareSet.BR, commonSet.BR, rareSet.BR),
          computeRatio(rareSet.LY, commonSet.LY, rareSet.LY),
          computeRatio(rareSet.MU, commonSet.MU, rareSet.MU),
          computeRatio(rareSet.OR, commonSet.OR, rareSet.OR),
          computeRatio(rareSet.YZ, commonSet.YZ, rareSet.YZ),
        ],
        backgroundColor: rareBackgroundColor,
        borderWidth: 0,
      },
    ],
  }

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `${name} ${aggregateCount}/${aggregateTotal} (${aggregateRatio}%)`,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            return computeTooltip(faction[tooltipItem.dataIndex] as Faction)
          },
        },
      },
      legend: { display: false },
    },
    x: {
      stacked: true,
      beginAtZero: true,
      max: 100,
    },
    y: {
      stacked: true,
    },
  }

  return (
    <div>
      <Bar options={options} data={data} />
    </div>
  )
}
function TradeListComponent({ name, collectionSet }: { name: string; collectionSet: CollectionSet }) {
  const data = {
    labels: ['Axiom', 'Bravos', 'Lyra', 'Muna', 'Ordis', 'Yzmir'],
    datasets: [
      {
        data: [
          collectionSet.AX.count,
          collectionSet.BR.count,
          collectionSet.LY.count,
          collectionSet.MU.count,
          collectionSet.OR.count,
          collectionSet.YZ.count,
        ],
        backgroundColor: commonBackgroundColor,
        borderColor: rareBackgroundColor,
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `${name}: ${collectionSet.total.count}`,
      },
      legend: { display: false },
    },
  }

  return (
    <div>
      <Pie data={data} options={options} />
    </div>
  )
}

export default function StatsPage() {
  const userCollection: CardCollection = useContext(UserCollectionContext)
  const { friendsTradelists } = useContext(FriendTradelistsContext)
  const stats = buildStatsFromCollection(userCollection, Object.values(friendsTradelists))

  return (
    <React.Fragment>
      <div className="container mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <CollectionSetComponent name="Master Set" commonSet={stats.commonMasterSet} rareSet={stats.rareMasterSet} />
          <CollectionSetComponent name="Play Set" commonSet={stats.commonPlaySet} rareSet={stats.rarePlaySet} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <TradeListComponent
            name="Dispo au trade dans la liste d'amis"
            collectionSet={stats.availableInFriendTradelists}
          />
          <TradeListComponent
            name="Uniques dispo dans la liste d'amis"
            collectionSet={stats.uniqueInFriendTradelists}
          />
          <TradeListComponent name="Uniques dans la collection" collectionSet={stats.uniqueInCollection} />
        </div>
      </div>
    </React.Fragment>
  )
}

function buildStatsFromCollection(userCollection: CardCollection, friendCards: FriendCard[][]): Stats {
  const collectionKeys = Object.keys(userCollection)

  const commonMasterSet = new CollectionSet()
  const rareMasterSet = new CollectionSet()
  const commonPlaySet = new CollectionSet()
  const rarePlaySet = new CollectionSet()
  const availableInFriendTradelists = new CollectionSet()
  const missingAndAvailableInFriendTradelists = new CollectionSet()
  const uniqueInCollection = new CollectionSet()
  const uniqueInFriendTradelists = new CollectionSet()

  for (const collectorNumber of collectionKeys) {
    const card = userCollection[collectorNumber]

    if (card.faction === 'NE' || card.cardType === 'TOKEN') {
      continue
    }

    if (card.rarity === 'UNIQUE') {
      uniqueInCollection.total.addToSet(1, 1)
      uniqueInCollection[card.faction].addToSet(1, 1)
      continue
    }

    const playsettNeeded =
      card.cardType === 'SPELL' || card.cardType === 'CHARACTER' || card.cardType === 'PERMANENT' ? 3 : 1
    const playsetCount = Math.min(playsettNeeded, card.inMyCollection)

    if (card.rarity === 'COMMON') {
      commonMasterSet.total.addToSet(Math.min(1, card.inMyCollection), 1)
      commonMasterSet[card.faction].addToSet(Math.min(1, card.inMyCollection), 1)

      commonPlaySet.total.addToSet(playsetCount, playsettNeeded)
      commonPlaySet[card.faction].addToSet(playsetCount, playsettNeeded)
    } else {
      rareMasterSet.total.addToSet(Math.min(1, card.inMyCollection), 1)
      rareMasterSet[card.faction].addToSet(Math.min(1, card.inMyCollection), 1)

      rarePlaySet.total.addToSet(playsetCount, playsettNeeded)
      rarePlaySet[card.faction].addToSet(playsetCount, playsettNeeded)
    }

    // if (playsetCount < playsettNeeded) {
    //   missingAndAvailableInFriendTradelists.total.addToSet(
    //     Math.min(playsettNeeded, card.theyHave) - playsetCount,
    //     playsettNeeded
    //   )
    //   missingAndAvailableInFriendTradelists[card.faction].addToSet(
    //     Math.min(playsettNeeded, card.theyHave) - playsetCount,
    //     playsettNeeded
    //   )
    // }
  }

  for (const cards of friendCards) {
    for (const card of cards) {
      if (card.cardType === 'FOILER' || card.cardType === 'HERO') {
        continue
      }

      if (card.rarity !== 'UNIQUE') {
        availableInFriendTradelists.total.addToSet(card.theyHave, 3)
        availableInFriendTradelists[card.faction].addToSet(card.theyHave, 3)
        continue
      }

      uniqueInFriendTradelists.total.addToSet(1, 1)
      uniqueInFriendTradelists[card.faction].addToSet(1, 1)
    }
  }

  return {
    availableInFriendTradelists,
    missingAndAvailableInFriendTradelists,
    uniqueInCollection,
    uniqueInFriendTradelists,
    commonMasterSet,
    rareMasterSet,
    commonPlaySet,
    rarePlaySet,
  }
}
