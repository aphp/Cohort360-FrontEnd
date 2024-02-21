import React, { ReactElement } from 'react'
import { ExpandScopeElementParamsType, ScopeTreeRow, ScopeTreeTableHeadCellsType, ScopeType, TreeElement } from 'types'
import { expandScopeElement, fetchScopesList, updateScopeList } from 'state/scope'
import { AppDispatch } from 'state'
import { findEquivalentRowInItemAndSubItems, getHierarchySelection, optimizeHierarchySelection } from 'utils/pmsi'
import { findSelectedInListAndSubItems } from 'utils/cohortCreation'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import { cancelPendingRequest } from 'utils/abortController'
import { buildScopeListType, expandScopeTree, getCurrentScopeList, LOADING } from 'utils/scopeTree'
import { isCustomError } from 'utils/perimeters'

export const getAllParentsIds = async (selectedItems: ScopeTreeRow[]) => {
  const allParentsIds: string[] = selectedItems
    .map((item: ScopeTreeRow) => (item?.above_levels_ids ?? '').split(','))
    .flat()
    ?.filter((idValue, index, array) => {
      return idValue && array.indexOf(idValue) === index
    })
  return allParentsIds
}

export const getParents = async (allParentsIds: string[], rootRows: ScopeTreeRow[], isExecutiveUnit?: boolean) => {
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

  let notFetchedParents: ScopeTreeRow[] = []

  if (notFetchedItems?.length > 0) {
    const perimeters = await servicesPerimeters.getPerimeters(
      notFetchedItems,
      undefined,
      undefined,
      undefined,
      isExecutiveUnit,
      undefined
    )

    if (!isCustomError(perimeters)) {
      notFetchedParents = await servicesPerimeters.buildScopeTreeRowList(perimeters)
    }
  }
  return [...fetchedParents, ...notFetchedParents]
}

/**
 * @description : load sub items of every elements in {selectedItems} then, update the equivalent (having the same id) element in {rootRows}.
 * @param rootRows : already loaded perimeters.
 * @param selectedItems : selected items to expand (load their sub items).
 * @param dispatch : dispatch redux actions to update the state of the store.
 * @param setRootRows : update {rootRows} because we loaded sub items of all elements in {selectedItems} (this is the expanding operation).
 * @param isExecutiveUnit : if true then load all perimters regardless of the user rights else, load only perimeters on which the user has rights.
 * @returns : {rootRows} but this time every item that exists in {selectedItems} has been loaded (its subItems field has been loaded).
 */
export const expandSelectedItems = async (
  rootRows: ScopeTreeRow[],
  selectedItems: ScopeTreeRow[],
  dispatch?: AppDispatch,
  setRootRows?: (newRootRows: ScopeTreeRow[]) => void,
  isExecutiveUnit?: boolean
) => {
  if (!selectedItems || selectedItems.length < 1) return

  const allParentsIds: string[] = await getAllParentsIds(selectedItems)

  // find equivalent item for every id in {allParentsIds} in {rootRows}. If no equivalent item is found then load if by a query.
  const parents: ScopeTreeRow[] = await getParents(allParentsIds, rootRows, isExecutiveUnit)

  const newRootRows: ScopeTreeRow[] = [...rootRows]

  // replace equivalent items that have been loaded in {newRootRows}.
  await updateRootRows(newRootRows, [...parents, ...selectedItems], parents)
  if (dispatch) {
    dispatch(updateScopeList({ newScopes: newRootRows, isExecutiveUnit: isExecutiveUnit }))
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
  for (let i = 0; i < newRootRows.length - 1; i++) {
    if (isOnlyParentsUpdate) {
      const isParent: boolean = parents.map((parent) => parent.id).includes(newRootRows[i].id)
      if (!isParent) continue
    }

    for (let j = 0; j < parentsAndSelectedItems.length; j++) {
      if (parentsAndSelectedItems[j].parentId === newRootRows[i].id) {
        if (newRootRows[i]?.subItems?.length === 1 && newRootRows[i]?.subItems?.[0]?.id === LOADING.id) {
          newRootRows[i] = { ...newRootRows[i], subItems: [] }
        }
        if (!newRootRows[i]?.subItems?.map((subItem) => subItem.id).includes(parentsAndSelectedItems[j].id)) {
          newRootRows[i]?.subItems?.push(parentsAndSelectedItems[j])
        }
      }
    }
    if (newRootRows[i]?.subItems?.[0]?.id !== LOADING.id) {
      await updateRootRows(newRootRows[i]?.subItems ?? [], parentsAndSelectedItems, parents)
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

/**
 * @description: this function initialize by loading the list of perimeters when exploring the perimeters list.
 * @param setIsSearchLoading : during the execution of this function "init" the variable isSearchLoadind should be set to true.
 * @param controllerRef : used to cancel any pending request before sending any new request.
 * @param rootRows : all the rows have been loading (the root would be aphp in the most case if the user have rights on aphp).
 * @param setRootRows : update the rows list that have been loaded.
 * @param setOpenPopulations : when user unfold some populations (some rows or hospitals) these ones should be registered here to keep them open.
 * @param setCount : contains the number of perimeters that have been loaded, it's used by the pagination, to indicate number of pages.
 * @param setIsEmpty : is set to true when there are no perimeter that have been loaded. It's useful to display a message that the list is empty.
 * @param dispatch : to dispatch a redux action to update the state.
 * @param executiveUnitType : type of executive unit to load only type from aphp (wich is the upper type) until this given type.
 * @param isExecutiveUnit : if it is true then no right restriction on loading perimeters, because the use can display all executive units.
 * @returns: nothing
 */
export const init = async (
  setIsSearchLoading: (isSearchLoading: boolean) => void,
  controllerRef: React.MutableRefObject<AbortController | null>,
  rootRows: ScopeTreeRow[],
  setRootRows: (newRootRows: ScopeTreeRow[]) => void,
  setOpenPopulations: (newOpenPopulation: number[]) => void,
  setCount: (newCount: number) => void,
  setIsEmpty: (isEmpty: boolean) => void,
  dispatch: AppDispatch,
  executiveUnitType?: ScopeType,
  isExecutiveUnit?: boolean
) => {
  setIsSearchLoading(true)
  cancelPendingRequest(controllerRef.current)

  let newPerimetersList: ScopeTreeRow[] = rootRows
  if (rootRows?.length <= 0 || isExecutiveUnit) {
    const fetchScopeTreeResponse = await dispatch(
      fetchScopesList({
        isScopeList: true,
        type: executiveUnitType,
        isExecutiveUnit: isExecutiveUnit,
        signal: controllerRef.current?.signal
      })
    ).unwrap()
    if (fetchScopeTreeResponse && !fetchScopeTreeResponse.aborted) {
      newPerimetersList = getCurrentScopeList(fetchScopeTreeResponse.scopesList, isExecutiveUnit)
      setRootRows(newPerimetersList)
      setOpenPopulations([])
      setCount(newPerimetersList?.length)
      setIsEmpty(!newPerimetersList || newPerimetersList.length < 0)
    }
  }
  setIsSearchLoading(false)
}

/**
 * @description : this function expand the item specified by the {rowId} param by loading its sub items and folded (by displaying its sub items). If the item is already expanded then it will be just folded up (by hidding its sub items).
 * @param rowId : the id of the item that the user want to expand (unfold).
 * @param controllerRef : used to store the signal ref in order to we can cancel it later if necessary (in case of calling of initializing of the scope tree root rows items for example).
 * @param openPopulation : the population (perimeters, items, scopes) that have been already unfold. When the item (specified by the rowId param) will be unfold then it will be added here.
 * @param setOpenPopulations : to update the openPopulation param.
 * @param rootRows : the list of already loaded perimeters.
 * @param setRootRows : to update the rootRows param.
 * @param selectedItems : the items that the user has already selected.
 * @param dispatch : dispatch a redux action to update the state.
 * @param executiveUnitType : to load only executive unit from top level (aphp) until the type specified in this param. So the other types lower than this type will not be loaded.
 * @param isExecutiveUnit : if it is defined (or true) then all the executive unit will be loaded regardless the right of the user.
 * @returns : nothing.
 */
export const onExpand = async (
  rowId: number,
  controllerRef: React.MutableRefObject<AbortController | null | undefined>,
  openPopulation: number[],
  setOpenPopulations: (newOpenPopulation: number[]) => void,
  rootRows: ScopeTreeRow[],
  setRootRows: (newRootRows: ScopeTreeRow[]) => void,
  selectedItems: ScopeTreeRow[],
  dispatch?: AppDispatch,
  executiveUnitType?: ScopeType,
  isExecutiveUnit?: boolean
) => {
  controllerRef.current = new AbortController()
  const _rootRows = rootRows ? [...rootRows] : []

  let expandResponse
  const params: ExpandScopeElementParamsType = {
    rowId: rowId,
    selectedItems: selectedItems,
    scopesList: buildScopeListType(_rootRows, isExecutiveUnit),
    openPopulation: openPopulation,
    executiveUnitType: executiveUnitType,
    isExecutiveUnit: isExecutiveUnit,
    signal: controllerRef.current?.signal
  }
  if (dispatch) {
    expandResponse = await dispatch(expandScopeElement(params)).unwrap()
  } else {
    expandResponse = await expandScopeTree(params)
  }
  if (expandResponse && !expandResponse.aborted) {
    setRootRows(getCurrentScopeList(expandResponse.scopesList, isExecutiveUnit) ?? [])
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

/**
 * @description : check if the {searchedItems} is already selected (included in {selectedItems}).
 * @param searchedItem : the item to be search in {selectedItems}.
 * @param selectedItems : the list where the search will be performed.
 * @returns : if all items are selected ('*' and item with id equals to '*' exists in this case in {selectedItems} list param) or if there is an item with the same id as item searchedItems exists in {selectedItems} then, return true, else returns false.
 */
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
  isNoLoading?: boolean,
  isExecutiveUnit?: boolean
): Promise<ScopeTreeRow | undefined> => {
  if (!id) return undefined
  let equivalentRow = findEquivalentRowInItemAndSubItems({ id: id }, searchRootRows).equivalentRow
  if (!equivalentRow) {
    equivalentRow = findEquivalentRowInItemAndSubItems({ id: id }, explorationRootRows).equivalentRow
    if (!equivalentRow && !isNoLoading) {
      const perimeters = await servicesPerimeters.getPerimeters([id], undefined, undefined, undefined, isExecutiveUnit)
      if (!isCustomError(perimeters)) {
        equivalentRow = await servicesPerimeters.buildScopeTreeRowList(
          perimeters,
          undefined,
          undefined,
          isExecutiveUnit
        )
        await updateRootRows(searchRootRows, [equivalentRow], [])
      }
    }
  }
  return equivalentRow
}

const getScopeTreeList = async (
  ids: string[],
  searchRootRows: ScopeTreeRow[],
  explorationRootRows: ScopeTreeRow[],
  isExecutiveUnit?: boolean
): Promise<ScopeTreeRow[]> => {
  const scopeTreeList: ScopeTreeRow[] = []
  const postLoadedIds: string[] = []

  for (const id of ids) {
    const equivalentRow: ScopeTreeRow | undefined = await getScopeTree(
      id,
      searchRootRows,
      explorationRootRows,
      true,
      isExecutiveUnit
    )
    if (equivalentRow) {
      scopeTreeList.push({ ...equivalentRow })
    } else {
      postLoadedIds.push(id)
    }
  }
  if (postLoadedIds?.length > 0) {
    const perimeters = await servicesPerimeters.getPerimeters(
      postLoadedIds,
      undefined,
      undefined,
      undefined,
      isExecutiveUnit
    )

    if (!isCustomError(perimeters)) {
      const postLoadedRows: ScopeTreeRow[] = await servicesPerimeters.buildScopeTreeRowList(
        perimeters,
        undefined,
        undefined,
        isExecutiveUnit
      )
      await updateRootRows(searchRootRows, postLoadedRows, [])
      scopeTreeList.push(...postLoadedRows)
    }
  }
  return scopeTreeList
}

const addToSelectedItems = async (
  rowToAdd: ScopeTreeRow,
  selectedItems: ScopeTreeRow[],
  rowsToAdd: ScopeTreeRow[],
  rowsToDelete: string[],
  searchRootRows: ScopeTreeRow[],
  explorationRootRows: ScopeTreeRow[],
  isExecutiveUnit?: boolean
) => {
  const parent: ScopeTreeRow | undefined = await getScopeTree(
    rowToAdd.parentId,
    searchRootRows,
    explorationRootRows,
    isExecutiveUnit
  )
  const inferiorLevelsIds: string[] = parent?.inferior_levels_ids?.split(',') ?? []
  const parentSubItems: ScopeTreeRow[] = await getScopeTreeList(
    inferiorLevelsIds,
    searchRootRows,
    explorationRootRows,
    isExecutiveUnit
  )
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
    await addToSelectedItems(
      parent,
      selectedItems,
      rowsToAdd,
      rowsToDelete,
      searchRootRows,
      explorationRootRows,
      isExecutiveUnit
    )
  }
}

/**
 * @description : because the {row} param selection/deselection is performed (before calling this function) then their parents selection/deselection should be updated too (that means their parents could be moved from/to {rowsToAdd} or {rowsToDelete} then, they will be moved from/to selectedItems later). The possible parent here is {selectedItem} param (if {selectedItem} is a parent).
 * @param aboveLevelsIds : above levels of {row} param item.
 * @param selectedItem : we will calculate again the selection/deselection of this item, because it could be selected/deselected if it is the parent of {row} param and because {row} param selection/deselection has been updated (performed in the function that called this function), then we should update it.
 * @param rowsToDelete : row to be deleted from {selectedItems} list param after the select/deselect calculation.
 * @param row : the row whose selection/deselection has been updated.
 * @param rowsToAdd : rows to be added to {selectedItems} list param, so it is a list of new selected items (because selection/deselection hase been updated).
 * @param selectedItems : the items that have been already selected (or their equivalent items having the same ids).
 * @param searchRootRows : the loaded items during a search operation.
 * @param explorationRootRows : the loaded items dureing an exploration operation.
 * @param isExecutiveUnit : if true then load perimeters without restrictions of user rights else, load only perimeters on which the user has rights.
 * @returns : true if {selectedItem} param is a parent and it still being selected else, false.
 */
const selectOrUnSelectParent = async (
  aboveLevelsIds: string[],
  selectedItem: ScopeTreeRow | undefined,
  rowsToDelete: string[],
  row: ScopeTreeRow,
  rowsToAdd: ScopeTreeRow[],
  selectedItems: ScopeTreeRow[],
  searchRootRows: ScopeTreeRow[],
  explorationRootRows: ScopeTreeRow[],
  isExecutiveUnit?: boolean
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
        rowsToAdd.push(
          ...(await getScopeTreeList(inferiorLevelsIds, searchRootRows, explorationRootRows, isExecutiveUnit))
        )
      } else {
        await selectOrUnSelectParent(
          selectedItem.above_levels_ids?.split(',') ?? [],
          await getScopeTree(selectedItem.parentId, searchRootRows, explorationRootRows, isExecutiveUnit),
          rowsToDelete,
          selectedItem,
          rowsToAdd,
          selectedItems,
          searchRootRows,
          explorationRootRows,
          isExecutiveUnit
        )
      }
    } else {
      const subItems: ScopeTreeRow[] = await getScopeTreeList(
        inferiorLevelsIds,
        searchRootRows,
        explorationRootRows,
        isExecutiveUnit
      )
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
            explorationRootRows,
            isExecutiveUnit
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

/**
 * @description : select or deselect the item specified by {row} (and possibly sub items or parent).
 * @param row : The row to be selected or deselected.
 * @param selectedItems : the items that have been already selected.
 * @param searchRootRows : the loaded rows after search operations (search, expand items in search component).
 * @param explorationRootRows : the loaded rows after explore operation (exploration, expand in exploration component).
 * @param isSelectionLoading : if true that means that there is a query in progress after a select/deselect operation. In this case we will not perform an new select/deselect operation.
 * @param setIsSelectionLoading : update the {isSelectionLoading} param.
 * @param setSelectedItems : update the {selectedItems} param.
 * @param setSearchedRows : update the {searchRootRows} param.
 * @param isExecutiveUnit : if true the every query sent will load perimeters regardless of the user rights (then it will load perimeters regardless the user rights).
 * @returns : the new selected items after select/deselect calculation.
 */
export const onSearchSelect = async (
  row: ScopeTreeRow,
  selectedItems: ScopeTreeRow[],
  searchRootRows: ScopeTreeRow[],
  explorationRootRows: ScopeTreeRow[],
  isSelectionLoading: boolean,
  setIsSelectionLoading: (isSelectionLoading: boolean) => void,
  setSelectedItems?: (newSelectedItems: ScopeTreeRow[]) => void,
  setSearchedRows?: (newSelectedItems: ScopeTreeRow[]) => void,
  isExecutiveUnit?: boolean
): Promise<ScopeTreeRow[]> => {
  if (isSelectionLoading) return selectedItems
  // display loading progress while calculation of selection/deselection
  else setIsSelectionLoading(true)
  // because of updates, these rows will be deselected (will be removed from {selectedItems} later)
  const rowsToDelete: string[] = []
  // because of updates, these rows will be selected (will be added to {selectedItems} later)
  const rowsToAdd: ScopeTreeRow[] = []
  // find equivalent row because {selectedItems} may not have all fields filled (like subItems field may not have been loaded yet)
  const equivalentSelectedItems: ScopeTreeRow[] = selectedItems.map(
    (item) => findEquivalentRowInItemAndSubItems(item, searchRootRows).equivalentRow ?? item
  )
  // if {row} exists in {equivalentSelectedItems} list or in any subItems of one of its items.
  if (isIncludedInListAndSubItems(row, equivalentSelectedItems)) {
    // step 1.a: {row} already exists in {equivalentSelectedItems}, that means it's already selected, then deselect it by adding it to {rowsToDelete}.
    rowsToDelete.push(row.id)
    // step 2: what about the parent of {row}, calculate new status of its parent selection/deselection.
    const aboveLevelsIds: string[] = row.above_levels_ids?.split(',') ?? []
    for (let i = 0; i < equivalentSelectedItems.length; i++) {
      if (equivalentSelectedItems[i].id === row.id) {
        rowsToDelete.push(equivalentSelectedItems[i].id)
        break
      } else {
        // if we updated the first above parent (if true) then no need to (break) update the 2nd level above parent (because {selectOrUnSelectParent will update all above parents recursively})
        if (
          // update above parent (and recursively all above parents)
          await selectOrUnSelectParent(
            aboveLevelsIds,
            equivalentSelectedItems[i],
            rowsToDelete,
            row,
            rowsToAdd,
            equivalentSelectedItems,
            searchRootRows,
            explorationRootRows,
            isExecutiveUnit
          )
        ) {
          break
        }
      }
    }
  } else {
    // step 1.b: {row} does not exist in {equivalentSelectedItems}, that means it's not selected, then select it by adding it to {rowsToAdd}.
    rowsToAdd.push(row)
  }

  // step 3: remove duplicates.
  let uniqueRowsToDelete: string[] = [...new Set(rowsToDelete)]
  let newSelectedItems: ScopeTreeRow[] = equivalentSelectedItems.filter((row) => !uniqueRowsToDelete.includes(row.id))
  let uniqueRowsToAdd: ScopeTreeRow[] = removeDuplicates(rowsToAdd).filter(
    (row) => !uniqueRowsToDelete.includes(row.id)
  )

  // step 4: squash/compress {newSelectedItems} and add {rowsToAdd}
  for (const rowToAdd of uniqueRowsToAdd) {
    newSelectedItems = [...newSelectedItems, rowToAdd]
    newSelectedItems = squashItems(newSelectedItems)
    await addToSelectedItems(
      rowToAdd,
      newSelectedItems,
      uniqueRowsToAdd,
      uniqueRowsToDelete,
      searchRootRows,
      explorationRootRows,
      isExecutiveUnit
    )
  }
  // step 5: remove {rowsToDelete} from {newSelectedItems}
  uniqueRowsToDelete = [...new Set(uniqueRowsToDelete)]
  uniqueRowsToAdd = removeDuplicates(uniqueRowsToAdd)
  newSelectedItems = [...newSelectedItems, ...uniqueRowsToAdd].filter((row) => !uniqueRowsToDelete.includes(row.id))
  newSelectedItems = squashItems(newSelectedItems)

  if (setSelectedItems) setSelectedItems(newSelectedItems)
  if (setSearchedRows) setSearchedRows(searchRootRows)
  // selection/deselection operation is complete then, remove loading progress
  setIsSelectionLoading(false)
  return newSelectedItems
}

/**
 * @description : called when the user select all checkbox. So that all items will be unchecked or checked at once.
 * @param rootRows : the list of perimeters that have been already loaded.
 * @param setSelectedItems : update the items that have been selected by the user.
 * @param isHeaderSelected : true if the user has already clicked on select all checkbox (or has selected all items displayed or the top root item like aphp).
 * @param isSelectionLoading : is there is any query in progress after a check or uncheck action.
 * @param setIsSelectionLoading : set a new value of isSelectionLoading param.
 * @returns : unique rows of selected items if all items has been selected, or an empty list if all items has been deselected.
 */
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

/**
 * @description : called when the user select all checkbox. So that all items will be unchecked or checked at once.
 * @param rootRows : the list of perimeters that have been already loaded.
 * @param selectedItems: the items already selected by the user.
 * @param setSelectedItems : update the items that have been selected by the user.
 * @param isHeaderSelected : true if the user has already clicked on select all checkbox (or has selected all items displayed or the top root item like aphp).
 * @param searchRootRows : items loaded during search operation.
 * @param explorationRootRows: items loaded during exploration operation.
 * @param isSelectionLoading : is there is any query in progress after a check or uncheck action.
 * @param setIsSelectionLoading : set a new value of isSelectionLoading param.
 * @returns : unique rows of selected items if all items has been selected, or an empty list if all items has been deselected.
 */
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

/**
 * @description: check if any sub item of {row} in the {selectedItems}.
 * @param row : row to be checked if it has any sub item in the {selectedItems} list.
 * @param selectedItems : items already selected by the user.
 * @returns : true if any sub item of {row} in the {selectedItems}, else false.
 */
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

/**
 * @description: check if {row} (or each item of its sub items) exists in the {selectedItems}.
 * @param row : row to be checked if it has any sub item in the {selectedItems} list.
 * @param selectedItems : items already selected by the user.
 * @returns : true if {row} (or each item of its sub items) exists in the {selectedItems} else, false
 */
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

/**
 * @description : find perimeters having {searchInput} text.
 * @param searchInput : the text that should be found in the loaded perimeters after a search operation.
 * @param page : the number of page to be loaded (its value will be greater than 1 if there are many perimeters found). Example : if the page is equal 2, that means we want to load all perimeters having {searchInput} text but we want only the page 2 of the result search.
 * @param controllerRef : used to cancel any query (search operation) in progess before starting a new search operation.
 * @param setIsSearchLoading : set to true until the search operation is finished, to display loading progress during search operation.
 * @param setIsEmpty : true if no perimeter is found, to display a message explaining that no perimeter is found.
 * @param setCount : the number of perimeters found matching the result of search operation.
 * @param setRootRows : the perimeters to be displayed.
 * @param searchRootRows : loaded perimeters during search operation.
 * @param setSearchRootRows : update {searchRootRows} param state with additional loaded perimeters.
 * @param setOpenPopulations : update {openPopulation} param state with new list (empty list) to initialize display.
 * @param executiveUnitType : used to not load perimeters lower (in hierarchy) than {executiveUnitType} param.
 * @param isExecutiveUnit : if true then load all perimeters regardless the rights of user.
 * @returns : a list of perimeters containing {searchInput} text.
 */
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
  executiveUnitType?: ScopeType,
  isExecutiveUnit?: boolean
) => {
  setIsSearchLoading(true)
  let newRootRows: ScopeTreeRow[] = []
  try {
    cancelPendingRequest(controllerRef.current)

    const {
      scopeTreeRows: newPerimetersList,
      count: newCount,
      aborted
    } = await servicesPerimeters.findScope(
      searchInput,
      page,
      controllerRef.current?.signal,
      executiveUnitType,
      isExecutiveUnit
    )

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
    // expand {newPerimetersList} in order to know if any item is selected or indeterminate (the item is not selected but some of its sub items are selected).
    newRootRows =
      (await expandSelectedItems(searchRootRows, newPerimetersList, undefined, undefined, isExecutiveUnit)) ??
      searchRootRows
  } catch (error) {
    console.error('An error has been occured while searching data')
    setIsSearchLoading(false)
  }
  setSearchRootRows(newRootRows)
  return newRootRows
}

/**
 * @description : this function build the head of the scope tree table according to the specified params.
 * @param headCheckbox : checkbox component to select or deselect all items in one click.
 * @param executiveUnitType : the type of executive unit (like aphp), if the type is specified then the column type will be displayed in the head.
 * @returns : list of columns to be displayed. Each item in the list has information about the column (id, label ...)
 */
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
