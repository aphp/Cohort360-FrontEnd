import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Reference, SearchValueSetTab } from 'types/searchValueSet'
import { LIMIT_PER_PAGE, SearchParameters, useSearchParameters } from '../search/useSearchParameters'
import { useHierarchy } from 'hooks/hierarchy/useHierarchy'
import { getChildrenFromCodes, getHierarchyRoots, searchInValueSets } from 'services/aphp/serviceValueSets'

export const useSearchValueSet = (references: Reference[]) => {
  const researchParameters = useSearchParameters()
  const explorationParameters = useSearchParameters()
  const [mode, setMode] = useState(SearchValueSetTab.EXPLORATION)

  const fetchChildren = useCallback(
    async (ids: string, system: string) => (await getChildrenFromCodes(system, ids.split(','))).results,
    []
  )

  const onCache = useCallback(() => {}, [])
  const fetchedCodes = useMemo(() => [], [])
  const selectedNodes = useMemo(() => [], [])

  const {
    hierarchies,
    searchResults,
    selectedCodes,
    loadingStatus,
    selectAllStatus,
    //initTree,
    initTrees,
    fetchMore,
    search,
    expand,
    select,
    selectAll,
    deleteCode
  } = useHierarchy(selectedNodes, fetchedCodes, onCache, fetchChildren)

  const controllerRef = useRef<AbortController | null>(null)
  const currentHierarchy = useMemo(() => {
    const system = explorationParameters.options.references.find((ref) => ref.checked)?.url || ''
    const found = hierarchies.get(system)
    return (
      found || {
        tree: [],
        count: 0
      }
    )
  }, [hierarchies, explorationParameters.options.references])

  const fetchSearch = async (searchInput: string, page: number, references: string[]) => {
    if (references.length) {
      const results = await searchInValueSets(
        references,
        searchInput,
        page * researchParameters.options.limit,
        researchParameters.options.limit
      )
      researchParameters.onChangeCount(results.count)
      return results
    } else {
      researchParameters.onChangeCount(0)
      return { results: [], count: 0 }
    }
  }

  const fetchBaseTree = async (ref: Reference, references: Reference[]) => {
    const fetch = ref.isHierarchy
      ? () => getHierarchyRoots(ref.url, ref.title, true, ref.filterRoots)
      : () => searchInValueSets([ref.url], '', 0, LIMIT_PER_PAGE)
    try {
      return await fetch()
    } catch (error) {
      return { count: 0, results: [] }
    }
  }

  const handleInit = (references: Reference[]) => {
    const hierachyReferences = references.map((ref, index) => ({ ...ref, checked: index === 0 }))
    const initHandlers = references.map((ref) => ({
      system: ref.url,
      fetchBaseTree: () => fetchBaseTree(ref, references)
    }))
    researchParameters.onChangeReferences(references)
    explorationParameters.onChangeReferences(hierachyReferences)
    initTrees(initHandlers)
  }

  const getSearchParameter = (param: keyof SearchParameters) => {
    return mode === SearchValueSetTab.EXPLORATION
      ? explorationParameters.options[param]
      : researchParameters.options[param]
  }

  const handleChangeMode = () => {
    const newMode = mode === SearchValueSetTab.EXPLORATION ? SearchValueSetTab.RESEARCH : SearchValueSetTab.EXPLORATION
    setMode(newMode)
  }

  const handleSearch = (references: Reference[], searchInput: string, page: number) => {
    const searchInRefs = references.filter((ref) => ref.checked).map((ref) => ref.url)
    search(() => fetchSearch(searchInput, page, searchInRefs))
  }

  const handleFetchMore = (mode: SearchValueSetTab) => {
    if (mode === SearchValueSetTab.EXPLORATION) {
      const selectedReference = explorationParameters.options.references.find((ref) => ref.checked)?.url || ''
      const cb = async () =>
        (await searchInValueSets([selectedReference], '', currentHierarchy.tree.length, LIMIT_PER_PAGE)).results
      fetchMore(selectedReference, cb)
    } else {
      const references = researchParameters.options.references.filter((ref) => ref.checked).map((ref) => ref.url)
      const cb = () =>
        searchInValueSets(references, researchParameters.options.searchInput, searchResults.tree.length, LIMIT_PER_PAGE)
      search(cb)
    }
  }

  const handleChangeReferences = (references: Reference[]) => {
    if (mode === SearchValueSetTab.EXPLORATION) explorationParameters.onChangeReferences(references)
    else {
      researchParameters.onChangeReferences(references)
      handleSearch(references, researchParameters.options.searchInput, 0)
    }
  }

  const handleChangeSearchInput = (input: string) => {
    researchParameters.onChangeSearchInput(input)
    handleSearch(researchParameters.options.references, input, 0)
  }

  useEffect(() => {
    handleInit(references)
  }, [])

  return {
    selectedCodes,
    mode,
    loadingStatus,
    onChangeMode: handleChangeMode,
    parameters: {
      refs: getSearchParameter('references') as Reference[],
      searchInput: researchParameters.options.searchInput,
      onChangeSearchInput: handleChangeSearchInput,
      //onChangePage: handleChangePage,
      onChangeReferences: handleChangeReferences
    },
    hierarchy: {
      exploration: currentHierarchy,
      research: searchResults,
      expand,
      select,
      selectAll,
      deleteCode,
      onFetchMore: handleFetchMore
    }
  }
}
