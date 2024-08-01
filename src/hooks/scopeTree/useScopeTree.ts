import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Hierarchy } from 'types/hierarchy'
import { useSearchParameters } from '../search/useSearchParameters'
import { ScopeElement } from 'types'
import { SourceType, System } from 'types/scope'
import { useAppDispatch, useAppSelector } from 'state'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import { saveFetchedPerimeters, saveFetchedRights } from 'state/scope'
import { cleanNodes } from 'utils/hierarchy'
import { useHierarchy } from 'hooks/hierarchy/useHierarchy'

export const useScopeTree = (
  baseTree: Hierarchy<ScopeElement, string>[],
  selectedNodes: Hierarchy<ScopeElement, string>[],
  sourceType: SourceType
) => {
  const practitionerId = useAppSelector((state) => state.me)?.id || ''
  const codes = useAppSelector((state) =>
    sourceType === SourceType.ALL ? state.scope.codes.rights : state.scope.codes.perimeters
  )
  const {
    options: { searchInput, page, limit, count, totalPages, searchMode },
    onChangePage,
    onChangeCount,
    onChangeSearchMode,
    onChangeSearchInput
  } = useSearchParameters()
  const dispatch = useAppDispatch()

  const handleSaveCodes = useCallback((codes: Hierarchy<ScopeElement, string>[]) => {
    if (sourceType === SourceType.ALL) dispatch(saveFetchedRights(cleanNodes(codes)))
    else dispatch(saveFetchedPerimeters(cleanNodes(codes)))
  }, [])

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

  const {
    hierarchies,
    list,
    selectedCodes,
    loadingStatus,
    selectAllStatus,
    initTree,
    search,
    expand,
    select,
    selectAll,
    deleteCode
  } = useHierarchy(selectedNodes, codes, handleSaveCodes, fetchChildren)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    initTree(System.ScopeTree, async () => baseTree)
  }, [baseTree])

  const currentHierarchy = useMemo(() => {
    const found = hierarchies.get(System.ScopeTree)
    if (found) return found
    return []
  }, [hierarchies])

  useEffect(() => {
    search(searchInput, page, fetchSearch)
  }, [page])

  useEffect(() => {
    onChangePage(0)
    onChangeSearchMode(searchInput !== '')
    if (searchInput === '') onChangeCount(baseTree.length)
    search(searchInput, 0, fetchSearch)
  }, [searchInput])

  const fetchSearch = useCallback(
    async (search: string, page: number) => {
      const { results, count } =
        sourceType === SourceType.ALL
          ? await servicesPerimeters.getRights({
              practitionerId,
              search,
              page,
              limit: limit,
              sourceType
            })
          : await servicesPerimeters.getPerimeters({
              practitionerId,
              search,
              page,
              limit: limit,
              sourceType
            })
      onChangeCount(count)
      return results
    },
    [practitionerId, sourceType]
  )

  return {
    hierarchyData: {
      list,
      hierarchy: currentHierarchy,
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
      page,
      searchInput,
      searchMode,
      totalPages
    },
    parametersActions: {
      onChangePage,
      onChangeSearchInput
    }
  }
}
