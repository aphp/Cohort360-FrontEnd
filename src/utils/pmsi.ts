import { expandPmsiElement, PmsiListType } from 'state/pmsi'
import { AsyncThunk } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from '../state'
import {
  decrementLoadingSyncHierarchyTable,
  incrementLoadingSyncHierarchyTable,
  initSyncHierarchyTable,
  pushSyncHierarchyTable
} from '../state/syncHierarchyTable'
import { AbstractTree, SelectedCriteriaType } from '../types'
import { expandMedicationElement } from '../state/medication'
import { expandBiologyElement } from '../state/biology'
import services from 'services/aphp'

/**
 * This function is called when a user select an element of pmsi hierarchy
 * return selected items that should be saved
 */
export const getHierarchySelection = (row: any, selectedItems: any[] | undefined, rootRows: any[]): any[] => {
  selectedItems = (selectedItems ?? []).map(
    (selectedItem) => findEquivalentRowInItemAndSubItems(selectedItem, rootRows).equivalentRow ?? selectedItem
  )
  const { flattedSelectedItems } = flatItems(selectedItems)
  let savedSelectedItems = flattedSelectedItems
  const isFound = savedSelectedItems?.find((item) => item.id === row.id)

  const getRowAndChildren = (parent: any): any[] => {
    const getChild: (subItem: any) => any[] = (subItem: any) => {
      if (subItem?.id === 'loading') return []

      return [subItem, ...(subItem.subItems ? subItem.subItems.map((subItem: any) => getChild(subItem)) : [])].flat()
    }

    return [
      parent,
      ...(parent.subItems
        ? parent.id === 'loading'
          ? []
          : parent.subItems.map((subItem: any) => getChild(subItem))
        : [])
    ].flat()
  }

  const deleteRowAndChildren = (parent: any): any[] => {
    const elemToDelete = getRowAndChildren(parent)

    savedSelectedItems = savedSelectedItems.filter((row) => !elemToDelete.some(({ id }) => id === row.id))

    return savedSelectedItems
  }

  if (isFound) {
    savedSelectedItems = deleteRowAndChildren(row)
  } else {
    savedSelectedItems = [...savedSelectedItems, ...getRowAndChildren(row)]
  }

  let _savedSelectedItems: any[] = []
  const checkIfParentIsChecked = (rows: any[]): void => {
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]
      if (
        !row.subItems ||
        (row && row.subItems.length === 0) ||
        (row && row.subItems.length === 1 && row.subItems[0].id === 'loading')
      ) {
        continue
      }

      const selectedChildren = row.subItems
        ? // eslint-disable-next-line
          row.subItems.filter((child: { id: any }) =>
            savedSelectedItems.find((selectedChild) => selectedChild.id === child.id)
          )
        : []
      const foundItem = savedSelectedItems.find(({ id }) => id === row.id)

      if (row && row.subItems && selectedChildren.length === row.subItems.length && !foundItem) {
        savedSelectedItems = [...savedSelectedItems, row]
      } else if (
        row &&
        row.subItems &&
        row.subItems.length > 0 &&
        selectedChildren &&
        selectedChildren.length !== row.subItems.length
      ) {
        savedSelectedItems = savedSelectedItems.filter(({ id }) => id !== row.id)
      }

      // Need a real fix .. 🥲
      // // Protection:
      // // When the user select a scope, reload, select and unselect a subitems the parent have subitems = []
      // // So, replace the parent and the condition `selectedChildren.length !== foundItem.subItems.length` can be validated

      const indexOfItem = foundItem && savedSelectedItems ? savedSelectedItems.indexOf(foundItem) : -1
      if (indexOfItem !== -1) {
        savedSelectedItems[indexOfItem] = row
      }

      if (row.subItems) checkIfParentIsChecked(row.subItems)
    }
  }

  while (savedSelectedItems.length !== _savedSelectedItems.length) {
    _savedSelectedItems = savedSelectedItems
    checkIfParentIsChecked(rootRows)
  }

  savedSelectedItems = savedSelectedItems.filter((item, index, array) => array.indexOf(item) === index)

  return savedSelectedItems
}

export const optimizeHierarchySelection = (
  selectedItems: PmsiListType[],
  rootRows: AbstractTree<unknown>[]
): PmsiListType[] => {
  // If you chenge this code, change it too inside: PopulationCard.tsx:31 and Scope.jsx:25
  selectedItems = selectedItems.map(
    (selectedItem) => findEquivalentRowInItemAndSubItems(selectedItem, rootRows).equivalentRow ?? selectedItem
  )
  const updatedRows: any[] = []
  const newSelectedItems = selectedItems.filter((item, index, array) => {
    // reemove double item
    const foundItem = array.find(({ id }) => item.id === id)
    const currentIndex = foundItem ? array.indexOf(foundItem) : -1
    if (index !== currentIndex) return false

    if (!item.subItems || (item.subItems && item.subItems.length === 1 && item.subItems[0].id === 'loading')) {
      if (item && item.subItems && !(item.subItems.length === 1 && item.subItems[0].id === 'loading')) {
        updatedRows.push({ ...item })
      }
    }
    const returnParentElement: (_array: any[], parentArray: any | undefined) => any | undefined = (
      _array,
      parentArray
    ) => {
      let parentElement: any | undefined = undefined
      if (!_array) return
      for (const element of _array) {
        if (parentElement) continue

        if (element.id === item.id) {
          parentElement = parentArray
        }

        if (
          !parentElement &&
          element &&
          element.subItems &&
          element.subItems.length > 0 &&
          element.subItems[0].id !== 'loading'
        ) {
          parentElement = returnParentElement(element.subItems, element)
        }
      }
      return parentElement
    }

    const parentItem: any | undefined = returnParentElement(rootRows, undefined)

    if (parentItem !== undefined) {
      const selectedChildren =
        parentItem.subItems && parentItem.subItems.length > 0
          ? parentItem.subItems.filter((subItem: { id: any }) => !!array.find(({ id }) => id === subItem.id))
          : []

      if (
        selectedChildren.length === (parentItem.subItems && parentItem.subItems.length) &&
        selectedItems.find((item) => item.id === parentItem.id)
      ) {
        // Si item + TOUS LES AUTRES child sont select. => Delete it
        return false
      } else {
        // Sinon => Keep it
        return true
      }
    } else {
      if (
        !item.subItems ||
        (item.subItems && item.subItems.length === 0) ||
        (item.subItems && item.subItems.length > 0 && item.subItems[0].id === 'loading')
      ) {
        // Si pas d'enfant, pas de check => Keep it
        return true
      }

      const selectedChildren =
        item.subItems && item.subItems.length > 0
          ? item.subItems.filter((subItem: any) => !!array.find(({ id }) => id === subItem.id))
          : []

      if (selectedChildren.length === 0 || selectedChildren.length === item.subItems.length) {
        // Si tous les enfants sont check => Keep it
        return true
      } else {
        // Sinon => Delete it
        return false
      }
    }
  })

  return newSelectedItems.map((newSelectedItem) => {
    const updatedRow = updatedRows.find((updatedRow) => updatedRow.id === newSelectedItem.id)
    return updatedRow ?? newSelectedItem
  })
}

export const checkIfIndeterminated: (_row: any, selectedItems: any) => boolean | undefined = (_row, selectedItems) => {
  // Si que un loading => false
  if (_row.subItems && _row.subItems.length > 0 && _row.subItems[0].id === 'loading') {
    return false
  }
  const checkChild: (item: any) => boolean = (item) => {
    const numberOfSubItemsSelected = selectedItems
      ? item.subItems?.filter((subItem: any) =>
          selectedItems.find((selectedItems: any) => selectedItems.id === subItem.id)
        )?.length
      : 0

    if (numberOfSubItemsSelected) {
      // Si un des sub elem qui est check => true
      return true
    } else if (item.subItems?.length >= numberOfSubItemsSelected) {
      // Si un des sub-sub (ou sub-sub-sub ...) elem qui est check => true
      let isCheck = false
      for (const child of item.subItems) {
        if (isCheck) continue
        isCheck = !!checkChild(child)
      }
      return isCheck
    } else {
      // Sinon => false
      return false
    }
  }
  return checkChild(_row)
}
export const findEquivalentRowInItemAndSubItems: (
  item: any,
  rows: any[] | undefined
) => { equivalentRow: any | undefined; parentsList: any[] } = (item: any, rows: any[] | undefined) => {
  let equivalentRow: any | undefined = undefined
  const parentsList: any[] = []
  if (!rows) return { equivalentRow: equivalentRow, parentsList: parentsList }
  for (const row of rows) {
    if (row.id === item.id) {
      parentsList.push(row)
      equivalentRow = row
      break
    } else {
      const { equivalentRow: lastNode, parentsList: newParentsList } = findEquivalentRowInItemAndSubItems(
        item,
        row.subItems
      )
      if (lastNode) {
        equivalentRow = lastNode
        parentsList.push(...newParentsList)
        break
      }
    }
  }
  return { equivalentRow: equivalentRow, parentsList: parentsList }
}
export const flatItems = (items: any[] | undefined): { flattedSelectedItems: any[]; selectedIds: string[] } => {
  const selectedIds: string[] = []
  const flattedSelectedItems: any[] = []
  const flat = (items: any[] | undefined): void => {
    if (!items) return
    items.forEach((item) => {
      if (item.id === 'loading') {
        return
      }
      if (selectedIds?.indexOf(item.id) === -1) {
        selectedIds.push(item.id)
        flattedSelectedItems?.push(item)
      }
      if (item.subItems) flat(item.subItems)
    })
  }
  flat(items)
  return { flattedSelectedItems: flattedSelectedItems, selectedIds: selectedIds }
}

export const initSyncHierarchyTableEffect = async (
  resourceHierarchy: PmsiListType[],
  selectedCriteria: SelectedCriteriaType,
  selectedCodes: PmsiListType[],
  fetchResource: AsyncThunk<any, void, { state: RootState }>,
  resourceType: string,
  dispatch: AppDispatch,
  isFetchedResource?: boolean
): Promise<void> => {
  if (!isFetchedResource) {
    await dispatch(fetchResource())
  }
  if (!selectedCriteria) {
    await dispatch(pushSyncHierarchyTable({ code: [] }))
  } else {
    await dispatch(initSyncHierarchyTable(selectedCriteria))
  }
  dispatch(incrementLoadingSyncHierarchyTable())
  resourceHierarchy = await expandHierarchyCodes(
    selectedCodes,
    selectedCodes,
    resourceHierarchy,
    resourceType,
    dispatch
  )
  dispatch(decrementLoadingSyncHierarchyTable())
}

export const onChangeSelectedCriteriaEffect = async (
  codesToExpand: PmsiListType[],
  selectedCodes: PmsiListType[],
  resourceHierarchy: PmsiListType[],
  resourceType: string,
  dispatch: AppDispatch
): Promise<void> => {
  await expandHierarchyCodes(codesToExpand, selectedCodes, resourceHierarchy, resourceType, dispatch)
  dispatch(pushSyncHierarchyTable({ code: selectedCodes }))
}

const isExpanded = (itemToExpand: PmsiListType | undefined): boolean => {
  if (
    itemToExpand &&
    itemToExpand.subItems &&
    itemToExpand.subItems?.length > 0 &&
    itemToExpand.subItems[0].id !== 'loading'
  ) {
    return true
  } else {
    return false
  }
}
export const MEDICATION_REQUEST = 'MedicationRequest'
export const CLAIM = 'Claim'
export const CONDITION = 'Condition'
export const PROCEDURE = 'Procedure'
export const OBSERVATION = 'Observation'

const expandRequest = async (
  codeToExpand: string,
  selectedCodes: PmsiListType[],
  resourceType: string,
  dispatch: AppDispatch
): Promise<PmsiListType[] | undefined> => {
  let type: 'claim' | 'condition' | 'procedure' = 'claim'
  if (resourceType.toLowerCase() === MEDICATION_REQUEST.toLowerCase()) {
    const expandedMedication = await dispatch(
      expandMedicationElement({
        rowId: codeToExpand,
        selectedItems: selectedCodes
      })
    ).unwrap()
    return expandedMedication.list
  } else if (resourceType.toLowerCase() === OBSERVATION.toLowerCase()) {
    const expandedBiology = await dispatch(
      expandBiologyElement({
        rowId: codeToExpand,
        selectedItems: selectedCodes
      })
    ).unwrap()
    return expandedBiology.list
  } else if (resourceType.toLowerCase() === 'claim') {
    type = 'claim'
  } else if (resourceType.toLowerCase() === 'procedure') {
    type = 'procedure'
  } else if (resourceType.toLowerCase() === 'condition') {
    type = 'condition'
  } else {
    return undefined
  }
  const expandedPmsiElements = await dispatch(
    expandPmsiElement({
      keyElement: type,
      rowId: codeToExpand,
      selectedItems: selectedCodes
    })
  ).unwrap()
  return expandedPmsiElements[type].list
}

export const expandItem = async (
  codeToExpand: string,
  selectedCodes: PmsiListType[],
  resourceHierarchy: PmsiListType[],
  resourceType: string,
  dispatch: AppDispatch
): Promise<PmsiListType[]> => {
  const equivalentRow = findEquivalentRowInItemAndSubItems(
    { id: codeToExpand, label: 'loading' },
    resourceHierarchy
  ).equivalentRow
  let newResourceHierarchy = undefined
  if (isExpanded(equivalentRow)) {
    newResourceHierarchy = resourceHierarchy
  } else {
    newResourceHierarchy = await expandRequest(codeToExpand, selectedCodes, resourceType, dispatch)
  }
  return newResourceHierarchy || []
}

const expandSingleResourceItem = async (
  codeToExpand: PmsiListType,
  selectedCodes: PmsiListType[],
  resourceHierarchy: PmsiListType[],
  resourceType: string,
  dispatch: AppDispatch
): Promise<PmsiListType[]> => {
  if (
    !codeToExpand ||
    (selectedCodes.find((item) => item.id === codeToExpand.id) &&
      findEquivalentRowInItemAndSubItems(codeToExpand, resourceHierarchy).equivalentRow)
  )
    return resourceHierarchy
  let newResourceHierarchy: PmsiListType[] = resourceHierarchy
  const expandItemAndSubItems = async (itemToExpand: PmsiListType, resourceType: string): Promise<PmsiListType[]> => {
    newResourceHierarchy = await expandItem(
      itemToExpand?.id,
      selectedCodes,
      newResourceHierarchy,
      resourceType,
      dispatch
    )

    if (!selectedCodes.find((selectedItem) => selectedItem.id === itemToExpand.id)) {
      if (!isExpanded(itemToExpand)) {
        const updatedItem =
          findEquivalentRowInItemAndSubItems(itemToExpand, newResourceHierarchy).equivalentRow ?? itemToExpand
        itemToExpand = updatedItem ?? itemToExpand
      }
      const subItems = itemToExpand.subItems?.filter((item) => parentsList.find((code) => code.id === item.id)) ?? []
      for await (const item of subItems) {
        newResourceHierarchy = await expandItemAndSubItems(item, resourceType)
      }
    }
    return newResourceHierarchy
  }
  const getHigherParentFromList = (parentsList: PmsiListType[]): PmsiListType | undefined => {
    const higherParentCode: PmsiListType | undefined =
      newResourceHierarchy && newResourceHierarchy[0] && newResourceHierarchy[0].subItems
        ? newResourceHierarchy[0].subItems.find(({ id }) => parentsList.find((code) => code.id === id))
        : undefined
    return higherParentCode
  }

  const getHigherParent = async (
    code: PmsiListType
  ): Promise<{ higherParentCode: PmsiListType | undefined; parentsList: any[] }> => {
    const { parentsList: parentsListByAlreadyFetched } = findEquivalentRowInItemAndSubItems(
      codeToExpand,
      newResourceHierarchy
    )
    let higherParentCode: PmsiListType | undefined = getHigherParentFromList(parentsListByAlreadyFetched)
    if (higherParentCode) {
      return { higherParentCode: higherParentCode, parentsList: parentsListByAlreadyFetched }
    } else if (!higherParentCode) {
      const response = await services.cohortCreation.fetchSingleCodeHierarchy(resourceType, code.id)
      const parentsListByFetch = response
        ? response.map((item) => {
            return { id: item, label: 'loading', subItems: [] }
          })
        : []
      higherParentCode = getHigherParentFromList(parentsListByFetch)

      return { higherParentCode: higherParentCode, parentsList: parentsListByFetch }
    }
    return higherParentCode
  }
  const { higherParentCode, parentsList } = await getHigherParent(codeToExpand)
  if (!higherParentCode) return newResourceHierarchy

  await expandItemAndSubItems(higherParentCode, resourceType)
  return newResourceHierarchy
}
const expandHierarchyCodes = async (
  codesToExpand: PmsiListType[],
  selectedCodes: PmsiListType[],
  resourceHierarchy: PmsiListType[],
  resourceType: string,
  dispatch: AppDispatch
): Promise<PmsiListType[]> => {
  let newResourceHierarchy: PmsiListType[] = resourceHierarchy
  for await (const itemToExpand of codesToExpand) {
    newResourceHierarchy = await expandSingleResourceItem(
      itemToExpand,
      selectedCodes,
      newResourceHierarchy,
      resourceType,
      dispatch
    )
  }
  resourceHierarchy = newResourceHierarchy
  return resourceHierarchy
}
export const syncOnChangeFormValue = async (
  key: string,
  value: any,
  selectedCriteria: SelectedCriteriaType,
  resourceHierarchy: PmsiListType[],
  setDefaultCriteria: (value: PmsiListType[]) => void,
  selectedTab: string,
  resourceType: string,
  dispatch: AppDispatch
): Promise<void> => {
  const newSelectedCriteria: any = selectedCriteria ? { ...selectedCriteria } : {}
  newSelectedCriteria[key] = value
  if (key === 'code') {
    const optimizedHierarchySelection: PmsiListType[] = optimizeHierarchySelection(
      newSelectedCriteria.code,
      resourceHierarchy
    )
    newSelectedCriteria[key] = optimizedHierarchySelection
    dispatch(pushSyncHierarchyTable({ code: optimizedHierarchySelection }))
    if (selectedTab === 'form') {
      if (
        selectedCriteria.type !== 'IPPList' &&
        selectedCriteria.type !== 'DocumentReference' &&
        selectedCriteria.type !== 'Encounter' &&
        selectedCriteria.type !== 'Patient'
      ) {
        expandHierarchyCodes(
          optimizedHierarchySelection,
          selectedCriteria.code?.map((code) => ({ ...code, subItems: [] })) ?? [],
          resourceHierarchy,
          resourceType,
          dispatch
        )
      }
    }
  }
  setDefaultCriteria(newSelectedCriteria)
}
