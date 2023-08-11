import React, { useState } from 'react'
import { Tab, Tabs } from '@mui/material'
import CareSiteSearch from './CareSiteSearch/./index'
import CareSiteExploration from './CareSiteExploration'
import { ScopeTreeRow, ScopeType } from '../../types'
import ScopeSearchBar from '../Inputs/ScopeSearchBar/ScopeSearchBar'
import useStyles from './styles'

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
