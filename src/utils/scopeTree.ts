import services from 'services/aphp'
import { RootState } from 'state'
import {
  ExpandScopeElementParamsType,
  ScopeElement,
  ScopeListType,
  ReadRightPerimeter,
  ScopeTreeRow,
  ScopeType
} from 'types'

export const buildScopeList = (
  oldScopeList: ScopeListType,
  newScopes: ScopeTreeRow[],
  isExecutiveUnit?: boolean
): ScopeListType => {
  const newScopeList: ScopeListType = {
    perimeters: isExecutiveUnit ? oldScopeList.perimeters : newScopes,
    executiveUnits: isExecutiveUnit ? newScopes : oldScopeList.executiveUnits
  }
  return newScopeList
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
  let oldScopeList: ScopeListType = { perimeters: [], executiveUnits: [] }
  if (params.scopesList && params.openPopulation) {
    oldScopeList = params.scopesList
    scopesList = getCurrentScopeList(oldScopeList, params.isExecutiveUnit)
    openPopulation = params.openPopulation
  } else if (getState) {
    const state = getState().scope
    oldScopeList = state.scopesList
    scopesList = getCurrentScopeList(oldScopeList, params.isExecutiveUnit)
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
    scopesList: buildScopeList(oldScopeList, _rootRows, params.isExecutiveUnit),
    selectedItems: savedSelectedItems,
    openPopulation: _openPopulation,
    aborted: params.signal?.aborted
  }
}

/**
 * @description : returns either the executiveUnits field or the perimeters field.
 * @param scopeList : the object containing the executiveUnits and perimeters.
 * @param isExecutiveUnit : indicates which field should be returned.
 * @returns if true then returns executiveUnits else returns perimeters.
 */
export const getCurrentScopeList = (scopeList: ScopeListType, isExecutiveUnit?: boolean): ScopeTreeRow[] => {
  return isExecutiveUnit ? scopeList.executiveUnits : scopeList.perimeters
}

/**
 * @description : build an object of perimeters and executive units. It converts a ScopeTreeRow[] to ScopeListType.
 * @param scopes : scope tree list to be used.
 * @param isExecutiveUnit : if true then the {scopes} param is a list of perimeters else it is a list of executive units.
 * @returns : an object of ScopeListType (having {perimeters} and {executiveUnits} fields).
 */
export const buildScopeListType = (scopes: ScopeTreeRow[], isExecutiveUnit?: boolean): ScopeListType => {
  const newScopeList: ScopeListType = {
    perimeters: !isExecutiveUnit ? scopes : [],
    executiveUnits: isExecutiveUnit ? scopes : []
  }
  return newScopeList
}

export const removeSpace = (scope: ScopeElement) => {
  return {
    ...scope,
    cohort_id: scope.cohort_id?.replace(/\s/g, ''),
    above_levels_ids: scope.above_levels_ids?.replace(/\s/g, ''),
    inferior_levels_ids: scope.inferior_levels_ids?.replace(/\s/g, ''),
    parent_id: scope.parent_id?.replace(/\s/g, '') ?? null
  }
}
