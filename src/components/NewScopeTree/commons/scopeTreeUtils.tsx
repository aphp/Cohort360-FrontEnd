import React from 'react'
import CareSiteExplorationRow from '../CareSiteExploration/components/CareSiteExplorationRow'
import { ScopeTreeRow, ScopeType, TreeElement } from 'types'
import CareSiteSearchRow from '../CareSiteSearch/components/CareSiteSearchRow'
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
          await servicesPerimeters.getPerimeters(notFetchedSelectedItemsIds, undefined, undefined, true)
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
      ? await servicesPerimeters.buildScopeTreeRowList(
          await servicesPerimeters.getPerimeters(notFetchedItems, undefined, undefined, true)
        )
      : []
  return [...fetchedParents, ...notFetchedParents]
}

const expandSelectedItems = async (
  rootRows: ScopeTreeRow[],
  selectedItems: ScopeTreeRow[],
  dispatch: AppDispatch,
  setRootRows?: (newRootRows: ScopeTreeRow[]) => void
) => {
  if (!selectedItems || selectedItems.length < 1) return

  const allParentsIds: string[] = await getAllParentsIds(selectedItems, rootRows)

  const parents: ScopeTreeRow[] = await getParents(allParentsIds, rootRows)

  const newRootRows: ScopeTreeRow[] = [...rootRows]

  await updateRootRows(newRootRows, [...parents, ...selectedItems], parents)
  dispatch(updateScopeList(newRootRows))
  if (setRootRows) setRootRows(newRootRows)
  return newRootRows
}

const updateRootRows = async (
  newRootRows: ScopeTreeRow[],
  parentsAndSelectedItems: ScopeTreeRow[],
  onlyParents: ScopeTreeRow[]
) => {
  for (let i = 0; i < newRootRows.length; i++) {
    const isParent: boolean = onlyParents.map((parent) => parent.id).includes(newRootRows[i].id)
    if (!isParent) continue
    const updatedSubItems: ScopeTreeRow[] = parentsAndSelectedItems?.filter(
      (item) => newRootRows[i].id === item.parentId && newRootRows[i].id !== loadingItem.id
    )
    let existingSubItems: ScopeTreeRow[] = []
    if (updatedSubItems?.length > 0) {
      existingSubItems = newRootRows[i].subItems?.filter(
        (subItem) =>
          subItem.id !== loadingItem.id &&
          !updatedSubItems?.map((updatedSubItem) => updatedSubItem.id).includes(subItem?.id)
      )
    }
    let subItems: ScopeTreeRow[] = removeDuplicates([...existingSubItems, ...updatedSubItems])
    if (subItems?.length < (newRootRows[i]?.inferior_levels_ids?.split(',')?.length ?? 0)) {
      const loadedItems: ScopeTreeRow[] = await servicesPerimeters.buildScopeTreeRowList(
        await servicesPerimeters.getPerimeters([newRootRows[i].id], undefined, undefined, true),
        true
      )
      subItems = loadedItems[0].subItems
    }

    newRootRows[i] = { ...newRootRows[i], subItems: [...subItems] }
    if (newRootRows[i]?.subItems?.length > 0 && newRootRows[i]?.subItems[0]?.id !== loadingItem.id) {
      await updateRootRows(newRootRows[i].subItems, parentsAndSelectedItems, onlyParents)
    }
  }
}

export const removeDuplicates = (arr: ScopeTreeRow[]) => {
  const uniqueIds = new Set()
  const uniqueItems: ScopeTreeRow[] = []

  arr.forEach((item) => {
    if (!uniqueIds.has(item.id)) {
      uniqueIds.add(item.id)
      uniqueItems.push(item)
    }
  })
  return uniqueItems
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

  let newPerimetersList: ScopeTreeRow[] = rootRows
  if (rootRows?.length <= 0) {
    const fetchScopeTreeResponse = await fetchScopeTree(
      dispatch,
      true,
      controllerRef.current?.signal,
      executiveUnitType
    )
    if (fetchScopeTreeResponse && !fetchScopeTreeResponse.aborted) {
      newPerimetersList = fetchScopeTreeResponse.scopesList
      setRootRows(newPerimetersList)
      setOpenPopulations([])
      setCount(newPerimetersList?.length)
      setIsEmpty(!newPerimetersList || newPerimetersList.length < 0)
    }
  }
  await expandSelectedItems(newPerimetersList, selectedItems, dispatch, setRootRows)
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
    <React.Fragment key={Math.random()}>
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
  rootRows: ScopeTreeRow[],
  selectedItems: ScopeTreeRow[],
  setSelectedItems: (newSelectedItems: ScopeTreeRow[]) => void
) => {
  let newSelectedItems: ScopeTreeRow[] = []
  const diffList1: ScopeTreeRow[] = selectedItems.filter(
    (selected) => !findEquivalentRowInItemAndSubItems(selected, rootRows).equivalentRow
  )
  const diffList2: ScopeTreeRow[] = rootRows.filter(
    (root) => !findEquivalentRowInItemAndSubItems(root, selectedItems).equivalentRow
  )
  const diffList: ScopeTreeRow[] = [...diffList1, ...diffList2]
  if (
    rootRows.filter((row) => selectedItems.find((item: { id: string }) => item.id === row.id) !== undefined).length ===
      rootRows.length &&
    rootRows.length > 0
  ) {
    newSelectedItems = selectedItems.filter((selected) => diffList.find((diff) => diff.id === selected.id))
  } else {
    newSelectedItems = [...selectedItems, ...diffList]
  }
  setSelectedItems(newSelectedItems)
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
  searchedItem = findEquivalentRowInItemAndSubItems(searchedItem, allItems).equivalentRow ?? searchedItem
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
  scopesList: ScopeTreeRow[],
  setRootRows: (newRootRows: ScopeTreeRow[]) => void,
  setOpenPopulations: (newOpenPopulation: number[]) => void,
  dispatch: AppDispatch,
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
    setRootRows(newPerimetersList)
    setOpenPopulations([])
    setCount(newCount)
    setIsSearchLoading(false)
  }
  const newRootRows: ScopeTreeRow[] =
    (await expandSelectedItems(scopesList, newPerimetersList, dispatch, undefined)) ?? scopesList
  const perimetersListWithUpdatedParents: ScopeTreeRow[] = newPerimetersList.map(
    (item: ScopeTreeRow) => findEquivalentRowInItemAndSubItems(item, newRootRows).equivalentRow ?? item
  )
  return perimetersListWithUpdatedParents
}

export const getHeadCells = (
  isHeadChecked: boolean,
  isHeadIndeterminate: boolean,
  onSelectAll?: () => void,
  executiveUnitType?: ScopeType
) => [
  { id: '', align: 'left', disablePadding: true, disableOrderBy: true, label: '' },
  !!onSelectAll && {
    id: '',
    align: 'left',
    disablePadding: true,
    disableOrderBy: true,
    label: (
      <div style={{ padding: '0 0 0 4px' }}>
        <Checkbox color="secondary" checked={isHeadChecked} indeterminate={isHeadIndeterminate} onClick={onSelectAll} />
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
