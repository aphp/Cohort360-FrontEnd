import { useCallback, useEffect, useMemo, useState } from 'react'
import { Codes, Hierarchy, Mode, SearchMode } from 'types/hierarchy'
import { LIMIT_PER_PAGE } from '../search/useSearchParameters'
import { ScopeElement, SourceType, System } from 'types/scope'
import { useAppDispatch, useAppSelector } from 'state'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import { saveScopeCodes, selectScopeCodes } from 'state/scope'
import { useHierarchy } from 'hooks/hierarchy/useHierarchy'
import { DEFAULT_HIERARCHY_INFO, getItemSelectedStatus, mapCodesToCache } from 'utils/hierarchy'

export const useScopeTree = (
  baseTree: Hierarchy<ScopeElement>[],
  selectedNodes: Hierarchy<ScopeElement>[],
  sourceType: SourceType
) => {
  const practitionerId = useAppSelector((state) => state.me)?.id ?? ''
  const codes = useAppSelector((state) => selectScopeCodes(state, sourceType === SourceType.ALL))
  const dispatch = useAppDispatch()
  const [searchInput, setSearchInput] = useState('')
  const [mode, setMode] = useState(SearchMode.EXPLORATION)

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

  const handleSaveCodes = (codes: Codes<Hierarchy<ScopeElement>>) => {
    const entity = mapCodesToCache(codes)?.[0]
    dispatch(saveScopeCodes({ isRights: sourceType === SourceType.ALL, values: entity }))
  }

  const { trees, hierarchies, searchResults, selectedCodes, loadingStatus, initTrees, fetchMore, expand, select } =
    useHierarchy(selectedNodes, codes, handleSaveCodes, fetchChildren)

  useEffect(() => {
    initTrees([
      { system: System.ScopeTree, fetchBaseTree: async () => ({ results: baseTree, count: baseTree.length }) }
    ])
  }, [baseTree])

  const current = useMemo(() => {
    const current =
      mode === SearchMode.EXPLORATION ? hierarchies.get(System.ScopeTree) || DEFAULT_HIERARCHY_INFO : searchResults
    return current
  }, [mode, hierarchies, searchResults])

  const selectAllStatus = useMemo(() => {
    const subItems = mode === SearchMode.RESEARCH ? searchResults.tree : trees.get(System.ScopeTree)
    const node = {
      id: 'parent',
      subItems
    } as Hierarchy<ScopeElement>
    return getItemSelectedStatus(node)
  }, [trees, mode])

  const selected: Hierarchy<ScopeElement>[] = useMemo(() => {
    return [...(selectedCodes.get(System.ScopeTree) || new Map()).values()]
  }, [selectedCodes])

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

  const handleSelect = (type: Mode.SELECT | Mode.SELECT_ALL, toAdd: boolean, codes: Hierarchy<ScopeElement>[] = []) => {
    if (type === Mode.SELECT_ALL) codes = trees.get(System.ScopeTree) || []
    select(codes, toAdd, mode)
  }

  return {
    hierarchyData: {
      hierarchy: current,
      loadingStatus,
      selectAllStatus,
      selectedCodes: selected
    },
    hierarchyActions: {
      expand,
      select: handleSelect
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
