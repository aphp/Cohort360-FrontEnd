import {
  buildTree,
  buildMultipleTrees,
  getHierarchyDisplay,
  getItemSelectedStatus,
  getListDisplay,
  getMissingCodes,
  getMissingCodesWithSystems,
  groupBySystem,
  mapHierarchyToMap
} from '../../utils/hierarchy/hierarchy'
import { useEffect, useRef, useState } from 'react'
import { Back_API_Response, LoadingStatus, SelectedStatus } from 'types'
import { getSelectedCodes } from 'utils/hierarchy/hierarchy'
import { CodeKey, Hierarchy, HierarchyInfo, HierarchyLoadingStatus, Mode } from '../../types/hierarchy'
import { removeElement } from 'utils/arrays'
import { replaceInMap } from 'utils/map'
import { SearchMode } from 'types/searchValueSet'
/**
 * @param {Hierarchy<T>[]} selectedNodes - Nodes selected in the hierarchy.
 * @param {Hierarchy<T>[]} fetchedCodes - All the codes that have already been fetched and saved.
 * @param {(codes: Hierarchy<T>[]) => void} onCache - A cache function to store the codes you fetch in the useHierarchy hook.
 * @param {(ids: string, system: string) => Promise<Hierarchy<T>[]>} fetchHandler - A callback function that returns fetched hierarchies.
 */
export const useHierarchy = <T>(
  selectedNodes: Hierarchy<T>[],
  fetchedCodes: Hierarchy<T>[],
  onCache: (codes: Hierarchy<T>[]) => void,
  fetchHandler: (ids: string, system: string) => Promise<Hierarchy<T>[]>
) => {
  const [trees, setTrees] = useState<Map<string, Hierarchy<T>[]>>(new Map())
  const [hierarchies, setHierarchies] = useState<Map<string, HierarchyInfo<T>>>(new Map())
  const [searchResults, setSearchResults] = useState<HierarchyInfo<T>>({ tree: [], count: 0 })
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<T>[]>(selectedNodes)
  const [codes, setCodes] = useState<Map<CodeKey, Hierarchy<T>>>(
    mapHierarchyToMap(fetchedCodes.map((code) => ({ ...code, subItems: undefined })))
  )
  const latestCodes = useRef(codes)
  const [loadingStatus, setLoadingStatus] = useState<HierarchyLoadingStatus>({
    init: LoadingStatus.FETCHING,
    search: LoadingStatus.SUCCESS,
    expand: LoadingStatus.SUCCESS
  })
  const [selectAllStatus, setSelectAllStatus] = useState(SelectedStatus.NOT_SELECTED)

  useEffect(() => {
    latestCodes.current = codes
  }, [codes])

  useEffect(() => {
    return () => onCache(Array.from(latestCodes.current.values()))
  }, [])

  const initTrees = async (
    initHandlers: { system: string; fetchBaseTree: () => Promise<Back_API_Response<Hierarchy<T>>> }[]
  ) => {
    const newTrees: Map<string, Hierarchy<T>[]> = new Map()
    const newHierarchies: Map<string, HierarchyInfo<T>> = new Map()
    let newCodes: Map<CodeKey, Hierarchy<T>> = new Map()
    for (const handler of initHandlers) {
      const { results: baseTree, count } = await handler.fetchBaseTree()
      const prevCodes = [...baseTree, ...selectedCodes]
      newCodes = new Map([
        ...newCodes,
        ...(await getMissingCodes(baseTree, codes, prevCodes, handler.system, Mode.INIT, fetchHandler))
      ])
      const newTree = buildTree(baseTree, handler.system, prevCodes, newCodes, selectedCodes, Mode.INIT)
      const newHierarchyTree = getHierarchyDisplay(baseTree, newTree)
      newTrees.set(handler.system, newTree)
      newHierarchies.set(handler.system, { tree: newHierarchyTree, count })
    }
    setTrees(newTrees)
    setHierarchies(newHierarchies)
    setCodes(newCodes)
    setLoadingStatus((prevLoadingStatus) => ({ ...prevLoadingStatus, init: LoadingStatus.SUCCESS }))
  }

  const fetchMore = async (system: string, mode: SearchMode, fetchMore: () => Promise<Hierarchy<T>[]>) => {
   // setLoadingStatus({ ...loadingStatus, search: LoadingStatus.FETCHING })
    const endCodes = await fetchMore()
    const bySystem = groupBySystem(endCodes)
    const newCodes = await getMissingCodesWithSystems(trees, bySystem, codes, fetchHandler)
    const newTrees = buildMultipleTrees(trees, bySystem, newCodes, selectedCodes, Mode.SEARCH)
    setCodes(newCodes)
    setTrees(newTrees)
    if (mode === SearchMode.EXPLORATION) {
      const currentHierarchy = { tree: newTrees.get(system) || [], count: hierarchies.get(system)?.count || 0 }
      setHierarchies(replaceInMap(system, currentHierarchy, hierarchies))
    } else {
      setSearchResults({
        tree: getListDisplay([...searchResults.tree, ...endCodes], newTrees),
        count: searchResults.count
      })
    }
  //  setLoadingStatus({ ...loadingStatus, search: LoadingStatus.SUCCESS })
  }

  const search = async (fetchSearch: () => Promise<Back_API_Response<Hierarchy<T>>>) => {
    setLoadingStatus({ ...loadingStatus, search: LoadingStatus.FETCHING })
    const { results: endCodes, count } = await fetchSearch()
    const bySystem = groupBySystem(endCodes)
    const newCodes = await getMissingCodesWithSystems(trees, bySystem, codes, fetchHandler)
    const newTrees = buildMultipleTrees(trees, bySystem, newCodes, selectedCodes, Mode.SEARCH)
    const newSearchResults = {
      tree: getListDisplay(/*[...searchResults.tree, ...endCodes]*/ endCodes, newTrees),
      count: count
    }
    setCodes(newCodes)
    setTrees(newTrees)
    setSearchResults(newSearchResults)
    setLoadingStatus({ ...loadingStatus, search: LoadingStatus.SUCCESS })
  }

  const select = (node: Hierarchy<T>, toAdd: boolean) => {
    const hierarchyId = node.system
    const currentTree = trees.get(hierarchyId) || []
    const currentHierarchy = hierarchies.get(hierarchyId) || {
      tree: [],
      count: 0
    }
    const mode = toAdd ? Mode.SELECT : Mode.UNSELECT
    const newTree = buildTree(currentTree, node.system, [node], codes, selectedCodes, mode)
    const newHierarchy = {
      tree: getHierarchyDisplay(currentHierarchy.tree, newTree),
      count: currentHierarchy.count || 0
    }
    const newSelectedCodes = getSelectedCodes(newTree)
    setTrees(replaceInMap(hierarchyId, newTree, trees))
    setHierarchies(replaceInMap(hierarchyId, newHierarchy, hierarchies))
    setSelectedCodes(newSelectedCodes)
  }

  const selectAll = (toAdd: boolean) => {
    /* const mode = toAdd ? Mode.SELECT_ALL : Mode.UNSELECT_ALL
    const newTree = buildHierarchy(currentHierarchy.tree, currentHierarchy.display, codes, selectedCodes, mode)
    const newDisplay = getHierarchyDisplay(currentHierarchy.display, newTree)
    const newSelectedCodes = getSelectedCodes(newTree)
    setElemInHierarchies(currentHierarchy.id, newTree, newDisplay)
    setSelectedCodes(newSelectedCodes)*/
  }

  const deleteCode = (node: Hierarchy<T>) => {
    const DEFAULT_HIERARCHY_INFO = {
      tree: [],
      count: 0
    }
    const hierarchyId = node.system
    const currentTree = trees.get(hierarchyId) || []
    const currentHierarchy = hierarchies.get(hierarchyId) || DEFAULT_HIERARCHY_INFO
    const newCodes = removeElement(node, selectedCodes)
    const newTree = buildTree(currentTree, node.system, [node], codes, selectedCodes, Mode.UNSELECT)
    const newHierarchy = {
      tree: getHierarchyDisplay(currentHierarchy.tree, newTree),
      count: currentHierarchy.count || 0
    }
    setTrees(replaceInMap(hierarchyId, newTree, trees))
    setHierarchies(replaceInMap(hierarchyId, newHierarchy, hierarchies))
    setSelectedCodes(newCodes)
  }

  const expand = async (node: Hierarchy<T>) => {
    setLoadingStatus({ ...loadingStatus, expand: LoadingStatus.FETCHING })
    const DEFAULT_HIERARCHY_INFO = {
      tree: [],
      count: 0
    }
    const hierarchyId = node.system
    const currentTree = trees.get(hierarchyId) || []
    const currentHierarchy = hierarchies.get(hierarchyId) || DEFAULT_HIERARCHY_INFO
    const newCodes = await getMissingCodes(currentTree, codes, [node], hierarchyId, Mode.EXPAND, fetchHandler)
    const newTree = buildTree(currentTree, node.system, [node], newCodes, selectedCodes, Mode.EXPAND)
    const newHierarchy = {
      tree: getHierarchyDisplay(currentHierarchy.tree, newTree),
      count: currentHierarchy.count || 0
    }
    setCodes(newCodes)
    setTrees(replaceInMap(hierarchyId, newTree, trees))
    setHierarchies(replaceInMap(hierarchyId, newHierarchy, hierarchies))
    setLoadingStatus({ ...loadingStatus, search: LoadingStatus.SUCCESS })
  }

  return {
    hierarchies,
    searchResults,
    selectedCodes,
    loadingStatus,
    selectAllStatus,
    initTrees,
    search,
    select,
    //selectAll,
    expand,
    fetchMore,
    deleteCode
  }
}
