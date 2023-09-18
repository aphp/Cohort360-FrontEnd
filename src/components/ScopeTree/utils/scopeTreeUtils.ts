import React, { ReactElement } from 'react'
import { ExpandScopeElementParamsType, ScopeTreeRow, ScopeTreeTableHeadCellsType, ScopeType, TreeElement } from 'types'
import { expandScopeElement, fetchScopesList, updateScopeList } from 'state/scope'
import { AppDispatch } from 'state'
import { findEquivalentRowInItemAndSubItems, getHierarchySelection, optimizeHierarchySelection } from 'utils/pmsi'
import { findSelectedInListAndSubItems } from 'utils/cohortCreation'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import { cancelPendingRequest } from 'utils/abortController'
import { expandScopeTree, LOADING } from 'utils/scopeTree'

export const getAllParentsIds = async (selectedItems: ScopeTreeRow[]) => {
  const allParentsIds: string[] = selectedItems
    .map((item: ScopeTreeRow) => (item?.above_levels_ids ?? '').split(','))
    .flat()
    ?.filter((idValue, index, array) => {
      return idValue && array.indexOf(idValue) === index
    })
  return allParentsIds
}

export const getParents = async (allParentsIds: string[], rootRows: ScopeTreeRow[]) => {
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
      ? await servicesPerimeters.buildScopeTreeRowList(
          await servicesPerimeters.getPerimeters(notFetchedItems, undefined, undefined)
        )
      : []
  return [...fetchedParents, ...notFetchedParents]
}

export const expandSelectedItems = async (
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

export const updateRootRows = async (
  newRootRows: ScopeTreeRow[],
  parentsAndSelectedItems: ScopeTreeRow[],
  parents: ScopeTreeRow[],
  isOnlyParentsUpdate?: boolean
) => {
  for (let i = 0; i < newRootRows.length; i++) {
    if (isOnlyParentsUpdate) {
      const isParent: boolean = parents.map((parent) => parent.id).includes(newRootRows[i].id)
      if (!isParent) continue
    }

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
      await updateRootRows(newRootRows[i].subItems, parentsAndSelectedItems, parents)
    }
  }
  return newRootRows
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
  dispatch: AppDispatch,
  executiveUnitType?: ScopeType
) => {
  setIsSearchLoading(true)
  cancelPendingRequest(controllerRef.current)

  let newPerimetersList: ScopeTreeRow[] = rootRows
  if (rootRows?.length <= 0) {
    const fetchScopeTreeResponse = await dispatch(
      fetchScopesList({ isScopeList: true, type: executiveUnitType, signal: controllerRef.current?.signal })
    ).unwrap()
    if (fetchScopeTreeResponse && !fetchScopeTreeResponse.aborted) {
      newPerimetersList = fetchScopeTreeResponse.scopesList
      setRootRows(newPerimetersList)
      setOpenPopulations([])
      setCount(newPerimetersList?.length)
      setIsEmpty(!newPerimetersList || newPerimetersList.length < 0)
    }
  }
  setIsSearchLoading(false)
}

export const onExpand = async (
  rowId: number,
  controllerRef: React.MutableRefObject<AbortController | null | undefined>,
  openPopulation: number[],
  setOpenPopulations: (newOpenPopulation: number[]) => void,
  rootRows: ScopeTreeRow[],
  setRootRows: (newRootRows: ScopeTreeRow[]) => void,
  selectedItems: ScopeTreeRow[],
  dispatch?: AppDispatch,
  executiveUnitType?: ScopeType
) => {
  controllerRef.current = new AbortController()
  const _rootRows = rootRows ? [...rootRows] : []

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
    expandResponse = await expandScopeTree(params)
  }
  if (expandResponse && !expandResponse.aborted) {
    setRootRows(expandResponse.scopesList ?? [])
    setOpenPopulations(expandResponse.openPopulation)
  }
}

export const onSelect = (
  row: ScopeTreeRow,
  selectedItems: ScopeTreeRow[],
  setSelectedItems: (newSelectedItems: ScopeTreeRow[]) => void,
  scopesList: ScopeTreeRow[],
  isSelectionLoading: boolean,
  setIsSelectionLoading: (isSelectionLoading: boolean) => void
): ScopeTreeRow[] => {
  if (isSelectionLoading) return selectedItems
  else setIsSelectionLoading(true)
  const hierarchySelection: ScopeTreeRow[] = getHierarchySelection(row, selectedItems, scopesList)
  const optimizedHierarchySelection: ScopeTreeRow[] = optimizeHierarchySelection(hierarchySelection, scopesList)

  setSelectedItems(optimizedHierarchySelection)
  setIsSelectionLoading(false)
  return optimizedHierarchySelection
}

export const isIncludedInListAndSubItems = (searchedItem: ScopeTreeRow, selectedItems: ScopeTreeRow[]): boolean => {
  if (!searchedItem || !selectedItems || selectedItems.length === 0) return false
  selectedItems = selectedItems?.filter(({ id }) => id !== 'loading')
  const aboveLevelsIds: string[] = searchedItem.above_levels_ids?.split(',') ?? []
  const foundItem = selectedItems.find((selectedItem) => {
    if (selectedItem.id === searchedItem.id || selectedItem.id == '*') {
      return true
    }
    return aboveLevelsIds.includes(selectedItem.id)
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
        return isIncludedInListAndSubItems(item, selectedItems)
      }
      return false
    }
  }
  return false
}

const getScopeTree = async (
  id: string | null | undefined,
  searchRootRows: ScopeTreeRow[],
  explorationRootRows: ScopeTreeRow[],
  isNoLoading?: boolean
): Promise<ScopeTreeRow | undefined> => {
  if (!id) return undefined
  let equivalentRow = findEquivalentRowInItemAndSubItems({ id: id }, searchRootRows).equivalentRow
  if (!equivalentRow) {
    equivalentRow = findEquivalentRowInItemAndSubItems({ id: id }, explorationRootRows).equivalentRow
    if (!equivalentRow && !isNoLoading) {
      equivalentRow = await servicesPerimeters.buildScopeTreeRowList(
        await servicesPerimeters.getPerimeters([id], undefined, undefined)
      )
      await updateRootRows(searchRootRows, [equivalentRow], [])
    }
  }
  return equivalentRow
}
const getScopeTreeList = async (
  ids: string[],
  searchRootRows: ScopeTreeRow[],
  explorationRootRows: ScopeTreeRow[]
): Promise<ScopeTreeRow[]> => {
  const scopeTreeList: ScopeTreeRow[] = []
  const postLoadedIds: string[] = []

  for (const id of ids) {
    const equivalentRow: ScopeTreeRow | undefined = await getScopeTree(id, searchRootRows, explorationRootRows, true)
    if (equivalentRow) {
      scopeTreeList.push({ ...equivalentRow })
    } else {
      postLoadedIds.push(id)
    }
  }
  if (postLoadedIds?.length > 0) {
    const postLoadedRows: ScopeTreeRow[] = await servicesPerimeters.buildScopeTreeRowList(
      await servicesPerimeters.getPerimeters(postLoadedIds, undefined, undefined)
    )
    await updateRootRows(searchRootRows, postLoadedRows, [])
    scopeTreeList.push(...postLoadedRows)
  }
  return scopeTreeList
}

const addToSelectedItems = async (
  rowToAdd: ScopeTreeRow,
  selectedItems: ScopeTreeRow[],
  rowsToAdd: ScopeTreeRow[],
  rowsToDelete: string[],
  searchRootRows: ScopeTreeRow[],
  explorationRootRows: ScopeTreeRow[]
) => {
  const parent: ScopeTreeRow | undefined = await getScopeTree(rowToAdd.parentId, searchRootRows, explorationRootRows)
  const inferiorLevelsIds: string[] = parent?.inferior_levels_ids?.split(',') ?? []
  const parentSubItems: ScopeTreeRow[] = await getScopeTreeList(inferiorLevelsIds, searchRootRows, explorationRootRows)
  const updatedSelectedItems: ScopeTreeRow[] = [
    ...selectedItems,
    ...rowsToAdd.filter((rowToAdd) => rowsToDelete.includes(rowToAdd.id))
  ]
  const isAllInferiorLevelsSelected = parentSubItems.every((subItem) => {
    return isIncludedInListAndSubItems(
      subItem,
      updatedSelectedItems.filter((item) => !rowsToDelete.includes(item.id))
    )
  })
  if (parent && isAllInferiorLevelsSelected) {
    rowsToDelete.push(...inferiorLevelsIds)
    rowsToAdd.push({ ...parent })
    await addToSelectedItems(parent, selectedItems, rowsToAdd, rowsToDelete, searchRootRows, explorationRootRows)
  }
}

const selectOrUnSelectParent = async (
  aboveLevelsIds: string[],
  selectedItem: ScopeTreeRow | undefined,
  rowsToDelete: string[],
  row: ScopeTreeRow,
  rowsToAdd: ScopeTreeRow[],
  selectedItems: ScopeTreeRow[],
  searchRootRows: ScopeTreeRow[],
  explorationRootRows: ScopeTreeRow[]
): Promise<boolean> => {
  if (!selectedItem) return false
  if (
    aboveLevelsIds.includes(selectedItem.id) &&
    !rowsToDelete.includes(selectedItem.id) &&
    isIncludedInListAndSubItems(selectedItem, selectedItems)
  ) {
    rowsToDelete.push(selectedItem.id)
    const inferiorLevelsIds: string[] = selectedItem.inferior_levels_ids?.split(',') ?? []
    if (selectedItem.id === row.parentId) {
      if (inferiorLevelsIds.length > 1) {
        rowsToAdd.push(...(await getScopeTreeList(inferiorLevelsIds, searchRootRows, explorationRootRows)))
      } else {
        await selectOrUnSelectParent(
          selectedItem.above_levels_ids?.split(',') ?? [],
          await getScopeTree(selectedItem.parentId, searchRootRows, explorationRootRows),
          rowsToDelete,
          selectedItem,
          rowsToAdd,
          selectedItems,
          searchRootRows,
          explorationRootRows
        )
      }
    } else {
      const subItems: ScopeTreeRow[] = await getScopeTreeList(inferiorLevelsIds, searchRootRows, explorationRootRows)
      for (const subItem of subItems) {
        if (
          !(await selectOrUnSelectParent(
            aboveLevelsIds,
            subItem,
            rowsToDelete,
            row,
            rowsToAdd,
            selectedItems,
            searchRootRows,
            explorationRootRows
          ))
        ) {
          rowsToAdd.push(subItem)
        }
      }
    }
    return true
  }
  return false
}

export const onSearchSelect = async (
  row: ScopeTreeRow,
  selectedItems: ScopeTreeRow[],
  searchRootRows: ScopeTreeRow[],
  explorationRootRows: ScopeTreeRow[],
  isSelectionLoading: boolean,
  setIsSelectionLoading: (isSelectionLoading: boolean) => void,
  setSelectedItems?: (newSelectedItems: ScopeTreeRow[]) => void,
  setSearchedRows?: (newSelectedItems: ScopeTreeRow[]) => void
): Promise<ScopeTreeRow[]> => {
  if (isSelectionLoading) return selectedItems
  else setIsSelectionLoading(true)
  const rowsToDelete: string[] = []
  const rowsToAdd: ScopeTreeRow[] = []
  const equivalentSelectedItems: ScopeTreeRow[] = selectedItems.map(
    (item) => findEquivalentRowInItemAndSubItems(item, searchRootRows).equivalentRow ?? item
  )
  if (isIncludedInListAndSubItems(row, equivalentSelectedItems)) {
    rowsToDelete.push(row.id)
    const aboveLevelsIds: string[] = row.above_levels_ids?.split(',') ?? []
    for (let i = 0; i < equivalentSelectedItems.length; i++) {
      if (equivalentSelectedItems[i].id === row.id) {
        rowsToDelete.push(equivalentSelectedItems[i].id)
        break
      } else {
        if (
          await selectOrUnSelectParent(
            aboveLevelsIds,
            equivalentSelectedItems[i],
            rowsToDelete,
            row,
            rowsToAdd,
            equivalentSelectedItems,
            searchRootRows,
            explorationRootRows
          )
        ) {
          break
        }
      }
    }
  } else {
    rowsToAdd.push(row)
  }
  let uniqueRowsToDelete: string[] = [...new Set(rowsToDelete)]
  let newSelectedItems: ScopeTreeRow[] = equivalentSelectedItems.filter((row) => !uniqueRowsToDelete.includes(row.id))
  let uniqueRowsToAdd: ScopeTreeRow[] = removeDuplicates(rowsToAdd).filter(
    (row) => !uniqueRowsToDelete.includes(row.id)
  )

  for (const rowToAdd of uniqueRowsToAdd) {
    newSelectedItems = [...newSelectedItems, rowToAdd]
    newSelectedItems = squashItems(newSelectedItems)
    await addToSelectedItems(
      rowToAdd,
      newSelectedItems,
      uniqueRowsToAdd,
      uniqueRowsToDelete,
      searchRootRows,
      explorationRootRows
    )
  }
  uniqueRowsToDelete = [...new Set(uniqueRowsToDelete)]
  uniqueRowsToAdd = removeDuplicates(uniqueRowsToAdd)
  newSelectedItems = [...newSelectedItems, ...uniqueRowsToAdd].filter((row) => !uniqueRowsToDelete.includes(row.id))
  newSelectedItems = squashItems(newSelectedItems)

  if (setSelectedItems) setSelectedItems(newSelectedItems)
  if (setSearchedRows) setSearchedRows(searchRootRows)
  setIsSelectionLoading(false)
  return newSelectedItems
}

export const onExplorationSelectAll = async (
  rootRows: ScopeTreeRow[],
  setSelectedItems: (newSelectedItems: ScopeTreeRow[]) => void,
  isHeaderSelected: boolean,
  isSelectionLoading: boolean,
  setIsSelectionLoading: (isSelectionLoading: boolean) => void
) => {
  if (isSelectionLoading) return
  else setIsSelectionLoading(true)
  if (isHeaderSelected) {
    setSelectedItems([])
  } else {
    setSelectedItems(rootRows)
  }
  setIsSelectionLoading(false)
}
const squashItems = (rootRows: ScopeTreeRow[]) => {
  let uniqueRows: ScopeTreeRow[] = []
  const rootRowsIds: string[] = rootRows.map((row) => row.id)
  rootRows.forEach((rootRow) => {
    if (!rootRowsIds.find((rootRowId) => rootRow.above_levels_ids?.split(',').includes(rootRowId))) {
      uniqueRows.push(rootRow)
    }
  })
  uniqueRows = removeDuplicates(uniqueRows)
  return uniqueRows
}
export const onSearchSelectAll = async (
  rootRows: ScopeTreeRow[],
  selectedItems: ScopeTreeRow[],
  setSelectedItems: (newSelectedItems: ScopeTreeRow[]) => void,
  isHeaderSelected: boolean,
  searchRootRows: ScopeTreeRow[],
  explorationRootRows: ScopeTreeRow[],
  isSelectionLoading: boolean,
  setIsSelectionLoading: (isSelectionLoading: boolean) => void
) => {
  const uniqueRootRows: ScopeTreeRow[] = squashItems(rootRows)
  let newSelectedItems: ScopeTreeRow[] = [...selectedItems]
  for (const rootRow of uniqueRootRows) {
    if (!isHeaderSelected && isIncludedInListAndSubItems(rootRow, newSelectedItems)) {
      newSelectedItems = await onSearchSelect(
        rootRow,
        newSelectedItems,
        searchRootRows,
        explorationRootRows,
        isSelectionLoading,
        setIsSelectionLoading,
        undefined
      )
    }
  }
  for (const rootRow of uniqueRootRows) {
    newSelectedItems = await onSearchSelect(
      rootRow,
      newSelectedItems,
      searchRootRows,
      explorationRootRows,
      isSelectionLoading,
      setIsSelectionLoading,
      undefined
    )
  }

  setSelectedItems(newSelectedItems)
}

export const isSearchIndeterminate = (row: ScopeTreeRow, selectedItems: ScopeTreeRow[]): boolean => {
  const selectedSubItem = selectedItems.find((selectedItem) =>
    (selectedItem.above_levels_ids?.split(',') ?? []).includes(row.id)
  )
  if (selectedSubItem) {
    return true
  } else {
    const inferiorLevelsIds: string[] = row.inferior_levels_ids?.split(',') ?? []
    return !!selectedItems.find((item) => inferiorLevelsIds.includes(item.id))
  }
}

export const isSearchSelected = (row: ScopeTreeRow, selectedItems: ScopeTreeRow[]): boolean => {
  const selectedItem: ScopeTreeRow | undefined = selectedItems.find((selected) => selected.id === row.id)
  if (selectedItem) {
    return true
  } else {
    const aboveLevelsIds: string[] = row.above_levels_ids?.split(',') ?? []
    return !!selectedItems.find((selected) => aboveLevelsIds.includes(selected.id))
  }
}

export const isSelected = (searchedItem: TreeElement, selectedItems: TreeElement[], allItems: TreeElement[]) => {
  selectedItems = selectedItems.map((item) => findEquivalentRowInItemAndSubItems(item, allItems).equivalentRow ?? item)
  searchedItem = findEquivalentRowInItemAndSubItems(searchedItem, allItems).equivalentRow ?? searchedItem
  return findSelectedInListAndSubItems(selectedItems, searchedItem, allItems)
}

export const searchInPerimeters = async (
  searchInput: string,
  page: number,
  controllerRef: React.MutableRefObject<AbortController | null>,
  setIsSearchLoading: (isSearchLoading: boolean) => void,
  setIsEmpty: (isEmpty: boolean) => void,
  setCount: (count: number) => void,
  setRootRows: (newRootRows: ScopeTreeRow[]) => void,
  searchRootRows: ScopeTreeRow[],
  setSearchRootRows: (newRootRows: ScopeTreeRow[]) => void,
  setOpenPopulations: (newOpenPopulation: number[]) => void,
  executiveUnitType?: ScopeType
) => {
  setIsSearchLoading(true)
  let newRootRows: ScopeTreeRow[] = []
  try {
    cancelPendingRequest(controllerRef.current)
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
    newRootRows = (await expandSelectedItems(searchRootRows, newPerimetersList, undefined, undefined)) ?? searchRootRows
  } catch (error) {
    console.error('An error has been occured while searching data')
    setIsSearchLoading(false)
  }
  setSearchRootRows(newRootRows)
  return newRootRows
}

export const getHeadCells = (
  headCheckbox?: ReactElement,
  executiveUnitType?: ScopeType
): ScopeTreeTableHeadCellsType[] => {
  const headCells = [
    { id: '', align: 'left', disablePadding: true, disableOrderBy: true, label: '' },
    !!headCheckbox
      ? {
          id: '',
          align: 'left',
          disablePadding: true,
          disableOrderBy: true,
          label: headCheckbox
        }
      : undefined,
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
  return headCells.filter((cell) => cell !== undefined) as ScopeTreeTableHeadCellsType[]
}
