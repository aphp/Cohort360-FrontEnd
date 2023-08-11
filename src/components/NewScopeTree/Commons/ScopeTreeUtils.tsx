import React from 'react'
import CareSiteExplorationRow from '../ExploratedCareSite/Components/CareSiteExplorationRow'
import { ScopeTreeRow, ScopeType, TreeElement } from 'types'
import CareSiteSearchRow from '../CareSiteSearch/Components/CareSiteSearchRow'
import { expandScopeElement, fetchScopesList, updateScopeList } from 'state/scope'
import { AppDispatch } from 'state'
import {
  checkIfIndeterminated,
  findEquivalentRowInItemAndSubItems,
  getHierarchySelection,
  optimizeHierarchySelection
} from 'utils/pmsi'
import { findSelectedInListAndSubItems } from 'utils/cohortCreation'
import servicesPerimeters, { loadingItem } from 'services/aphp/servicePerimeters'
import { Checkbox } from '@mui/material'
import { cancelPendingRequest } from 'utils/abortController'

const fetchScopeTree = async (
  dispatch: AppDispatch,
  isScopeList?: boolean,
  signal?: AbortSignal,
  executiveUnitType?: ScopeType
) => {
  return dispatch(fetchScopesList({ isScopeList: isScopeList, type: executiveUnitType, signal: signal })).unwrap()
}

const getFetchedSelectedItems = (selectedItems: ScopeTreeRow[], rootRows: ScopeTreeRow[]) => {
  const fetchedSelectedItems: ScopeTreeRow[] = []
  const notFetchedSelectedItemsIds: string[] = []
  selectedItems.forEach((item: ScopeTreeRow) => {
    if (findEquivalentRowInItemAndSubItems({ id: item.id }, rootRows).equivalentRow) {
      fetchedSelectedItems.push(item)
    } else {
      notFetchedSelectedItemsIds.push(item.id)
    }
  })
  return {
    fetchedSelectedItems: fetchedSelectedItems,
    notFetchedSelectedItemsIds: notFetchedSelectedItemsIds
  }
}

const getAllParentsIds = async (selectedItems: ScopeTreeRow[], rootRows: ScopeTreeRow[]) => {
  const { fetchedSelectedItems: fetchedSelectedItems, notFetchedSelectedItemsIds: notFetchedSelectedItemsIds } =
    getFetchedSelectedItems(selectedItems, rootRows)

  const notFetchedSelectedItems: ScopeTreeRow[] =
    notFetchedSelectedItemsIds?.length > 0
      ? await servicesPerimeters.buildScopeTreeRowList(
          await servicesPerimeters.getPerimeters(notFetchedSelectedItemsIds)
        )
      : []
  const allParentsIds: string[] = [...fetchedSelectedItems, ...notFetchedSelectedItems]
    .map((item: ScopeTreeRow) => (item?.above_levels_ids ?? '').split(','))
    .flat()
    ?.filter((idValue, index, array) => {
      return idValue && array.indexOf(idValue) === index
    })
  return allParentsIds
}

const getParents = async (allParentsIds: string[], rootRows: ScopeTreeRow[]) => {
  const fetchedParents: ScopeTreeRow[] = []
  const notFetchedSubItemsIds: string[] = []
  const notFetchedParentsIds: string[] = allParentsIds.filter((parentId) => {
    const foundItem = findEquivalentRowInItemAndSubItems({ id: parentId }, rootRows).equivalentRow
    if (!foundItem) return true
    fetchedParents.push(foundItem)
    if (!foundItem.subItems || foundItem.subItems.length < 1 || foundItem.subItems[0]?.id === loadingItem.id) {
      notFetchedSubItemsIds.push(foundItem?.inferior_levels_ids?.split(','))
    }
    return false
  })
  const notFetchedItems: string[] = [...notFetchedParentsIds, ...notFetchedSubItemsIds]?.filter(
    (idValue, index, array) => {
      return idValue && array.indexOf(idValue) === index
    }
  )
  const notFetchedParents: ScopeTreeRow[] =
    notFetchedItems?.length > 0
      ? await servicesPerimeters.buildScopeTreeRowList(await servicesPerimeters.getPerimeters(notFetchedItems))
      : []
  return [...fetchedParents, ...notFetchedParents]
}

const expandSelectedItems = async (
  rootRows: ScopeTreeRow[],
  setRootRows: (newRootRows: ScopeTreeRow[]) => void,
  selectedItems: ScopeTreeRow[],
  dispatch: AppDispatch
) => {
  if (!selectedItems || selectedItems.length < 1) return

  const allParentsIds: string[] = await getAllParentsIds(selectedItems, rootRows)

  const parents: ScopeTreeRow[] = await getParents(allParentsIds, rootRows)
  parents.push(...selectedItems)

  const newRootRows: ScopeTreeRow[] = [...rootRows]

  updateRootRows(newRootRows, parents)
  dispatch(updateScopeList(newRootRows))
  setRootRows(newRootRows)
}

const updateRootRows = (newRootRows: ScopeTreeRow[], parents: ScopeTreeRow[]) => {
  for (let i = 0; i < newRootRows.length; i++) {
    const updatedSubItems: ScopeTreeRow[] = parents?.filter((item) => newRootRows[i].id === item.parentId)
    if (updatedSubItems?.length > 0) {
      const newSubItems = newRootRows[i].subItems?.filter(
        (item) => item.id !== loadingItem.id && !updatedSubItems?.map((item) => item.id).includes(item?.id)
      )
      newRootRows[i] = { ...newRootRows[i], subItems: [...newSubItems, ...updatedSubItems] }
    }
    if (newRootRows[i]?.subItems?.length > 0 && newRootRows[i]?.subItems[0]?.id !== 'loading') {
      updateRootRows(newRootRows[i].subItems, parents)
    }
  }
}

export const init = async (
  setIsSearchLoading: (isSearchLoading: boolean) => void,
  controllerRef: React.MutableRefObject<AbortController | null>,
  rootRows: ScopeTreeRow[],
  setRootRows: (newRootRows: ScopeTreeRow[]) => void,
  setOpenPopulations: (newOpenPopulation: number[]) => void,
  setCount: (newCount: number) => void,
  setIsEmpty: (isEmpty: boolean) => void,
  selectedItems: ScopeTreeRow[],
  dispatch: AppDispatch,
  executiveUnitType?: ScopeType
) => {
  setIsSearchLoading(true)
  cancelPendingRequestByRef(controllerRef)

  let newPerimetersList: ScopeTreeRow[] = []
  const fetchScopeTreeResponse = await fetchScopeTree(dispatch, true, controllerRef.current?.signal, executiveUnitType)
  if (fetchScopeTreeResponse && !fetchScopeTreeResponse.aborted) {
    newPerimetersList = fetchScopeTreeResponse.scopesList
    setRootRows(newPerimetersList)
    setOpenPopulations([])
    setCount(newPerimetersList?.length)
    setIsEmpty(!newPerimetersList || newPerimetersList.length < 0)
  }
  await expandSelectedItems(newPerimetersList ?? rootRows, setRootRows, selectedItems, dispatch)
  setIsSearchLoading(false)
}

export const displayCareSiteExplorationRow = (
  row: ScopeTreeRow,
  level: number,
  parentAccess: string,
  selectedItems: ScopeTreeRow[],
  rootRows: ScopeTreeRow[],
  openPopulation: number[],
  labelId: string,
  onExpand: (rowId: number) => Promise<void>,
  onSelect: (row: ScopeTreeRow) => ScopeTreeRow[],
  isIndeterminated: (row: ScopeTreeRow) => boolean | undefined,
  isSelected: (row: ScopeTreeRow) => boolean,
  executiveUnitType?: ScopeType
) => {
  return (
    <React.Fragment key={`ceRow-${row.id}-${executiveUnitType}`}>
      <CareSiteExplorationRow
        row={row}
        level={level}
        parentAccess={parentAccess}
        openPopulation={openPopulation}
        labelId={labelId}
        onExpand={onExpand}
        onSelect={onSelect}
        isIndeterminated={isIndeterminated}
        isSelected={isSelected}
        executiveUnitType={executiveUnitType}
      />
      {openPopulation.find((id) => Number(row.id) === id) &&
        row.subItems &&
        row.subItems.map((subItem: ScopeTreeRow) =>
          displayCareSiteExplorationRow(
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
            isSelected,
            executiveUnitType
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
  onSelect: (row: ScopeTreeRow) => ScopeTreeRow[],
  isIndeterminated: (row: ScopeTreeRow) => boolean | undefined,
  isSelected: (row: ScopeTreeRow) => boolean,
  executiveUnitType?: ScopeType
) => {
  return (
    <React.Fragment key={Math.random()}>
      <CareSiteSearchRow
        row={row}
        level={level}
        parentAccess={parentAccess}
        openPopulation={openPopulation}
        labelId={labelId}
        onExpand={onExpand}
        onSelect={onSelect}
        isIndeterminated={isIndeterminated}
        isSelected={isSelected}
        executiveUnitType={executiveUnitType}
      />
      {openPopulation.find((id) => +row.id === id) &&
        row.subItems &&
        row.subItems.map((subItem: ScopeTreeRow) =>
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
            isSelected,
            executiveUnitType
          )
        )}
    </React.Fragment>
  )
}

export const onSelectAll = (
  isAllSelected: boolean,
  setIsAllSelected: (newIsAllSelected: boolean) => void,
  rootRows: ScopeTreeRow[],
  selectedItems: ScopeTreeRow[],
  setSelectedItems: (newSelectedItems: ScopeTreeRow[]) => void
) => {
  let results: ScopeTreeRow[] = []
  const newIsAllSelected = !isAllSelected
  setIsAllSelected(newIsAllSelected)
  if (
    rootRows.filter((row) => selectedItems.find((item: { id: string }) => item.id === row.id) !== undefined).length ===
    rootRows.length
  ) {
    results = []
  } else {
    results = [...rootRows]
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
  dispatch: AppDispatch,
  executiveUnitType?: ScopeType
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
      type: executiveUnitType,
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
): ScopeTreeRow[] => {
  const hierarchySelection: ScopeTreeRow[] = getHierarchySelection(row, selectedItems, scopesList)
  const optimizedHierarchySelection: ScopeTreeRow[] = optimizeHierarchySelection(hierarchySelection, scopesList)

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

export const cancelPendingRequestByRef = (controllerRef: React.MutableRefObject<AbortController | null>) => {
  controllerRef.current = cancelPendingRequest(controllerRef.current)
}

export const searchInPerimeters = async (
  searchInput: string,
  page: number,
  controllerRef: React.MutableRefObject<AbortController | null>,
  setIsSearchLoading: (isSearchLoading: boolean) => void,
  setIsEmpty: (isEmpty: boolean) => void,
  setCount: (count: number) => void,
  setRootRows: (newRootRows: ScopeTreeRow[]) => void,
  selectedItems: ScopeTreeRow[],
  setSelectedItems: (newSelectedItems: ScopeTreeRow[]) => void,
  setOpenPopulations: (newOpenPopulation: number[]) => void,
  isAllSelected?: boolean,
  executiveUnitType?: ScopeType
) => {
  setIsSearchLoading(true)
  cancelPendingRequestByRef(controllerRef)
  const {
    scopeTreeRows: newPerimetersList,
    count: newCount,
    aborted: aborted
  } = await servicesPerimeters.findScope(searchInput, page, controllerRef.current?.signal, executiveUnitType)

  if (!aborted) {
    if (!newPerimetersList || newPerimetersList.length < 1) {
      setIsEmpty(true)
    } else {
      setIsEmpty(false)
    }
    if (isAllSelected) {
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

export const getHeadCells = (
  isHeadChecked: boolean,
  isHeadIndetermined: boolean,
  onSelectAll: () => void,
  executiveUnitType?: ScopeType
) => [
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
  executiveUnitType
    ? {
        id: 'deidentified',
        align: 'center',
        disablePadding: false,
        disableOrderBy: true,
        label: 'Type'
      }
    : {
        id: 'type',
        align: 'center',
        disablePadding: false,
        disableOrderBy: true,
        label: 'Accès'
      }
]
