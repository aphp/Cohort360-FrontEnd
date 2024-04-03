import React, { useState } from 'react'
import { useAppSelector } from 'state'
import { ScopeTreeRow, ScopeType } from 'types'
import { getCurrentScopeList } from 'utils/scopeTree'
import ScopeTreeChipsets from './ScopeTreeChipsets'
import ScopeTreeExploration from './ScopeTreeExploration'
import ScopeTreeSearch from './ScopeTreeSearch'
import { onSelect } from './utils/scopeTreeUtils'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { Grid } from '@mui/material'

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
  const scopeState = useAppSelector((state) => state.scope || {})
  const isExecutiveUnit: boolean = !!executiveUnitType ?? false
  const scopesList: ScopeTreeRow[] = getCurrentScopeList(scopeState.scopesList, isExecutiveUnit) ?? []
  const [searchInput, setSearchInput] = useState('')
  const [searchSavedRootRows, setSearchSavedRootRows] = useState<ScopeTreeRow[]>([...scopesList])
  const [isSelectionLoading, setIsSelectionLoading] = useState<boolean>(false)

  /** cast selectedItems.id into string for comparaison
   * TODO : Change call made by alizé to retrive caresite into filters.ts to avoid the cast
   */
  const fixSelectedItems = selectedItems.map((item) => ({
    ...item,
    id: item.id?.toString()
  }))

  return (
    <div>
      <ScopeTreeChipsets
        selectedItems={fixSelectedItems}
        onDelete={(item) =>
          onSelect(item, fixSelectedItems, setSelectedItems, scopesList, isSelectionLoading, setIsSelectionLoading)
        }
      />

      <Grid style={{ width: '25%', marginLeft: '75%', marginBottom: '10px' }}>
        <SearchInput value={searchInput} placeholder={'Rechercher'} onchange={(newValue) => setSearchInput(newValue)} />{' '}
      </Grid>

      {searchInput ? (
        <ScopeTreeSearch
          searchInput={searchInput}
          selectedItems={fixSelectedItems}
          setSelectedItems={setSelectedItems}
          searchSavedRootRows={searchSavedRootRows}
          setSearchSavedRootRows={setSearchSavedRootRows}
          executiveUnitType={executiveUnitType}
          isSelectionLoading={isSelectionLoading}
          setIsSelectionLoading={setIsSelectionLoading}
        />
      ) : (
        <ScopeTreeExploration
          selectedItems={fixSelectedItems}
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
  )
}
export default Index
