import { ExpandScopeElementParamsType, ScopeTreeRow, ScopeType } from 'types'
import services from 'services/aphp'
import { RootState } from 'state'

export const LOADING: ScopeTreeRow = { id: 'loading', name: 'loading', quantity: 0, subItems: [] }

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
              params.isExecutiveUnit,
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

    _rootRows = await replaceSubItems(scopesList, params.executiveUnitType)
  }

  return {
    scopesList: _rootRows,
    selectedItems: savedSelectedItems,
    openPopulation: _openPopulation,
    aborted: params.signal?.aborted
  }
}
