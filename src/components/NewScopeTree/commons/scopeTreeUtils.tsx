import React from 'react'
import CareSiteExplorationRow from '../CareSiteExploration/components/CareSiteExplorationRow'
import { ExpandScopeElementParamsType, ScopeTreeRow, ScopeType, TreeElement } from 'types'
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
import servicesPerimeters, { LOADING } from 'services/aphp/servicePerimeters'
import { Checkbox } from '@mui/material'
import { cancelPendingRequest } from 'utils/abortController'
import { expandScopeTree } from '../../../utils/scopeTree'

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

const getAllParentsIds = async (selectedItems: ScopeTreeRow[]) => {
  // const { fetchedSelectedItems: fetchedSelectedItems, notFetchedSelectedItemsIds: notFetchedSelectedItemsIds } =
  //   getFetchedSelectedItems(selectedItems, rootRows)
  //
  // const notFetchedSelectedItems: ScopeTreeRow[] =
  //   notFetchedSelectedItemsIds?.length > 0
  //     ? await servicesPerimeters.buildScopeTreeRowList(
  //         await servicesPerimeters.getPerimeters(notFetchedSelectedItemsIds)
  //       )
  //     : []
  const allParentsIds: string[] = selectedItems
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
    if (!foundItem.subItems || foundItem.subItems.length < 1 || foundItem.subItems[0]?.id === LOADING.id) {
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
  selectedItems: ScopeTreeRow[],
  dispatch?: AppDispatch,
  setRootRows?: (newRootRows: ScopeTreeRow[]) => void
) => {
  if (!selectedItems || selectedItems.length < 1) return

  const allParentsIds: string[] = await getAllParentsIds(selectedItems)

  const parents: ScopeTreeRow[] = await getParents(allParentsIds, rootRows)

  const newRootRows: ScopeTreeRow[] = [...rootRows]

  await updateRootRows(newRootRows, [...parents, ...selectedItems], parents)
  if (dispatch) {
    dispatch(updateScopeList(newRootRows))
  }
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

    for (let j = 0; j < parentsAndSelectedItems.length; j++) {
      if (parentsAndSelectedItems[j].parentId === newRootRows[i].id) {
        if (
          !newRootRows[i].subItems ||
          (newRootRows[i].subItems.length === 1 && newRootRows[i].subItems[0].id === LOADING.id)
        ) {
          newRootRows[i] = { ...newRootRows[i], subItems: [] }
        }
        if (!newRootRows[i].subItems.map((subItem) => subItem.id).includes(parentsAndSelectedItems[j].id)) {
          newRootRows[i].subItems.push(parentsAndSelectedItems[j])
        }
      }
    }
    if (newRootRows[i]?.subItems?.length > 0 && newRootRows[i]?.subItems[0]?.id !== LOADING.id) {
      await updateRootRows(newRootRows[i].subItems, parentsAndSelectedItems, onlyParents)
    }
  }
}

// export const removeDuplicates = (arr: ScopeTreeRow[]) => {
//   const uniqueIds = new Set()
//   const uniqueItems: ScopeTreeRow[] = []
//
//   arr.forEach((item) => {
//     if (!uniqueIds.has(item.id)) {
//       uniqueIds.add(item.id)
//       uniqueItems.push(item)
//     }
//   })
//   return uniqueItems
// }

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
  // await expandSelectedItems(newPerimetersList, selectedItems, dispatch, setRootRows)
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

  let expandResponse
  const params: ExpandScopeElementParamsType = {
    rowId: rowId,
    selectedItems: selectedItems,
    scopesList: _rootRows,
    openPopulation: openPopulation,
    type: executiveUnitType,
    signal: controllerRef.current?.signal
  }
  if (dispatch) {
    expandResponse = await dispatch(expandScopeElement(params)).unwrap()
  } else {
    await expandScopeTree(params)
  }
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

// export const buildFictiveRootRows = (rootRows: ScopeTreeRow[]) => {
//   for (let i = 0; i < rootRows.length; i++) {
//     const rootRowIds: string[] = (rootRows[i]?.inferior_levels_ids ?? '').split(',')
//     if (
//       rootRowIds.length === rootRows[i]?.subItems.length &&
//       !rootRows[i].subItems.map((rootItem) => rootItem.id).includes(LOADING.id)
//     ) {
//       continue
//     }
//     if (!rootRows[i].subItems || (rootRows[i].subItems.length === 1 && rootRows[i].subItems[0].id === LOADING.id)) {
//       rootRows[i] = { ...rootRows[i], subItems: [] }
//     }
//     rootRowIds.forEach((id) => {
//       const newSubItem: ScopeTreeRow = LOADING
//       newSubItem.id = id
//       newSubItem.subItems = [{ ...LOADING }]
//       if (!rootRows[i].subItems.map((rootItem) => rootItem.id).includes(newSubItem.id)) {
//         rootRows[i].subItems.push(newSubItem)
//       }
//     })
//   }
// }

export const isIncludedInListAndSubItems = (
  searchedItem: ScopeTreeRow,
  selectedItems: ScopeTreeRow[],
  hierarchy: any[]
): boolean => {
  if (!searchedItem || !selectedItems || selectedItems.length === 0) return false
  selectedItems = selectedItems?.filter(({ id }) => id !== 'loading')
  const foundItem = selectedItems.find((selectedItem) => {
    if (selectedItem.id === searchedItem.id || selectedItem.id == '*') {
      return true
    }
    return selectedItem.subItems ? isIncludedInListAndSubItems(searchedItem, selectedItem.subItems, hierarchy) : false
  })
  if (foundItem) {
    return true
  }
  const inferiorLevelsIds: string[] = searchedItem.inferior_levels_ids?.split(',') ?? []
  if (inferiorLevelsIds.length > 0) {
    const numberOfSubItemsSelected = inferiorLevelsIds.filter((id) =>
      selectedItems.map((selectedItem) => selectedItem.id).includes(id)
    )?.length
    if (inferiorLevelsIds.length === numberOfSubItemsSelected) {
      return true
    }
    const isSingleItemNotSelected = (inferiorLevelsIds.length ?? 0 - (numberOfSubItemsSelected ?? 0)) === 1
    if (isSingleItemNotSelected) {
      const singleItemNotSelected = inferiorLevelsIds.find(
        (id) => !selectedItems.map((selectedItem) => selectedItem.id).includes(id)
      )
      if (singleItemNotSelected) {
        const item: ScopeTreeRow = { ...LOADING }
        item.id = singleItemNotSelected
        return isIncludedInListAndSubItems(item, selectedItems, hierarchy)
      }
      return false
    }
  }
  return false
}

export const onSearchSelect = (
  row: ScopeTreeRow,
  selectedItems: ScopeTreeRow[],
  setSelectedItems: (newSelectedItems: ScopeTreeRow[]) => void,
  rootRows: ScopeTreeRow[]
): ScopeTreeRow[] => {
  const rowsToDelete: ScopeTreeRow[] = []
  if (isIncludedInListAndSubItems(row, selectedItems, rootRows)) {
    for (let i = 0; i < selectedItems.length; i++) {
      if (selectedItems[i].id === row.id) {
        rowsToDelete.push(selectedItems[i])
        break
      }
    }
    // findEquivalentRowInItemAndSubItems(row, selectedItems)
    // const rootRowIds: string[] = (row?.inferior_levels_ids ?? '').split(',')
    // if (
    //   rootRowIds.length === row?.subItems.length &&
    //   !row.subItems.map((rootItem) => rootItem.id).includes(LOADING.id)
    // ) {
    //   continue
    // }
  }
  setSelectedItems(selectedItems)
  return selectedItems
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
  setRootRows: (newRootRows: ScopeTreeRow[]) => void,
  searchedRows: ScopeTreeRow[],
  setSearchedRows: (newRootRows: ScopeTreeRow[]) => void,
  setOpenPopulations: (newOpenPopulation: number[]) => void,
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
    (await expandSelectedItems(searchedRows, newPerimetersList, undefined, undefined)) ?? searchedRows
  // const perimetersListWithUpdatedParents: ScopeTreeRow[] = newPerimetersList.map(
  //   (item: ScopeTreeRow) => findEquivalentRowInItemAndSubItems(item, newRootRows).equivalentRow ?? item
  // )
  setSearchedRows(newRootRows)
  return newRootRows
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
