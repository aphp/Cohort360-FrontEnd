import { buildHierarchy, getHierarchyDisplay, getItemSelectedStatus } from './../../utils/hierarchy'
import { useEffect, useState } from 'react'
import { LoadingStatus, SelectedStatus } from 'types'
import { getSelectedCodes } from 'utils/hierarchy'
import { Hierarchy } from '../../types/hierarchy'
import { removeElement } from 'utils/arrays'

export const useHierarchy = <T>(
  baseTree: Hierarchy<T, string>[],
  fetchHandler: (ids: string) => Promise<Hierarchy<T, string>[]>,
  selectedIds?: string
) => {
  const [hierarchyRepresentation, setHierarchyRepresentation] = useState<Hierarchy<T, string>[]>([])
  const [hierarchyDisplay, setHierarchyDisplay] = useState<Hierarchy<T, string>[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<T, string>[]>([])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.SUCCESS)
  const [selectAllStatus, setSelectAllStatus] = useState(SelectedStatus.NOT_SELECTED)

  useEffect(() => {
    if (baseTree.length) init(baseTree)
  }, [baseTree])

  useEffect(() => {
    if (hierarchyDisplay.length) {
      const node = { id: 'parent', subItems: hierarchyDisplay } as Hierarchy<T, string>
      const status = getItemSelectedStatus(node)
      setSelectAllStatus(status)
    }
  }, [hierarchyDisplay])

  const handleHierarchy = async (
    codes: Hierarchy<T, string>[],
    tree: Hierarchy<T, string>[],
    displayTree: Hierarchy<T, string>[],
    status: SelectedStatus | null,
    toAdd: boolean
  ) => {
    let newTree = tree
    if (codes.length) newTree = await buildHierarchy(codes, tree, fetchHandler, status, toAdd)
    const newDisplay = getHierarchyDisplay(displayTree, newTree)
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay(newDisplay)
  }

  const init = async (baseTree: Hierarchy<T, string>[]) => {
    setLoadingStatus(LoadingStatus.FETCHING)
    let codes: Hierarchy<T, string>[] = baseTree
    let status = SelectedStatus.NOT_SELECTED
    if (selectedIds) {
      status = SelectedStatus.SELECTED
      codes = await fetchHandler(selectedIds)
      setSelectedCodes(codes)
    }
    await handleHierarchy(codes, [], baseTree, status, false)
    setLoadingStatus(LoadingStatus.SUCCESS)
  }

  const search = async (
    searchValue: string,
    page: number,
    fetchSearch: (search: string, page: number) => Promise<Hierarchy<T, string>[]>
  ) => {
    console.log('test glitch 1', searchValue)
    setLoadingStatus(LoadingStatus.FETCHING)
    const codes = searchValue ? await fetchSearch(searchValue, page) : []
    const toDisplay: Hierarchy<T, string>[] = searchValue ? codes : baseTree
    await handleHierarchy(codes, hierarchyRepresentation, toDisplay, null, false)
    setLoadingStatus(LoadingStatus.SUCCESS)
  }

  const select = async (node: Hierarchy<T, string>, toAdd: boolean) => {
    const status = toAdd ? SelectedStatus.SELECTED : SelectedStatus.NOT_SELECTED
    await handleHierarchy([node], hierarchyRepresentation, hierarchyDisplay, status, false)
    const selectedCodes = getSelectedCodes(hierarchyRepresentation)
    setSelectedCodes(selectedCodes)
  }

  const selectAll = async (toAdd: boolean) => {
    const status = toAdd ? SelectedStatus.SELECTED : SelectedStatus.NOT_SELECTED
    await handleHierarchy(hierarchyDisplay, hierarchyRepresentation, hierarchyDisplay, status, false)
    const selectedCodes = getSelectedCodes(hierarchyRepresentation)
    setSelectedCodes(selectedCodes)
  }

  const deleteCode = async (node: Hierarchy<T, string>) => {
    await handleHierarchy([node], hierarchyRepresentation, hierarchyDisplay, SelectedStatus.NOT_SELECTED, false)
    const newSelectedCodes = removeElement(node, selectedCodes)
    setSelectedCodes(newSelectedCodes)
  }

  const expand = async (node: Hierarchy<T, string>) => {
    await handleHierarchy([node], hierarchyRepresentation, hierarchyDisplay, null, true)
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
