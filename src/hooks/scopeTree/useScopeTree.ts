import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Codes, Hierarchy } from 'types/hierarchy'
import { LIMIT_PER_PAGE } from '../search/useSearchParameters'
import { ScopeElement } from 'types'
import { SourceType, System } from 'types/scope'
import { useAppDispatch, useAppSelector } from 'state'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import { saveScopeCodes, selectScopeCodes } from 'state/scope'
import { useHierarchy } from 'hooks/hierarchy/useHierarchy'
import { SearchMode } from 'types/searchValueSet'
import { mapCodesToCache } from 'utils/hierarchy/hierarchy'

export const useScopeTree = (
  baseTree: Hierarchy<ScopeElement, string>[],
  selectedNodes: Hierarchy<ScopeElement, string>[],
  sourceType: SourceType
) => {
  const practitionerId = useAppSelector((state) => state.me)?.id || ''
  const codes = useAppSelector((state) => selectScopeCodes(state, sourceType === SourceType.ALL))
  const controllerRef = useRef<AbortController | null>(null)
  const dispatch = useAppDispatch()
  const [searchInput, setSearchInput] = useState('')
  const [mode, setMode] = useState(SearchMode.EXPLORATION)

  useEffect(() => {
    codes.forEach((innerMap, outerKey) => {
      innerMap.forEach((hier) => {
        if (hier.subItems) console.log('test subs', hier.id, hier.name)
      })
    })
    console.log('test store', codes)
  }, [codes])

  const fetchChildren = useCallback(
    async (ids: string) => {
      const { results } =
        sourceType === SourceType.ALL
          ? await servicesPerimeters.getRights({ practitionerId, ids, limit: -1, sourceType })
          : await servicesPerimeters.getPerimeters({ practitionerId, ids, limit: -1, sourceType })
      return results
    },
    [practitionerId, sourceType]
  )

  const fetchSearch = async (search: string, page: number) => {
    const options = { practitionerId, search, page, limit: LIMIT_PER_PAGE, sourceType }
    const results =
      sourceType === SourceType.ALL
        ? await servicesPerimeters.getRights(options)
        : await servicesPerimeters.getPerimeters(options)
    return results
  }

  const handleSaveCodes = useCallback((codes: Codes<Hierarchy<ScopeElement>>) => {
    const entity = mapCodesToCache(codes)?.[0]
    dispatch(saveScopeCodes({ isRights: sourceType === SourceType.ALL, values: entity }))
  }, [])

  const {
    hierarchies,
    searchResults,
    selectedCodes,
    loadingStatus,
    selectAllStatus,
    initTrees,
    fetchMore,
    expand,
    select,
    selectAll,
    deleteCode
  } = useHierarchy(selectedNodes, codes, handleSaveCodes, fetchChildren)

  useEffect(() => {
    console.log('test baseTree', baseTree)
    initTrees([
      { system: System.ScopeTree, fetchBaseTree: async () => ({ results: baseTree, count: baseTree.length }) }
    ])
  }, [baseTree])

  const current = useMemo(() => {
    const found = mode === SearchMode.EXPLORATION ? hierarchies.get(System.ScopeTree) : searchResults
    return (
      found || {
        tree: [],
        count: 0,
        page: 1
      }
    )
  }, [mode, hierarchies, searchResults])

  const handleChangePage = (page: number) => {
    fetchMore(() => fetchSearch(searchInput, page - 1), page, SearchMode.RESEARCH)
  }

  const handleChangeSearchInput = (newSearchInput: string) => {
    setSearchInput(newSearchInput)
    if (newSearchInput === '') setMode(SearchMode.EXPLORATION)
    else {
      setMode(SearchMode.RESEARCH)
      fetchMore(() => fetchSearch(newSearchInput, 0), 1, SearchMode.RESEARCH)
    }
  }

  return {
    hierarchyData: {
      hierarchy: current,
      loadingStatus,
      selectAllStatus,
      selectedCodes
    },
    hierarchyActions: {
      expand,
      select,
      selectAll,
      deleteCode
    },
    parametersData: {
      searchInput,
      mode
    },
    parametersActions: {
      onChangePage: handleChangePage,
      onChangeSearchInput: handleChangeSearchInput
    }
  }
}
