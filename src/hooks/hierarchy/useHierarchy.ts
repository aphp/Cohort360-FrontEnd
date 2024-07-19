import {
  buildHierarchy,
  getHierarchyDisplay,
  getItemSelectedStatus,
  getMissingCodes,
  mapHierarchyToMap
} from './../../utils/hierarchy'
import { useEffect, useRef, useState } from 'react'
import { LoadingStatus, SelectedStatus } from 'types'
import { getSelectedCodes } from 'utils/hierarchy'
import { Hierarchy, Mode } from '../../types/hierarchy'
import { removeElement } from 'utils/arrays'

export const useHierarchy = <T>(
  baseTree: Hierarchy<T, string>[],
  selectedNodes: Hierarchy<T, string>[],
  _codes: Hierarchy<T, string>[],
  onCache: (codes: Hierarchy<T, string>[]) => void,
  fetchHandler: (ids: string) => Promise<Hierarchy<T, string>[]>
) => {
  const [hierarchyRepresentation, setHierarchyRepresentation] = useState<Hierarchy<T, string>[]>([])
  const [hierarchyDisplay, setHierarchyDisplay] = useState<Hierarchy<T, string>[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<T, string>[]>(selectedNodes)
  const [codes, setCodes] = useState<Map<string, Hierarchy<T, string>>>(
    mapHierarchyToMap(_codes.map((code) => ({ ...code, subItems: undefined })))
  )
  const latestCodes = useRef(codes)
  const [loadingStatus, setLoadingStatus] = useState({
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

  useEffect(() => {
    if (hierarchyDisplay.length) {
      const node = { id: 'parent', subItems: hierarchyDisplay } as Hierarchy<T, string>
      const status = getItemSelectedStatus(node)
      setSelectAllStatus(status)
    }
  }, [hierarchyDisplay])

  useEffect(() => {
    const init = async () => {
      const fetchedCodes = [...baseTree, ...selectedCodes]
      const newCodes = await getMissingCodes(baseTree, codes, fetchedCodes, Mode.INIT, fetchHandler)
      const newTree = buildHierarchy(baseTree, fetchedCodes, newCodes, selectedCodes, Mode.INIT)
      const newDisplay = getHierarchyDisplay(baseTree, newTree)
      setCodes(newCodes)
      setHierarchyRepresentation(newTree)
      setHierarchyDisplay(newDisplay)
      setLoadingStatus({ ...loadingStatus, search: LoadingStatus.SUCCESS })
    }
    init()
  }, [])

  const search = async (
    searchValue: string,
    page: number,
    fetchSearch: (search: string, page: number) => Promise<Hierarchy<T, string>[]>
  ) => {
    setLoadingStatus({ ...loadingStatus, search: LoadingStatus.FETCHING })
    const endCodes = searchValue ? await fetchSearch(searchValue, page) : []
    const newCodes = searchValue ? await getMissingCodes(baseTree, codes, endCodes, Mode.SEARCH, fetchHandler) : codes
    const toDisplay = searchValue ? endCodes : baseTree
    const newTree = buildHierarchy(hierarchyRepresentation, endCodes, newCodes, selectedCodes, Mode.SEARCH)
    const newDisplay = getHierarchyDisplay(toDisplay, newTree)
    setCodes(newCodes)
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay(newDisplay)
    setLoadingStatus({ ...loadingStatus, search: LoadingStatus.SUCCESS })
  }

  const select = (node: Hierarchy<T, string>, toAdd: boolean) => {
    const mode = toAdd ? Mode.SELECT : Mode.UNSELECT
    const newTree = buildHierarchy(hierarchyRepresentation, [node], codes, selectedCodes, mode)
    const newDisplay = getHierarchyDisplay(hierarchyDisplay, newTree)
    const newSelectedCodes = getSelectedCodes(newTree)
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay(newDisplay)
    setSelectedCodes(newSelectedCodes)
  }

  const selectAll = (toAdd: boolean) => {
    const mode = toAdd ? Mode.SELECT_ALL : Mode.UNSELECT_ALL
    const newTree = buildHierarchy(hierarchyRepresentation, hierarchyDisplay, codes, selectedCodes, mode)
    const newDisplay = getHierarchyDisplay(hierarchyDisplay, newTree)
    const newSelectedCodes = getSelectedCodes(newTree)
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay(newDisplay)
    setSelectedCodes(newSelectedCodes)
  }

  const deleteCode = (node: Hierarchy<T, string>) => {
    const newCodes = removeElement(node, selectedCodes)
    const newTree = buildHierarchy(hierarchyRepresentation, [node], codes, selectedCodes, Mode.UNSELECT)
    const newDisplay = getHierarchyDisplay(hierarchyDisplay, newTree)
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay(newDisplay)
    setSelectedCodes(newCodes)
  }

  const expand = async (node: Hierarchy<T, string>) => {
    setLoadingStatus({ ...loadingStatus, expand: LoadingStatus.FETCHING })
    const newCodes = await getMissingCodes(baseTree, codes, [node], Mode.EXPAND, fetchHandler)
    const newTree = buildHierarchy(hierarchyRepresentation, [node], newCodes, selectedCodes, Mode.EXPAND)
    const newDisplay = getHierarchyDisplay(hierarchyDisplay, newTree)
    setCodes(newCodes)
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay(newDisplay)
    setLoadingStatus({ ...loadingStatus, search: LoadingStatus.SUCCESS })
  }

  return {
    hierarchy: hierarchyDisplay,
    selectedCodes,
    loadingStatus,
    selectAllStatus,
    search,
    select,
    selectAll,
    expand,
    deleteCode
  }
}
