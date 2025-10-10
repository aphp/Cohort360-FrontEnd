import {
  buildTree,
  buildMultipleTrees,
  getDisplayFromTree,
  getDisplayFromTrees,
  getMissingCodes,
  getMissingCodesWithValueSets,
  groupByValueSet,
  getHierarchyRootCodes,
  mapHierarchyToMap,
  getSelectedCodesFromTrees,
  createHierarchyRoot,
  DEFAULT_HIERARCHY_INFO
} from '../../utils/hierarchy'
import { useEffect, useRef, useState } from 'react'
import { Back_API_Response, LoadingStatus } from 'types'
import { Codes, Hierarchy, HierarchyInfo, HierarchyLoadingStatus, Mode, SearchMode } from '../../types/hierarchy'
import { replaceInMap } from 'utils/map'
import { HIERARCHY_ROOT } from 'services/aphp/serviceValueSets'
/**
 * @param {Hierarchy<T>[]} selectedNodes - Nodes selected in the hierarchy.
 * @param {Codes<Hierarchy<T>>} fetchedCodes - All the codes that have already been fetched and saved.
 * @param {(codes: Hierarchy<T>[]) => void} onCache - A cache function to store the codes you fetch in the useHierarchy hook.
 * @param {(ids: string, valueSetUrl: string) => Promise<Hierarchy<T>[]>} fetchHandler - A callback function that returns fetched hierarchies.
 */
export const useHierarchy = <T>(
  selectedNodes: Hierarchy<T>[],
  fetchedCodes: Codes<Hierarchy<T>>,
  onCache: (codes: Codes<Hierarchy<T>>) => void,
  fetchHandler: (ids: string, valueSetUrl: string) => Promise<Hierarchy<T>[]>
) => {
  const [trees, setTrees] = useState<Map<string, Hierarchy<T>[]>>(new Map())
  const [hierarchies, setHierarchies] = useState<Map<string, HierarchyInfo<T>>>(new Map())
  const [searchResults, setSearchResults] = useState<HierarchyInfo<T>>(DEFAULT_HIERARCHY_INFO)
  const [selectedCodes, setSelectedCodes] = useState<Codes<Hierarchy<T>>>(
    new Map(groupByValueSet(selectedNodes).map((item) => [item.valueSetUrl, mapHierarchyToMap(item.codes)]))
  )
  const [codes, setCodes] = useState<Codes<Hierarchy<T>>>(fetchedCodes)

  const latestCodes = useRef(codes)
  const [loadingStatus, setLoadingStatus] = useState<HierarchyLoadingStatus>({
    init: LoadingStatus.FETCHING,
    search: LoadingStatus.SUCCESS,
    expand: LoadingStatus.SUCCESS
  })
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    latestCodes.current = codes
  }, [codes])

  useEffect(() => {
    return () => onCache(latestCodes.current)
  }, [])

  const initTrees = async (
    initHandlers: {
      valueSetUrl: string
      fetchBaseTree: () => Promise<Back_API_Response<Hierarchy<T>>>
    }[]
  ) => {
    const newTrees: Map<string, Hierarchy<T>[]> = new Map()
    const newHierarchies: Map<string, HierarchyInfo<T>> = new Map()
    const allCodes: Codes<Hierarchy<T>> = new Map()
    for (const handler of initHandlers) {
      const { results: baseTree, count } = await handler.fetchBaseTree()
      const currentSelected = selectedCodes.get(handler.valueSetUrl) || new Map()
      const toAdd = currentSelected.get(HIERARCHY_ROOT) ? new Map() : currentSelected
      const toFind = [...baseTree, ...toAdd.values()]
      const currentCodes = codes.get(handler.valueSetUrl) || new Map()
      const newCodes = await getMissingCodes(
        baseTree,
        currentCodes,
        toFind,
        handler.valueSetUrl,
        Mode.INIT,
        fetchHandler
      )
      const newTree = buildTree(baseTree, handler.valueSetUrl, toFind, newCodes, currentSelected, Mode.INIT)
      const newHierarchy = getDisplayFromTree(baseTree, newTree)
      newTrees.set(handler.valueSetUrl, newTree)
      newHierarchies.set(handler.valueSetUrl, { tree: newHierarchy, count, page: 1, system: handler.valueSetUrl })
      allCodes.set(handler.valueSetUrl, new Map([...newCodes, ...getHierarchyRootCodes(newTree)]))
    }
    setTrees(newTrees)
    setHierarchies(newHierarchies)
    setCodes(allCodes)
    setLoadingStatus((prevLoadingStatus) => ({ ...prevLoadingStatus, init: LoadingStatus.SUCCESS }))
  }

  const search = async (fetchSearch: () => Promise<Back_API_Response<Hierarchy<T>>>) => {
    setLoadingStatus({ ...loadingStatus, search: LoadingStatus.FETCHING })
    try {
      const { results: endCodes, count } = await fetchSearch()
      const byValueSet = groupByValueSet(endCodes)
      const newCodes = await getMissingCodesWithValueSets(trees, byValueSet, codes, fetchHandler)
      const newTrees = buildMultipleTrees(trees, byValueSet, newCodes, selectedCodes, Mode.SEARCH)
      setCodes(newCodes)
      setTrees(newTrees)
      setLoadingStatus({ ...loadingStatus, search: LoadingStatus.SUCCESS })
      return { display: getDisplayFromTrees(endCodes, newTrees), count }
    } catch (e) {
      console.error(e)
      return {
        display: [],
        count: 0
      }
    }
  }

  const fetchMore = async (
    fetchSearch: () => Promise<Back_API_Response<Hierarchy<T>>>,
    page: number,
    mode: SearchMode,
    id?: string
  ) => {
    const { display, count } = await search(fetchSearch)

    const cleaned = display.filter((e) => e)
    if (display.length !== cleaned.length) setHasError(true)
    else setHasError(false)
    if (mode == SearchMode.EXPLORATION && id) {
      const currentHierarchy = hierarchies.get(id) || DEFAULT_HIERARCHY_INFO
      setHierarchies(replaceInMap(id, { ...currentHierarchy, tree: cleaned, page }, hierarchies))
    } else setSearchResults({ tree: cleaned, count, page, system: '' })
  }

  const select = (nodes: Hierarchy<T>[], toAdd: boolean, mode: SearchMode.EXPLORATION | SearchMode.RESEARCH) => {
    const byValueSet = groupByValueSet(nodes)
    const newTrees = buildMultipleTrees(trees, byValueSet, codes, selectedCodes, toAdd ? Mode.SELECT : Mode.UNSELECT)
    let valueSetUrl = ''
    if (mode === SearchMode.EXPLORATION) {
      valueSetUrl = nodes?.[0].valueSetUrl || nodes?.[0].system || ''
      const current = hierarchies.get(valueSetUrl) || DEFAULT_HIERARCHY_INFO
      const newHierarchy = getDisplayFromTrees(current.tree, newTrees)
      setHierarchies(replaceInMap(valueSetUrl, { ...current, tree: newHierarchy }, hierarchies))
    } else {
      const newSearch = getDisplayFromTrees(searchResults.tree, newTrees)
      setSearchResults({ ...searchResults, tree: newSearch })
    }
    setSelectedCodes(getSelectedCodesFromTrees(newTrees, selectedCodes, valueSetUrl))
    setTrees(newTrees)
  }

  const selectAll = (valueSetUrl: string, toAdd: boolean) => {
    const nodes = trees.get(valueSetUrl) || []
    const currentHierarchy = hierarchies.get(valueSetUrl) || DEFAULT_HIERARCHY_INFO
    const byValueSet = groupByValueSet(nodes)
    const mode = toAdd ? Mode.SELECT_ALL : Mode.UNSELECT_ALL
    const newTrees = buildMultipleTrees(trees, byValueSet, codes, selectedCodes, mode)
    const newSearch = getDisplayFromTrees(searchResults.tree, newTrees)
    const newHierarchy = getDisplayFromTrees(currentHierarchy.tree, newTrees)
    const root = new Map()
    if (toAdd) root.set(HIERARCHY_ROOT, createHierarchyRoot(valueSetUrl))
    setSelectedCodes(replaceInMap(valueSetUrl, root, selectedCodes))
    setTrees(newTrees)
    setSearchResults({ ...searchResults, tree: newSearch })
    setHierarchies(replaceInMap(valueSetUrl, { ...currentHierarchy, tree: newHierarchy }, hierarchies))
  }

  const expand = async (node: Hierarchy<T>) => {
    setLoadingStatus({ ...loadingStatus, expand: LoadingStatus.FETCHING })
    const hierarchyId = node.valueSetUrl || node.system || ''

    const currentTree = trees.get(hierarchyId) || []
    const currentHierarchy = hierarchies.get(hierarchyId) || DEFAULT_HIERARCHY_INFO
    const currentCodes = codes.get(hierarchyId) || new Map()
    const currentSelected = selectedCodes.get(hierarchyId) || new Map()
    const newCodes = await getMissingCodes(currentTree, currentCodes, [node], hierarchyId, Mode.EXPAND, fetchHandler)
    const newTree = buildTree(currentTree, hierarchyId, [node], newCodes, currentSelected, Mode.EXPAND)
    const newHierarchy = getDisplayFromTree(currentHierarchy.tree, newTree)
    setCodes(replaceInMap(hierarchyId, newCodes, codes))
    setTrees(replaceInMap(hierarchyId, newTree, trees))
    setHierarchies(replaceInMap(hierarchyId, { ...currentHierarchy, tree: newHierarchy }, hierarchies))
    setLoadingStatus({ ...loadingStatus, search: LoadingStatus.SUCCESS })
  }

  return {
    trees,
    hierarchies,
    searchResults,
    selectedCodes,
    loadingStatus,
    hasError,
    initTrees,
    select,
    selectAll,
    expand,
    fetchMore
  }
}
