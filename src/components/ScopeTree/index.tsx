import React, { useState } from 'react'
import { useAppSelector } from 'state'
import { ScopeState } from 'state/scope'
import { ScopeTreeRow, ScopeType } from 'types'
import ScopeSearchBar from '../Inputs/ScopeSearchBar/ScopeSearchBar'
import ScopeTreeChipsets from './ScopeTreeChipsets'
import ScopeTreeExploration from './ScopeTreeExploration'
import ScopeTreeSearch from './ScopeTreeSearch'
import useStyles from './styles'
import { onSelect } from './utils/scopeTreeUtils'

export type ScopeTreeSearchProps = {
  searchInput: string
  selectedItems: ScopeTreeRow[]
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  searchSavedRootRows: ScopeTreeRow[]
  setSearchSavedRootRows: (selectedItems: ScopeTreeRow[]) => void
  isSelectionLoading: boolean
  setIsSelectionLoading: (isSelectionLoading: boolean) => void
  executiveUnitType?: ScopeType
}

export type ScopeTreeExplorationProps = {
  selectedItems: ScopeTreeRow[]
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  searchSavedRootRows: ScopeTreeRow[]
  setSearchSavedRootRows: (selectedItems: ScopeTreeRow[]) => void
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
  searchSavedRootRows: ScopeTreeRow[]
  setSearchSavedRootRows: (selectedItems: ScopeTreeRow[]) => void
}
type ScopeTreeProps = {
  [K in Exclude<
    keyof ScopeTreeExplorationProps | keyof ScopeTreeSearchProps,
    keyof ScopeTreeExcludedProps
  >]: K extends keyof ScopeTreeExplorationProps
    ? ScopeTreeExplorationProps[K]
    : K extends keyof ScopeTreeSearchProps
    ? ScopeTreeSearchProps[K]
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
  const [searchSavedRootRows, setSearchSavedRootRows] = useState<ScopeTreeRow[]>([...scopesList])
  const [isSelectionLoading, setIsSelectionLoading] = useState<boolean>(false)

  const { classes } = useStyles()

  return (
    <>
      <div>
        <ScopeTreeChipsets
          selectedItems={selectedItems}
          onDelete={(item) =>
            onSelect(item, selectedItems, setSelectedItems, scopesList, isSelectionLoading, setIsSelectionLoading)
          }
        />
        <div className={classes.searchBar}>
          <ScopeSearchBar searchInput={searchInput} setSearchInput={setSearchInput} />
        </div>
        {searchInput ? (
          <ScopeTreeSearch
            searchInput={searchInput}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            searchSavedRootRows={searchSavedRootRows}
            setSearchSavedRootRows={setSearchSavedRootRows}
            executiveUnitType={executiveUnitType}
            isSelectionLoading={isSelectionLoading}
            setIsSelectionLoading={setIsSelectionLoading}
          />
        ) : (
          <ScopeTreeExploration
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            searchSavedRootRows={searchSavedRootRows}
            setSearchSavedRootRows={setSearchSavedRootRows}
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
