import {
  buildTree,
  buildMultipleTrees,
  getDisplayFromTree,
  getDisplayFromTrees,
  getMissingCodes,
  getMissingCodesWithSystems,
  groupBySystem,
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
 * @param {(ids: string, system: string) => Promise<Hierarchy<T>[]>} fetchHandler - A callback function that returns fetched hierarchies.
 */
export const useHierarchy = <T>(
  selectedNodes: Hierarchy<T>[],
  fetchedCodes: Codes<Hierarchy<T>>,
  onCache: (codes: Codes<Hierarchy<T>>) => void,
  fetchHandler: (ids: string, system: string) => Promise<Hierarchy<T>[]>
) => {
  const [trees, setTrees] = useState<Map<string, Hierarchy<T>[]>>(new Map())
  const [hierarchies, setHierarchies] = useState<Map<string, HierarchyInfo<T>>>(new Map())
  const [searchResults, setSearchResults] = useState<HierarchyInfo<T>>(DEFAULT_HIERARCHY_INFO)
  const [selectedCodes, setSelectedCodes] = useState<Codes<Hierarchy<T>>>(
    new Map(groupBySystem(selectedNodes).map((item) => [item.system, mapHierarchyToMap(item.codes)]))
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
      system: string
      fetchBaseTree: () => Promise<Back_API_Response<Hierarchy<T>>>
    }[]
  ) => {
    const newTrees: Map<string, Hierarchy<T>[]> = new Map()
    const newHierarchies: Map<string, HierarchyInfo<T>> = new Map()
    const allCodes: Codes<Hierarchy<T>> = new Map()
    for (const handler of initHandlers) {
      const { results: baseTree, count } = await handler.fetchBaseTree()
      const currentSelected = selectedCodes.get(handler.system) || new Map()
      const toAdd = currentSelected.get(HIERARCHY_ROOT) ? new Map() : currentSelected
      const toFind = [...baseTree, ...toAdd.values()]
      const currentCodes = codes.get(handler.system) || new Map()
      const newCodes = await getMissingCodes(baseTree, currentCodes, toFind, handler.system, Mode.INIT, fetchHandler)
      const newTree = buildTree(baseTree, handler.system, toFind, newCodes, currentSelected, Mode.INIT)
      const newHierarchy = getDisplayFromTree(baseTree, newTree)
      newTrees.set(handler.system, newTree)
      newHierarchies.set(handler.system, { tree: newHierarchy, count, page: 1, system: handler.system })
      allCodes.set(handler.system, new Map([...newCodes, ...getHierarchyRootCodes(newTree)]))
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
      const bySystem = groupBySystem(endCodes)
      const newCodes = await getMissingCodesWithSystems(trees, bySystem, codes, fetchHandler)
      const newTrees = buildMultipleTrees(trees, bySystem, newCodes, selectedCodes, Mode.SEARCH)
      setCodes(newCodes)
      setTrees(newTrees)
      setLoadingStatus({ ...loadingStatus, search: LoadingStatus.SUCCESS })
      return { display: getDisplayFromTrees(endCodes, newTrees), count }
    } catch (e) {
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
    const bySystem = groupBySystem(nodes)
    const newTrees = buildMultipleTrees(trees, bySystem, codes, selectedCodes, toAdd ? Mode.SELECT : Mode.UNSELECT)
    let system = ''
    if (mode === SearchMode.EXPLORATION) {
      system = nodes?.[0].system
      const current = hierarchies.get(system) || DEFAULT_HIERARCHY_INFO
      const newHierarchy = getDisplayFromTrees(current.tree, newTrees)
      setHierarchies(replaceInMap(system, { ...current, tree: newHierarchy }, hierarchies))
    } else {
      const newSearch = getDisplayFromTrees(searchResults.tree, newTrees)
      setSearchResults({ ...searchResults, tree: newSearch })
    }
    setSelectedCodes(getSelectedCodesFromTrees(newTrees, selectedCodes, system))
    setTrees(newTrees)
  }

  const selectAll = (system: string, toAdd: boolean) => {
    const nodes = trees.get(system) || []
    const currentHierarchy = hierarchies.get(system) || DEFAULT_HIERARCHY_INFO
    const bySystem = groupBySystem(nodes)
    const mode = toAdd ? Mode.SELECT_ALL : Mode.UNSELECT_ALL
    const newTrees = buildMultipleTrees(trees, bySystem, codes, selectedCodes, mode)
    const newSearch = getDisplayFromTrees(searchResults.tree, newTrees)
    const newHierarchy = getDisplayFromTrees(currentHierarchy.tree, newTrees)
    const root = new Map()
    if (toAdd) root.set(HIERARCHY_ROOT, createHierarchyRoot(system))
    setSelectedCodes(replaceInMap(system, root, selectedCodes))
    setTrees(newTrees)
    setSearchResults({ ...searchResults, tree: newSearch })
    setHierarchies(replaceInMap(system, { ...currentHierarchy, tree: newHierarchy }, hierarchies))
  }

  const expand = async (node: Hierarchy<T>) => {
    setLoadingStatus({ ...loadingStatus, expand: LoadingStatus.FETCHING })
    const hierarchyId = node.system
    const currentTree = trees.get(hierarchyId) || []
    const currentHierarchy = hierarchies.get(hierarchyId) || DEFAULT_HIERARCHY_INFO
    const currentCodes = codes.get(hierarchyId) || new Map()
    const currentSelected = selectedCodes.get(hierarchyId) || new Map()
    const newCodes = await getMissingCodes(currentTree, currentCodes, [node], hierarchyId, Mode.EXPAND, fetchHandler)
    const newTree = buildTree(currentTree, node.system, [node], newCodes, currentSelected, Mode.EXPAND)
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
