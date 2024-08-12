interface ApiCard {
  "@id": string;
  "@type": string;
  reference: string;
  cardType: ApiCardType;
  cardSubTypes: ApiCardSubType[];
  rarity: ApiRarity;
  cardProduct: ApiCardProduct;
  imagePath: string;
  latestAddition: string;
  inMyTradelist: number;
  inMyCollection: number;
  inMyWantlist: boolean;
  assets: ApiAssets;
  qrUrlDetail: string;
  id: string;
  mainFaction: ApiFaction;
  name: string;
  elements: ApiElements;
  collectorNumberFormatted: string;
}

interface ApiCardType {
  "@id": string;
  "@type": string;
  reference: CardType;
  id: string;
  name: string;
}

interface ApiCardSubType {
  "@id": string;
  "@type": string;
  reference: string;
  id: string;
  name: string;
}

interface ApiRarity {
  "@id": string;
  "@type": string;
  reference: Rarity;
  id: string;
  name: string;
}

interface ApiCardProduct {
  "@id": string;
  "@type": string;
  reference: string;
  name: string;
}

interface ApiAssets {
  WEB: string[];
}

interface ApiFaction {
  "@id": string;
  "@type": string;
  reference: Faction;
  color: string;
  id: string;
  name: string;
}

interface ApiElements {
  MAIN_COST: string;
  RECALL_COST: string;
  OCEAN_POWER: string;
  MOUNTAIN_POWER: string;
  FOREST_POWER: string;
  MAIN_EFFECT: string;
}
