import { PmsiListType } from 'state/pmsi'
import { TreeElement } from '../types'

/**
 * This function is called when a user select an element of pmsi hierarchy
 * return selected items that should be saved
 */
export const getSelectedPmsi = (row: PmsiListType, selectedItems: PmsiListType[] | null, rootRows: PmsiListType[]) => {
  let savedSelectedItems = selectedItems ? [...selectedItems] : []

  const foundItem = savedSelectedItems.find(({ id }) => id === row.id)
  const index = foundItem ? savedSelectedItems.indexOf(foundItem) : -1

  const getRowAndChildren = (parent: PmsiListType) => {
    const getChild: (subItem: PmsiListType) => PmsiListType[] = (subItem: PmsiListType) => {
      if (subItem?.id === 'loading') return []

      return [
        subItem,
        ...(subItem.subItems ? subItem.subItems.map((subItem: PmsiListType) => getChild(subItem)) : [])
      ].flat()
    }

    return [
      parent,
      ...(parent.subItems
        ? parent.id === 'loading'
          ? []
          : parent.subItems.map((subItem: PmsiListType) => getChild(subItem))
        : [])
    ].flat()
  }

  const deleteRowAndChildren = (parent: PmsiListType) => {
    const elemToDelete = getRowAndChildren(parent)

    savedSelectedItems = savedSelectedItems.filter((row) => !elemToDelete.some(({ id }) => id === row.id))
    savedSelectedItems = savedSelectedItems.filter((row) => {
      // Remove if one child is not checked
      if (row.subItems && row.subItems.length > 0 && row.subItems[0].id === 'loading') {
        return true
      }
      const numberOfSubItemsSelected = row?.subItems?.filter((subItem: any) =>
        savedSelectedItems.find(({ id }) => id === subItem.id)
      )?.length
      if (numberOfSubItemsSelected && numberOfSubItemsSelected !== row?.subItems?.length) {
        return false
      }
      return true
    })

    return savedSelectedItems
  }

  if (index !== -1) {
    savedSelectedItems = deleteRowAndChildren(row)
  } else {
    savedSelectedItems = [...savedSelectedItems, ...getRowAndChildren(row)]
  }

  let _savedSelectedItems: any[] = []
  const checkIfParentIsChecked = (rows: PmsiListType[]) => {
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
          row.subItems.filter((child) => savedSelectedItems.find((selectedChild) => selectedChild.id === child.id))
        : []
      const foundItem = savedSelectedItems.find(({ id }) => id === row.id)

      if (row && row.subItems && selectedChildren.length === row.subItems.length && !foundItem) {
        savedSelectedItems = [...savedSelectedItems, row]
      } else if (
        row &&
        row.subItems &&
        row.subItems.length > 0 &&
        selectedChildren.length > 0 &&
        selectedChildren.length !== row.subItems.length
      ) {
        savedSelectedItems = savedSelectedItems.filter(({ id }) => id !== row.id)
      }

      // Need a real fix .. 🥲
      // // Protection:
      // // When the user select a scope, reload, select and unselect a subitems the parent have subitems = []
      // // So, replace the parent and the condition `selectedChildren.length !== foundItem.subItems.length` can be validated

      const indexOfItem = foundItem && savedSelectedItems ? savedSelectedItems.indexOf(foundItem) : -1
      if (indexOfItem !== -1) savedSelectedItems[indexOfItem] = row

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

export const filterSelectedPmsi = (selectedItems: PmsiListType[], rootRows: PmsiListType[]) => {
  // If you chenge this code, change it too inside: PopulationCard.tsx:31 and Scope.jsx:25
  return selectedItems.filter((item, index, array) => {
    // reemove double item
    const foundItem = array.find(({ id }) => item.id === id)
    const currentIndex = foundItem ? array.indexOf(foundItem) : -1
    if (index !== currentIndex) return false

    const returnParentElement: (
      _array: PmsiListType[],
      parentArray: PmsiListType | undefined
    ) => PmsiListType | undefined = (_array, parentArray) => {
      let parentElement: PmsiListType | undefined = undefined

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

    const parentItem: PmsiListType | undefined = returnParentElement(rootRows, undefined)

    if (parentItem !== undefined) {
      const selectedChildren =
        parentItem.subItems && parentItem.subItems.length > 0
          ? parentItem.subItems.filter((subItem) => !!array.find(({ id }) => id === subItem.id))
          : []

      if (selectedChildren.length === (parentItem.subItems && parentItem.subItems.length)) {
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
}

export const checkIfIndeterminated: (_row: any, selectedItems: any) => boolean | undefined = (_row, selectedItems) => {
  // Si que un loading => false
  if (_row.subItems && _row.subItems.length > 0 && _row.subItems[0].id === 'loading') {
    return false
  }
  const checkChild: (item: any) => boolean = (item) => {
    const numberOfSubItemsSelected = item.subItems?.filter((subItem: any) =>
      selectedItems.find((selectedItems: any) => selectedItems.id === subItem.id)
    )?.length

    if (numberOfSubItemsSelected && numberOfSubItemsSelected !== item.subItems.length) {
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
export const findSelectedInListAndSubItems = (
  selectedItems: TreeElement[],
  searchedItem: TreeElement | undefined,
  pmsiHierarchy: TreeElement[]
): boolean => {
  if (!searchedItem || !selectedItems || selectedItems.length === 0) return false
  selectedItems = selectedItems?.filter(({ id }) => id !== 'loading')
  const foundItem = selectedItems.find((selectedItem) => {
    if (selectedItem.id === searchedItem.id || selectedItem.id == '*') {
      return true
    }
    return selectedItem.subItems
      ? findSelectedInListAndSubItems(selectedItem.subItems, searchedItem, pmsiHierarchy)
      : false
  })
  if (foundItem) {
    return true
  }
  if (
    searchedItem.subItems &&
    searchedItem.subItems.length > 0 &&
    !(searchedItem.subItems.length === 1 && searchedItem.subItems[0].id === 'loading')
  ) {
    const numberOfSubItemsSelected = searchedItem.subItems?.filter((searchedSubItem: any) =>
      selectedItems.find((selectedItem) => selectedItem.id === searchedSubItem.id)
    )?.length
    if (searchedItem.subItems?.length === numberOfSubItemsSelected) {
      return true
    }
    const isSingleItemNotSelected = (searchedItem.subItems?.length ?? 0 - (numberOfSubItemsSelected ?? 0)) === 1
    if (numberOfSubItemsSelected && isSingleItemNotSelected) {
      const singleItemNotSelected = searchedItem.subItems?.find((searchedSubItem: any) =>
        selectedItems.find((selectedItem) => selectedItem.id !== searchedSubItem.id)
      )
      return findSelectedInListAndSubItems(selectedItems, singleItemNotSelected, pmsiHierarchy)
    }
  }
  return false
}
export const findEquivalentRowInItemAndSubItems: (
  item: TreeElement,
  rows: TreeElement[] | undefined
) => { equivalentRow: TreeElement | undefined; parentsList: TreeElement[] } = (
  item: TreeElement,
  rows: TreeElement[] | undefined
) => {
  let equivalentRow: TreeElement | undefined = undefined
  const parentsList: TreeElement[] = []
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
export const getNewSelectedItems = (
  row: TreeElement,
  selectedItems: TreeElement[] | undefined,
  rootRows: TreeElement[]
) => {
  selectedItems = (selectedItems ?? []).map(
    (selectedItem) => findEquivalentRowInItemAndSubItems(selectedItem, rootRows).equivalentRow ?? selectedItem
  )
  const { flattedSelectedItems } = flatItems(selectedItems)
  let savedSelectedItems = flattedSelectedItems
  const isFound = savedSelectedItems?.find((item) => item.id === row.id)

  const getRowAndChildren = (parent: TreeElement) => {
    const getChild: (subItem: TreeElement) => TreeElement[] = (subItem: TreeElement) => {
      if (subItem?.id === 'loading') return []

      return [
        subItem,
        ...(subItem.subItems ? subItem.subItems.map((subItem: TreeElement) => getChild(subItem)) : [])
      ].flat()
    }

    return [
      parent,
      ...(parent.subItems
        ? parent.id === 'loading'
          ? []
          : parent.subItems.map((subItem: TreeElement) => getChild(subItem))
        : [])
    ].flat()
  }

  const deleteRowAndChildren = (parent: TreeElement) => {
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
  const checkIfParentIsChecked = (rows: TreeElement[]) => {
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
          row.subItems.filter((child) => savedSelectedItems.find((selectedChild) => selectedChild.id === child.id))
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
export const flatItems = (items: TreeElement[] | undefined) => {
  const selectedIds: string[] | undefined = []
  const flattedSelectedItems: TreeElement[] | undefined = []
  const flat = (items: TreeElement[] | undefined) => {
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
