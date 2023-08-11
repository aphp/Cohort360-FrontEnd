import React, { useState } from 'react'
import { Tab, Tabs } from '@mui/material'
import CareSiteSearch from './CareSiteSearch/CareSiteSearch'
import CareSiteExploration from './ExploratedCareSite/CareSiteExploration'
import useStyles from '../CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CCAM/styles'
import { ScopeTreeRow, ScopeType } from '../../types'

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

const NewScopeTree = (props: ScopeTreeProps) => {
  const { selectedItems, setSelectedItems, openPopulation, setOpenPopulations, executiveUnitType, searchInput } = props

  const [selectedTab, setSelectedTab] = useState<'search' | 'hierarchy'>('hierarchy')
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
      {selectedTab === 'search'} &&
      {
        <CareSiteSearch
          searchInput={searchInput}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          executiveUnitType={executiveUnitType}
        />
      }
      {selectedTab !== 'search'} &&
      {
        <CareSiteExploration
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          openPopulation={openPopulation}
          setOpenPopulations={setOpenPopulations}
          executiveUnitType={executiveUnitType}
        />
      }
    </>
  )
}
export default NewScopeTree
