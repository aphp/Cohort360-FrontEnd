import React, { useState } from 'react'
import { Tab, Tabs } from '@mui/material'
import CareSiteSearch from './CareSiteSearch/./index'
import CareSiteExploration from './CareSiteExploration'
import { ScopeTreeRow, ScopeType } from '../../types'
import ScopeSearchBar from '../Inputs/ScopeSearchBar/ScopeSearchBar'
import useStyles from './styles'
import CareSiteChipsets from './CareSiteChipsets/CareSiteChipsets'
import { onSelect } from './commons/scopeTreeUtils'
import { useAppSelector } from '../../state'
import { ScopeState } from '../../state/scope'

export type CareSiteSearchProps = {
  searchInput: string
  selectedItems: ScopeTreeRow[]
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  executiveUnitType?: ScopeType
}

export type CareSiteExplorationProps = {
  selectedItems: ScopeTreeRow[]
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  openPopulation: number[]
  setOpenPopulations: (openPopulation: number[]) => void
  executiveUnitType?: ScopeType
}
type ScopeTreeProps = CareSiteExplorationProps & CareSiteSearchProps

const Index = (props: ScopeTreeProps) => {
  const { selectedItems, setSelectedItems, openPopulation, setOpenPopulations, executiveUnitType, searchInput } = props

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))
  const { scopesList = [] } = scopeState
  const [selectedTab, setSelectedTab] = useState<'search' | 'hierarchy'>('hierarchy')
  const [_searchInput, _setSearchInput] = useState('')
  const { classes } = useStyles()

  return (
    <>
      <Tabs
        indicatorColor="secondary"
        className={classes.tabs}
        value={selectedTab}
        onChange={(e, tab) => setSelectedTab(tab)}
      >
        <Tab label="Hiérarchie" value="hierarchy" />
        <Tab label="Recherche" value="search" />
      </Tabs>
      <div>
        <CareSiteChipsets
          selectedItems={selectedItems}
          onDelete={(item) => onSelect(item, selectedItems, setSelectedItems, scopesList)}
        />
        {selectedTab === 'search' && (
          <>
            <div className={classes.searchBar}>
              <ScopeSearchBar searchInput={_searchInput} setSearchInput={_setSearchInput} />
            </div>
            <CareSiteSearch
              searchInput={_searchInput}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              executiveUnitType={executiveUnitType}
            />
          </>
        )}
        {selectedTab === 'hierarchy' && (
          <CareSiteExploration
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            openPopulation={openPopulation}
            setOpenPopulations={setOpenPopulations}
            executiveUnitType={executiveUnitType}
          />
        )}
      </div>
    </>
  )
}
export default Index
