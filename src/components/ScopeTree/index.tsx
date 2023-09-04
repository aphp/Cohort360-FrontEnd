import React, { useState } from 'react'
import CareSiteSearch from './CareSiteSearch/./index'
import CareSiteExploration from './CareSiteExploration'
import { ScopeTreeRow, ScopeType } from 'types'
import ScopeSearchBar from '../Inputs/ScopeSearchBar/ScopeSearchBar'
import useStyles from './styles'
import CareSiteChipsets from './CareSiteChipsets/CareSiteChipsets'
import { onSelect } from './utils/scopeTreeUtils'
import { useAppSelector } from 'state'
import { ScopeState } from 'state/scope'

export type CareSiteSearchProps = {
  searchInput: string
  selectedItems: ScopeTreeRow[]
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  searchRootRows: ScopeTreeRow[]
  setSearchRootRows: (selectedItems: ScopeTreeRow[]) => void
  isSelectionLoading: boolean
  setIsSelectionLoading: (isSelectionLoading: boolean) => void
  executiveUnitType?: ScopeType
}

export type CareSiteExplorationProps = {
  selectedItems: ScopeTreeRow[]
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  searchRootRows: ScopeTreeRow[]
  setSearchRootRows: (selectedItems: ScopeTreeRow[]) => void
  openPopulation: number[]
  setOpenPopulations: (openPopulation: number[]) => void
  isSelectionLoading: boolean
  setIsSelectionLoading: (isSelectionLoading: boolean) => void
  executiveUnitType?: ScopeType
}

type ScopeTreeExcludedProps = {
  searchInput: string
  searchRootRows: ScopeTreeRow[]
  setSearchRootRows: (selectedItems: ScopeTreeRow[]) => void
  isSelectionLoading: boolean
  setIsSelectionLoading: (isSelectionLoading: boolean) => void
}
type ScopeTreeProps = {
  [K in Exclude<
    keyof CareSiteExplorationProps | keyof CareSiteSearchProps,
    keyof ScopeTreeExcludedProps
  >]: K extends keyof CareSiteExplorationProps
    ? CareSiteExplorationProps[K]
    : K extends keyof CareSiteSearchProps
    ? CareSiteSearchProps[K]
    : never
}

const Index = (props: ScopeTreeProps) => {
  const { selectedItems, setSelectedItems, openPopulation, setOpenPopulations, executiveUnitType } = props

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))
  const { scopesList = [] } = scopeState
  const [searchInput, setSearchInput] = useState('')
  const [searchRootRows, setSearchRootRows] = useState<ScopeTreeRow[]>([...scopesList])
  const [isSelectionLoading, setIsSelectionLoading] = useState<boolean>(false)

  const { classes } = useStyles()

  return (
    <>
      <div>
        <CareSiteChipsets
          selectedItems={selectedItems}
          onDelete={(item) =>
            onSelect(item, selectedItems, setSelectedItems, scopesList, isSelectionLoading, setIsSelectionLoading)
          }
        />
        <div className={classes.searchBar}>
          <ScopeSearchBar searchInput={searchInput} setSearchInput={setSearchInput} />
        </div>
        {searchInput ? (
          <CareSiteSearch
            searchInput={searchInput}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            searchRootRows={searchRootRows}
            setSearchRootRows={setSearchRootRows}
            executiveUnitType={executiveUnitType}
            isSelectionLoading={isSelectionLoading}
            setIsSelectionLoading={setIsSelectionLoading}
          />
        ) : (
          <CareSiteExploration
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            searchRootRows={searchRootRows}
            setSearchRootRows={setSearchRootRows}
            openPopulation={openPopulation}
            setOpenPopulations={setOpenPopulations}
            executiveUnitType={executiveUnitType}
            isSelectionLoading={isSelectionLoading}
            setIsSelectionLoading={setIsSelectionLoading}
          />
        )}
      </div>
    </>
  )
}
export default Index
