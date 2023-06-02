import React from 'react'
import CareSiteExplorationRow from '../ExploratedCareSite/Components/CareSiteExplorationRow'
import { ScopeTreeRow, TreeElement } from 'types'
import { PmsiListType } from 'state/pmsi'
import CareSiteSearchResultRow from '../CareSiteSearchResult/Components/CareSiteSearchResultRow'
import { expandScopeElement } from 'state/scope'
import { AppDispatch } from 'state'
import {
  checkIfIndeterminated,
  findEquivalentRowInItemAndSubItems,
  getHierarchySelection,
  optimizeHierarchySelection
} from 'utils/pmsi'
import { findSelectedInListAndSubItems } from 'utils/cohortCreation'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import { Checkbox } from '@mui/material'

export const displayCareSiteRow = (
  _row: any,
  level: number,
  parentAccess: string,
  selectedItems: ScopeTreeRow[],
  rootRows: ScopeTreeRow[],
  openPopulation: ScopeTreeRow[],
  labelId: string,
  onExpand: (rowId: number) => Promise<void>,
  onSelect: (row: ScopeTreeRow) => PmsiListType[],
  isIndeterminated: (row: ScopeTreeRow) => boolean | undefined,
  isSelected: (row: ScopeTreeRow) => boolean
) => {
  return (
    <React.Fragment key={Math.random()}>
      <CareSiteExplorationRow
        row={_row}
        level={level}
        parentAccess={parentAccess}
        openPopulation={openPopulation}
        labelId={labelId}
        onExpand={onExpand}
        onSelect={onSelect}
        isIndeterminated={isIndeterminated}
        isSelected={isSelected}
      />
      {openPopulation.find((id) => _row.id === id) &&
        _row.subItems &&
        _row.subItems.map((subItem: any) =>
          displayCareSiteRow(
            subItem,
            level + 1,
            parentAccess,
            selectedItems,
            rootRows,
            openPopulation,
            labelId,
            onExpand,
            onSelect,
            isIndeterminated,
            isSelected
          )
        )}
    </React.Fragment>
  )
}

export const displayCareSiteSearchResultRow = (
  row: ScopeTreeRow,
  level: number,
  parentAccess: string,
  selectedItems: ScopeTreeRow[],
  rootRows: ScopeTreeRow[],
  openPopulation: number[],
  labelId: string,
  onExpand: (rowId: number) => Promise<void>,
  onSelect: (row: ScopeTreeRow) => PmsiListType[],
  isIndeterminated: (row: ScopeTreeRow) => boolean | undefined,
  isSelected: (row: ScopeTreeRow) => boolean
) => {
  return (
    <React.Fragment key={Math.random()}>
      <CareSiteSearchResultRow
        row={row}
        level={level}
        parentAccess={parentAccess}
        openPopulation={openPopulation}
        labelId={labelId}
        onExpand={onExpand}
        onSelect={onSelect}
        isIndeterminated={isIndeterminated}
        isSelected={isSelected}
      />
      {openPopulation.find((id) => +row.id === id) &&
        row.subItems &&
        row.subItems.map((subItem: any) =>
          displayCareSiteSearchResultRow(
            subItem,
            level + 1,

            parentAccess,
            selectedItems,
            rootRows,
            openPopulation,
            labelId,
            onExpand,
            onSelect,
            isIndeterminated,
            isSelected
          )
        )}
    </React.Fragment>
  )
}

export const onSelectAll = (
  isAllSelected: boolean,
  setIsAllSelected: (newIsAllSelected: boolean) => void,
  scopesList: ScopeTreeRow[],
  selectedItems: ScopeTreeRow[],
  setSelectedItems: (newSelectedItems: ScopeTreeRow[]) => void
) => {
  let results: any[] = []
  const newIsAllSelected = !isAllSelected
  setIsAllSelected(newIsAllSelected)
  if (
    scopesList.filter((row) => selectedItems.find((item: { id: any }) => item.id === row.id) !== undefined).length ===
    scopesList.length
  ) {
    results = []
  } else {
    results = [...scopesList]
  }
  setSelectedItems(results)
}

export const onExpand = async (
  rowId: number,
  controllerRef: React.MutableRefObject<AbortController | null | undefined>,
  openPopulation: number[],
  setOpenPopulations: (newOpenPopulation: number[]) => void,
  rootRows: ScopeTreeRow[],
  setRootRows: (newRootRows: ScopeTreeRow[]) => void,
  selectedItems: ScopeTreeRow[],
  dispatch: AppDispatch
) => {
  controllerRef.current = new AbortController()
  let _openPopulation: number[] = openPopulation ? openPopulation : []
  const _rootRows = rootRows ? [...rootRows] : []
  const index = _openPopulation.indexOf(rowId)

  if (index !== -1) {
    _openPopulation = _openPopulation.filter((perimeter_id) => perimeter_id !== rowId)
    setOpenPopulations(_openPopulation)
  } else {
    _openPopulation = [..._openPopulation, rowId]
    setOpenPopulations(_openPopulation)
  }

  const expandResponse = await dispatch(
    expandScopeElement({
      rowId: rowId,
      selectedItems: selectedItems,
      scopesList: _rootRows,
      openPopulation: openPopulation,
      signal: controllerRef.current?.signal
    })
  ).unwrap()
  if (expandResponse && !expandResponse.aborted) {
    setRootRows(expandResponse.scopesList ?? [])
  }
}

export const onSelect = (
  row: ScopeTreeRow,
  selectedItems: ScopeTreeRow[],
  setSelectedItems: (newSelectedItems: ScopeTreeRow[]) => void,
  scopesList: ScopeTreeRow[]
): any[] => {
  const hierarchySelection: any[] = getHierarchySelection(row, selectedItems, scopesList)
  const optimizedHierarchySelection: any[] = optimizeHierarchySelection(hierarchySelection, scopesList)

  setSelectedItems(optimizedHierarchySelection)
  return optimizedHierarchySelection
}

export const isIndeterminated: (_row: ScopeTreeRow, selectedItems: ScopeTreeRow[]) => boolean | undefined = (
  _row,
  selectedItems: ScopeTreeRow[]
) => checkIfIndeterminated(_row, selectedItems)

export const isSelected = (searchedItem: TreeElement, selectedItems: TreeElement[], allItems: TreeElement[]) => {
  selectedItems = selectedItems.map((item) => findEquivalentRowInItemAndSubItems(item, allItems).equivalentRow ?? item)
  return findSelectedInListAndSubItems(selectedItems, searchedItem, allItems)
}

export const cancelPendingRequest = (controllerRef: React.MutableRefObject<AbortController | null | undefined>) => {
  if (controllerRef.current) {
    controllerRef.current.abort()
  }
  controllerRef.current = new AbortController()
}

export const searchInPerimeters = async (
  searchInput: string,
  page: number,
  controllerRef: React.MutableRefObject<AbortController | null | undefined>,
  setIsSearchLoading: (isSearchLoading: boolean) => void,
  setIsEmpty: (isEmpty: boolean) => void,
  setCount: (count: number) => void,
  setRootRows: (newRootRows: ScopeTreeRow[]) => void,
  selectedItems: ScopeTreeRow[],
  setSelectedItems: (newSelectedItems: ScopeTreeRow[]) => void,
  setOpenPopulations: (newOpenPopulation: number[]) => void,
  _isAllSelected?: boolean
) => {
  setIsSearchLoading(true)
  cancelPendingRequest(controllerRef)
  const {
    scopeTreeRows: newPerimetersList,
    count: newCount,
    aborted: aborted
  } = await servicesPerimeters.findScope(searchInput, page, controllerRef.current?.signal)

  if (!aborted) {
    if (!newPerimetersList || newPerimetersList.length < 1) {
      setIsEmpty(true)
    } else {
      setIsEmpty(false)
    }
    if (_isAllSelected) {
      const _newSelectedItems = [...selectedItems, ...newPerimetersList]
      setSelectedItems(_newSelectedItems)
    }
    setRootRows(newPerimetersList)
    setOpenPopulations([])
    setCount(newCount)
    setIsSearchLoading(false)
  }
  return newPerimetersList
}

export const getHeadCells = (isHeadChecked: boolean, isHeadIndetermined: boolean, onSelectAll: () => void) => [
  { id: '', align: 'left', disablePadding: true, disableOrderBy: true, label: '' },
  {
    id: '',
    align: 'left',
    disablePadding: true,
    disableOrderBy: true,
    label: (
      <div style={{ padding: '0 0 0 4px' }}>
        <Checkbox color="secondary" checked={isHeadChecked} indeterminate={isHeadIndetermined} onClick={onSelectAll} />
      </div>
    )
  },
  { id: 'name', align: 'left', disablePadding: false, disableOrderBy: true, label: 'Nom' },
  { id: 'quantity', align: 'center', disablePadding: false, disableOrderBy: true, label: 'Nombre de patients' },
  {
    id: 'type',
    align: 'center',
    disablePadding: false,
    disableOrderBy: true,
    label: 'Accès'
  }
]
