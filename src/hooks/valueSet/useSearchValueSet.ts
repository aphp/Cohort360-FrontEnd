import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FhirItem, Reference, ValueSetSorting } from 'types/valueSet'
import { LIMIT_PER_PAGE, SearchParameters, useSearchParameters } from '../search/useSearchParameters'
import { useHierarchy } from 'hooks/hierarchy/useHierarchy'
import {
  HIERARCHY_ROOT,
  getChildrenFromCodes,
  getHierarchyRoots,
  searchInValueSets
} from 'services/aphp/serviceValueSets'
import { useDebounceAction } from 'hooks/useDebounceAction'
import { Codes, Hierarchy, SearchMode } from 'types/hierarchy'
import { saveValueSets, selectValueSetCodes } from 'state/valueSets'
import { useAppDispatch, useAppSelector } from 'state'
import { DEFAULT_HIERARCHY_INFO, getItemSelectedStatus, mapCodesToCache } from 'utils/hierarchy'
import { LoadingStatus } from 'types'
import { cancelPendingRequest } from 'utils/abortController'

export const useSearchValueSet = (references: Reference[], selectedNodes: Hierarchy<FhirItem, string>[]) => {
  const researchParameters = useSearchParameters()
  const explorationParameters = useSearchParameters()
  const [searchInput, setSearchInput] = useState('')
  const [mode, setMode] = useState(SearchMode.EXPLORATION)
  const [initialized, setInitialized] = useState({ exploration: false, research: false })
  const [currentSorting, setCurrentSorting] = useState<ValueSetSorting | undefined>(undefined)
  const dispatch = useAppDispatch()
  const controllerRef = useRef<AbortController | null>(null)

  const fetchChildren = useCallback(
    async (ids: string, valueSetUrl: string) => (await getChildrenFromCodes(valueSetUrl, ids.split(','))).results,
    []
  )

  const handleSaveCodes = useCallback((codes: Codes<Hierarchy<FhirItem>>) => {
    const entities = mapCodesToCache(codes)
    dispatch(saveValueSets(entities))
  }, [])

  const urls = useMemo(() => {
    return references.map((ref) => ref.url)
  }, [references])

  const codes = useAppSelector((state) => selectValueSetCodes(state, urls))

  const {
    hierarchies,
    searchResults,
    selectedCodes,
    loadingStatus,
    hasError,
    initTrees,
    fetchMore,
    expand,
    select,
    selectAll
  } = useHierarchy(selectedNodes, codes, handleSaveCodes, fetchChildren)

  const currentHierarchy = useMemo(() => {
    const ref = explorationParameters.options.references.find((ref) => ref.checked)
    return hierarchies.get(ref?.url ?? '') ?? DEFAULT_HIERARCHY_INFO
  }, [hierarchies, explorationParameters.options.references])

  const selectAllStatus = useMemo(() => {
    const node = {
      id: 'parent',
      subItems: mode === SearchMode.EXPLORATION ? currentHierarchy.tree : searchResults.tree
    } as Hierarchy<FhirItem, string>
    return getItemSelectedStatus(node)
  }, [currentHierarchy, searchResults, mode])

  const isSelectionDisabled = useCallback(
    (node: Hierarchy<FhirItem>) => {
      const nodeKey = node.valueSetUrl || node.system
      const isAll = selectedCodes.get(nodeKey)?.get(HIERARCHY_ROOT)
      if (mode === SearchMode.RESEARCH && isAll) return true
      else {
        const ref = explorationParameters.options.references.find((ref) => ref.checked)
        if (ref && !ref.isHierarchy && isAll) return true
      }
      return false
    },
    [explorationParameters.options.references, mode, selectedCodes]
  )

  const selected = useMemo(() => {
    return [...selectedCodes.values()].flatMap((innerMap) => [...innerMap.values()])
  }, [selectedCodes])

  const fetchSearch = async (searchInput: string, page: number, references: string[], sorting?: ValueSetSorting) => {
    if (references.length) {
      if (loadingStatus.search === LoadingStatus.FETCHING)
        controllerRef.current = cancelPendingRequest(controllerRef.current)
      return await searchInValueSets(
        references,
        searchInput,
        page * LIMIT_PER_PAGE,
        LIMIT_PER_PAGE,
        sorting || currentSorting,
        controllerRef.current?.signal
      )
    } else return { results: [], count: 0 }
  }

  const fetchBaseTree = async (ref: Reference) => {
    const fetch = ref.isHierarchy
      ? () => getHierarchyRoots(ref.url, ref.title, ref.filterRoots)
      : () => searchInValueSets([ref.url], '', 0, LIMIT_PER_PAGE, undefined)
    try {
      return await fetch()
    } catch (error) {
      return { count: 0, results: [] }
    }
  }

  const initExploration = (references: Reference[]) => {
    const hierachyReferences = references.map((ref, index) => ({ ...ref, checked: index === 0 }))
    const initHandlers = references.map((ref) => ({
      valueSetUrl: ref.url,
      fetchBaseTree: () => fetchBaseTree(ref)
    }))
    explorationParameters.onChangeReferences(hierachyReferences)
    setInitialized({ ...initialized, exploration: true })
    initTrees(initHandlers)
  }

  const initResearch = (references: Reference[]) => {
    researchParameters.onChangeReferences(references)
    const searchRefs = references.map((ref) => ref.url)
    const searchCb = () => fetchSearch('', 0, searchRefs)
    setInitialized({ ...initialized, research: true })
    fetchMore(searchCb, 1, SearchMode.RESEARCH)
  }

  const getSearchParameter = (param: keyof SearchParameters) => {
    return mode === SearchMode.EXPLORATION ? explorationParameters.options[param] : researchParameters.options[param]
  }

  const handleDeleteSelectedCodes = (code: Hierarchy<FhirItem>) => {
    const isRoot = code.id === HIERARCHY_ROOT
    const codeKey = code.valueSetUrl || code.system
    if (isRoot) selectAll(codeKey, false)
    else select([code], false, SearchMode.EXPLORATION)
  }

  const handleChangeReferences = (references: Reference[]) => {
    if (mode === SearchMode.EXPLORATION) explorationParameters.onChangeReferences(references)
    else {
      researchParameters.onChangeReferences(references)
      const refs = references.filter((ref) => ref.checked).map((ref) => ref.url)
      fetchMore(() => fetchSearch(searchInput, 0, refs), 1, mode)
    }
  }

  const search = (newSearchInput: string) => {
    const refs = researchParameters.options.references.filter((ref) => ref.checked).map((ref) => ref.url)
    fetchMore(() => fetchSearch(newSearchInput, 0, refs), 1, SearchMode.RESEARCH)
  }

  const handleChangePage = (page: number) => {
    const refs =
      mode === SearchMode.EXPLORATION
        ? explorationParameters.options.references.filter((ref) => ref.checked).map((ref) => ref.url)
        : researchParameters.options.references.filter((ref) => ref.checked).map((ref) => ref.url)
    const input = mode === SearchMode.EXPLORATION ? '' : searchInput
    fetchMore(() => fetchSearch(input, page - 1, refs), page, mode, refs?.[0])
  }

  const debouncedSearch = useDebounceAction(search, 500)
  const handleChangeSearchInput = (newInput: string) => {
    setSearchInput(newInput)
    debouncedSearch(newInput)
  }

  const handleSort = (sorting: ValueSetSorting) => {
    setCurrentSorting(sorting)
    const refs = researchParameters.options.references.filter((ref) => ref.checked).map((ref) => ref.url)
    fetchMore(() => fetchSearch(searchInput, 0, refs, sorting), 1, SearchMode.RESEARCH)
  }

  useEffect(() => {
    if (mode === SearchMode.EXPLORATION && !initialized.exploration) initExploration(references)
    if (mode === SearchMode.RESEARCH && !initialized.research) initResearch(references)
  }, [mode])

  return {
    selectedCodes: selected,
    isSelectionDisabled,
    mode,
    loadingStatus,
    searchInput,
    onChangeMode: setMode,
    onDelete: handleDeleteSelectedCodes,
    onSort: handleSort,
    parameters: {
      refs: getSearchParameter('references') as Reference[],
      onChangeSearchInput: handleChangeSearchInput,
      onChangePage: handleChangePage,
      onChangeReferences: handleChangeReferences
    },
    hierarchy: {
      hasError,
      exploration: currentHierarchy,
      research: searchResults,
      selectAllStatus,
      expand,
      select,
      selectAll
    }
  }
}
