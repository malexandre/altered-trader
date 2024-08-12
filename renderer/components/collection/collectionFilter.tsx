import React from 'react'
import { MultiSelect } from 'react-multi-select-component'

export interface SearchFilters {
  factions: Faction[]
  rarity: Rarity[]
  cardType: CardType[]
  missing: boolean
  inExtra: boolean
  inMyWantlist: boolean
}

export default function Filter(props: {
  currentFilters: SearchFilters
  onChange: (value: SearchFilters) => void | Promise<void>
}) {
  return (
    <div className="grid grid-cols-4 gap-4 m-4">
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
          currentFilters={props.currentFilters}
          onChange={props.onChange}
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
          currentFilters={props.currentFilters}
          onChange={props.onChange}
        />
      </div>
      <div className="space-y-2">
        <div className="text-center">Type de cartes</div>
        <CustomSelect
          filter="cardType"
          options={[
            { value: 'SPELL', label: 'Sort' },
            { value: 'PERMANENT', label: 'Permanent' },
            { value: 'TOKEN', label: 'Jeton Personnage' },
            { value: 'CHARACTER', label: 'Personnage' },
            { value: 'HERO', label: 'Héros' },
            { value: 'TOKEN_MANA', label: 'Mana' },
            { value: 'FOILER', label: 'Foiler' },
          ]}
          currentFilters={props.currentFilters}
          onChange={props.onChange}
        />
      </div>
      <div className="space-y-2 flex flex-col justify-center">
        <div className="space-x-2 flex">
          <input
            id="missing"
            type="checkbox"
            defaultChecked={props.currentFilters.missing}
            onClick={() => props.onChange({ ...props.currentFilters, missing: !props.currentFilters.missing })}
          />
          <label className="text-center" htmlFor="missing">
            Manquantes
          </label>
        </div>
        <div className="space-x-2 flex">
          <input
            id="inExtra"
            type="checkbox"
            defaultChecked={props.currentFilters.inExtra}
            onClick={() => props.onChange({ ...props.currentFilters, inExtra: !props.currentFilters.inExtra })}
          />
          <label className="text-center" htmlFor="inExtra">
            En surplus
          </label>
        </div>
        <div className="space-x-2 flex">
          <input
            id="inMyWantlist"
            type="checkbox"
            defaultChecked={props.currentFilters.inMyWantlist}
            onClick={() =>
              props.onChange({ ...props.currentFilters, inMyWantlist: !props.currentFilters.inMyWantlist })
            }
          />
          <label className="text-center" htmlFor="inMyWantlist">
            Wantlist
          </label>
        </div>
      </div>
    </div>
  )
}

const CustomSelect = ({
  filter,
  options,
  onChange,
  currentFilters,
}: {
  filter: 'factions' | 'rarity' | 'cardType'
  options: { value: Faction | CardType | Rarity; label: string }[]
  onChange: (value: SearchFilters) => void | Promise<void>
  currentFilters: SearchFilters
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
    />
  )
}
