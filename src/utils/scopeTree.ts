import { ExpandScopeElementParamsType, ScopeTreeRow, ScopeType } from 'types'
import services from 'services/aphp'
import { RootState } from 'state'

export const LOADING: ScopeTreeRow = { id: 'loading', name: 'loading', quantity: 0, subItems: [] }
/**
 * This function is called when a user click on checkbox
 * return selected items that should be saved
 */
export const getSelectedScopes = (
  row: ScopeTreeRow,
  selectedItems: ScopeTreeRow[] | undefined,
  rootRows: ScopeTreeRow[]
): ScopeTreeRow[] => {
  let savedSelectedItems = selectedItems ? [...selectedItems] : []

  const foundItem = savedSelectedItems.find(({ id }) => id === row.id)
  const index = foundItem ? savedSelectedItems.indexOf(foundItem) : -1

  const getRowAndChildren = (parent: ScopeTreeRow): ScopeTreeRow[] => {
    const getChild: (subItem: ScopeTreeRow) => ScopeTreeRow[] = (subItem: ScopeTreeRow) => {
      if (subItem?.id === 'loading') return []

      return [
        subItem,
        ...(subItem.subItems ? subItem.subItems.map((subItem: ScopeTreeRow) => getChild(subItem)) : [])
      ].flat()
    }

    return [
      parent,
      ...(parent.subItems
        ? parent.id === 'loading'
          ? []
          : parent.subItems.map((subItem: ScopeTreeRow) => getChild(subItem))
        : [])
    ].flat()
  }

  const deleteRowAndChildren = (parent: ScopeTreeRow): ScopeTreeRow[] => {
    const elemToDelete = getRowAndChildren(parent)

    savedSelectedItems = savedSelectedItems.filter((row) => !elemToDelete.some(({ id }) => id === row.id))
    savedSelectedItems = savedSelectedItems.filter((row) => {
      // Remove if one child is not checked
      if (row.subItems && row.subItems.length > 0 && row.subItems[0].id === 'loading') {
        return true
      }
      const numberOfSubItemsSelected = row?.subItems?.filter((subItem) =>
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
  const checkIfParentIsChecked = (rows: ScopeTreeRow[]): void => {
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
        foundItem &&
        foundItem.subItems &&
        foundItem.subItems.length > 0 &&
        foundItem.subItems[0].id !== 'loading' &&
        selectedChildren.length !== foundItem.subItems.length
      ) {
        savedSelectedItems = savedSelectedItems.filter(({ id }) => id !== row.id)
      }

      // Need a real fix .. 🥲
      // // Protection:
      // // When the user select a scope, reload, select and unselect a subitems the parent have subitems = []
      // // So, replace the parent and the condition `selectedChildren.length !== foundItem.subItems.length` can be validated
      // const indexOfItem = foundItem && savedSelectedItems ? savedSelectedItems.indexOf(foundItem) : -1
      // if (indexOfItem !== -1) savedSelectedItems[indexOfItem] = row

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

export const sortByQuantityAndName = (scopeRows: ScopeTreeRow[]) => {
  // Sort by quantity
  scopeRows = scopeRows.sort((a: ScopeTreeRow, b: ScopeTreeRow) => {
    if (a.quantity > b.quantity) {
      return 1
    } else if (a.quantity < b.quantity) {
      return -1
    }
    return 0
  })
  // Sort by name
  scopeRows = scopeRows.sort((a: ScopeTreeRow, b: ScopeTreeRow) => {
    if (b.quantity === 0) return -1
    if (a.name > b.name) {
      return 1
    } else if (a.name < b.name) {
      return -1
    }
    return 0
  })
  return scopeRows
}

export const expandScopeTree = async (params: ExpandScopeElementParamsType, getState?: () => RootState) => {
  let scopesList: ScopeTreeRow[] = []
  let openPopulation: number[] = []
  if (params.scopesList && params.openPopulation) {
    scopesList = params.scopesList
    openPopulation = params.openPopulation
  } else if (getState) {
    const state = getState().scope
    scopesList = state.scopesList
    openPopulation = state.openPopulation
  }
  let _rootRows = scopesList ? [...scopesList] : []
  const savedSelectedItems = params.selectedItems ? [...params.selectedItems] : []
  let _openPopulation = openPopulation ? [...openPopulation] : []

  const index = _openPopulation.indexOf(params.rowId)
  if (index !== -1) {
    _openPopulation = _openPopulation.filter((id) => id !== params.rowId)
  } else {
    _openPopulation = [..._openPopulation, params.rowId]

    const replaceSubItems = async (items: ScopeTreeRow[], type?: ScopeType) => {
      let _items: ScopeTreeRow[] = []
      for (let item of items) {
        // Replace sub items element by response of back-end
        if (+item.id === +params.rowId) {
          const foundItem = item.subItems ? item.subItems.find((i) => i.id === 'loading') : true
          if (foundItem) {
            const subItems: ScopeTreeRow[] = await services.perimeters.getScopesWithSubItems(
              item.inferior_levels_ids,
              false,
              type,
              params.signal
            )
            item = { ...item, subItems: subItems }
          }
        } else if (item.subItems && item.subItems.length !== 0) {
          item = { ...item, subItems: await replaceSubItems(item.subItems, type) }
        }
        _items = [..._items, item]
      }
      return _items
    }

    _rootRows = await replaceSubItems(scopesList, params.type)
  }

  return {
    scopesList: _rootRows,
    selectedItems: savedSelectedItems,
    openPopulation: _openPopulation,
    aborted: params.signal?.aborted
  }
}
