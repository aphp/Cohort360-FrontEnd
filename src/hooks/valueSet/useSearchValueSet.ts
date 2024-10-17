import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Reference, SearchMode } from 'types/searchValueSet'
import { LIMIT_PER_PAGE, SearchParameters, useSearchParameters } from '../search/useSearchParameters'
import { useHierarchy } from 'hooks/hierarchy/useHierarchy'
import { getChildrenFromCodes, getHierarchyRoots, searchInValueSets } from 'services/aphp/serviceValueSets'
import { useDebounceAction } from 'hooks/useDebounceAction'
import { Codes, FhirItem, Hierarchy } from 'types/hierarchy'
import { saveValueSets, selectValueSetCodes } from 'state/valueSets'
import { useAppDispatch, useAppSelector } from 'state'
import { mapCodesToCache } from 'utils/hierarchy/hierarchy'

export const useSearchValueSet = (references: Reference[]) => {
  const researchParameters = useSearchParameters()
  const explorationParameters = useSearchParameters()
  const [searchInput, setSearchInput] = useState('')
  const [mode, setMode] = useState(SearchMode.EXPLORATION)
  const [initialized, setInitialized] = useState({ exploration: false, research: false })
  const dispatch = useAppDispatch()

  const fetchChildren = useCallback(
    async (ids: string, system: string) => (await getChildrenFromCodes(system, ids.split(','))).results,
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
  const selectedNodes = useMemo(() => [], [])

  useEffect(() => console.log('test store', codes), [codes])

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

  const controllerRef = useRef<AbortController | null>(null)
  const currentHierarchy = useMemo(() => {
    const system = explorationParameters.options.references.find((ref) => ref.checked)?.url || ''
    const found = hierarchies.get(system)
    return (
      found || {
        tree: [],
        count: 0,
        page: 1
      }
    )
  }, [hierarchies, explorationParameters.options.references])

  const fetchSearch = async (searchInput: string, page: number, references: string[]) => {
    if (references.length) {
      return await searchInValueSets(references, searchInput, page * LIMIT_PER_PAGE, LIMIT_PER_PAGE)
    } else return { results: [], count: 0 }
  }

  const fetchBaseTree = async (ref: Reference) => {
    const fetch = ref.isHierarchy
      ? () => getHierarchyRoots(ref.url, ref.title, true, ref.filterRoots)
      : () => searchInValueSets([ref.url], '', 0, LIMIT_PER_PAGE)
    try {
      return await fetch()
    } catch (error) {
      return { count: 0, results: [] }
    }
  }

  const initExploration = (references: Reference[]) => {
    const hierachyReferences = references.map((ref, index) => ({ ...ref, checked: index === 0 }))
    const initHandlers = references.map((ref) => ({
      system: ref.url,
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

  useEffect(() => {
    console.log("test hierarchy", hierarchies)
    if (mode === SearchMode.EXPLORATION && !initialized.exploration) initExploration(references)
    if (mode === SearchMode.RESEARCH && !initialized.research) initResearch(references)
  }, [mode])

  return {
    selectedCodes,
    mode,
    loadingStatus,
    searchInput,
    onChangeMode: setMode,
    parameters: {
      refs: getSearchParameter('references') as Reference[],
      onChangeSearchInput: handleChangeSearchInput,
      onChangePage: handleChangePage,
      onChangeReferences: handleChangeReferences
    },
    hierarchy: {
      exploration: currentHierarchy,
      research: searchResults,
      selectAllStatus,
      expand,
      select,
      selectAll,
      deleteCode
    }
  }
}
