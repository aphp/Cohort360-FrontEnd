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
} from './../../utils/hierarchy'
import { useEffect, useRef, useState } from 'react'
import { LoadingStatus, SelectedStatus } from 'types'
import { getSelectedCodes } from 'utils/hierarchy'
import { Hierarchy, HierarchyLoadingStatus, Mode } from '../../types/hierarchy'
import { removeElement } from 'utils/arrays'
import { replaceInMap } from 'utils/map'

export const useHierarchy = <T>(
  selectedNodes: Hierarchy<T>[],
  fetchedCodes: Hierarchy<T>[],
  onCache: (codes: Hierarchy<T>[]) => void,
  fetchHandler: (ids: string, system: string) => Promise<Hierarchy<T>[]>
) => {
  const [trees, setTrees] = useState<Map<string, Hierarchy<T>[]>>(new Map())
  const [hierarchies, setHierarchies] = useState<Map<string, Hierarchy<T>[]>>(new Map())
  const [list, setList] = useState<Hierarchy<T>[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<T>[]>(selectedNodes)
  const [codes, setCodes] = useState<Map<string, Hierarchy<T>>>(
    mapHierarchyToMap(fetchedCodes.map((code) => ({ ...code, subItems: undefined })))
  )
  const latestCodes = useRef(codes)
  const [loadingStatus, setLoadingStatus] = useState<HierarchyLoadingStatus>({
    search: LoadingStatus.FETCHING,
    expand: LoadingStatus.SUCCESS
  })
  const [selectAllStatus, setSelectAllStatus] = useState(SelectedStatus.NOT_SELECTED)

  useEffect(() => {
    latestCodes.current = codes
  }, [codes])

  useEffect(() => {
    return () => onCache(Array.from(latestCodes.current.values()))
  }, [])

  const initTree = async (system: string, fetchBaseTree: () => Promise<Hierarchy<T>[]>) => {
    if (!trees.get(system)) {
      const baseTree = await fetchBaseTree()
      const prevCodes = [...baseTree, ...selectedCodes]
      const newCodes = await getMissingCodes(baseTree, codes, prevCodes, system, Mode.INIT, fetchHandler)
      const newTree = buildTree(baseTree, prevCodes, newCodes, selectedCodes, Mode.INIT)
      const newDisplay = getHierarchyDisplay(baseTree, newTree)
      setTrees(replaceInMap(system, newTree, trees))
      setHierarchies(replaceInMap(system, newDisplay, hierarchies))
      setCodes(newCodes)
      setLoadingStatus({ ...loadingStatus, search: LoadingStatus.SUCCESS })
    }
  }

  const search = async (
    searchValue: string,
    page: number,
    fetchSearch: (search: string, page: number) => Promise<Hierarchy<T>[]>
  ) => {
    if (!searchValue) setList([])
    else {
      setLoadingStatus({ ...loadingStatus, search: LoadingStatus.FETCHING })
      const endCodes = await fetchSearch(searchValue, page)
      const bySystem = groupBySystem(endCodes)
      const newCodes = await getMissingCodesWithSystems(trees, bySystem, codes, fetchHandler)
      const newTrees = buildMultipleTrees(trees, bySystem, newCodes, selectedCodes, Mode.SEARCH)
      const newList = getListDisplay(endCodes, newTrees)
      setCodes(newCodes)
      setTrees(newTrees)
      setList(newList)
      setLoadingStatus({ ...loadingStatus, search: LoadingStatus.SUCCESS })
    }
  }

  const select = (node: Hierarchy<T>, toAdd: boolean) => {
    const hierarchyId = node.system
    const currentTree = trees.get(hierarchyId) || []
    const currentDisplay = hierarchies.get(hierarchyId) || []
    const mode = toAdd ? Mode.SELECT : Mode.UNSELECT
    const newTree = buildTree(currentTree, [node], codes, selectedCodes, mode)
    const newDisplay = getHierarchyDisplay(currentDisplay, newTree)
    const newSelectedCodes = getSelectedCodes(newTree)
    setTrees(replaceInMap(hierarchyId, newTree, trees))
    setHierarchies(replaceInMap(hierarchyId, newDisplay, hierarchies))
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
    const hierarchyId = node.system
    const currentTree = trees.get(hierarchyId) || []
    const currentDisplay = hierarchies.get(hierarchyId) || []
    const newCodes = removeElement(node, selectedCodes)
    const newTree = buildTree(currentTree, [node], codes, selectedCodes, Mode.UNSELECT)
    const newDisplay = getHierarchyDisplay(currentDisplay, newTree)
    setTrees(replaceInMap(hierarchyId, newTree, trees))
    setHierarchies(replaceInMap(hierarchyId, newDisplay, hierarchies))
    setSelectedCodes(newCodes)
  }

  const expand = async (node: Hierarchy<T>) => {
    setLoadingStatus({ ...loadingStatus, expand: LoadingStatus.FETCHING })
    const hierarchyId = node.system
    const currentTree = trees.get(hierarchyId) || []
    const currentDisplay = hierarchies.get(hierarchyId) || []
    const newCodes = await getMissingCodes(currentTree, codes, [node], hierarchyId, Mode.EXPAND, fetchHandler)
    const newTree = buildTree(currentTree, [node], newCodes, selectedCodes, Mode.EXPAND)
    const newDisplay = getHierarchyDisplay(currentDisplay, newTree)
    setCodes(newCodes)
    setTrees(replaceInMap(hierarchyId, newTree, trees))
    setHierarchies(replaceInMap(hierarchyId, newDisplay, hierarchies))
    setLoadingStatus({ ...loadingStatus, search: LoadingStatus.SUCCESS })
  }

  return {
    hierarchies,
    list,
    selectedCodes,
    loadingStatus,
    selectAllStatus,
    initTree,
    search,
    select,
    //selectAll,
    expand,
    deleteCode
  }
}
