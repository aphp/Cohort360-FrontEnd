import { buildHierarchyFromSelectedIds, getHierarchyDisplay } from './../../utils/hierarchy'
import { useEffect, useState } from 'react'
import { LoadingStatus, SelectedStatus } from 'types'
import { addSubItems, getSelectedCodes, updateSelectedStatus, getItemSelectedStatus } from 'utils/hierarchy'
import { Hierarchy } from '../../types/hierarchy'
import { removeElement } from 'utils/arrays'

export enum DisplayMode {
  TREE,
  SEARCH
}

export const useHierarchy = <T, S>(
  tree: Hierarchy<T, string>[],
  fetchHandler: (ids: string) => Promise<Hierarchy<T, string>[]>,
  displayMode: DisplayMode,
  selectedIds?: string
) => {
  const [hierarchyRepresentation, setHierarchyRepresentation] = useState<Hierarchy<T, string>[]>([])
  const [hierarchyDisplay, setHierarchyDisplay] = useState<Hierarchy<T, string>[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<T, string>[]>([])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.SUCCESS)

  useEffect(() => {
    const handleInit = async (tree: Hierarchy<T, string>[]) => {
      setLoadingStatus(LoadingStatus.FETCHING)
      if (selectedIds && tree.length) {
        const selectedCodes = await fetchHandler(selectedIds)
        const newTree = await buildHierarchyFromSelectedIds(selectedCodes, tree, fetchHandler)
        const display = getHierarchyDisplay(tree, newTree)
        setHierarchyRepresentation(newTree)
        setHierarchyDisplay(display)
        setSelectedCodes(selectedCodes)
      } else {
        setHierarchyRepresentation(tree)
        setHierarchyDisplay(tree)
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    }
    handleInit(tree)
  }, [tree, selectedIds, fetchHandler /*, displayMode*/])

  const mapToUniqueParent = (children: Hierarchy<T, S>[]) => {
    const firstParent: Hierarchy<T, S> = { id: 'firstParent' } as Hierarchy<T, S>
    firstParent.subItems = children
    firstParent.status = getItemSelectedStatus(firstParent)
    return firstParent
  }

  const selectHierarchyCodes = async (path: number[], toAdd: boolean, code: Hierarchy<T, S>) => {
    const status = toAdd ? SelectedStatus.NOT_SELECTED : SelectedStatus.SELECTED
    if (displayMode === DisplayMode.SEARCH) {
      //const { path, branch } = await getBranch(code, hierarchyRepresentation, fetchHandler)
    }
    const updatedHierarchy = updateSelectedStatus(path, hierarchyRepresentation, status)
    const updatedSelectedCodes = getSelectedCodes(mapToUniqueParent(updatedHierarchy), [])
    setSelectedCodes(updatedSelectedCodes)
    setHierarchyRepresentation(updatedHierarchy)
  }

  const deleteHierarchyCode = async (hierarchyItem: Hierarchy<T, S>) => {
    const newSelectedCodes = removeElement(hierarchyItem, selectedCodes)
    //const { path } = await getBranch(hierarchyItem, hierarchyRepresentation, fetchHandler)
    const updatedHierarchy = updateSelectedStatus(path, hierarchyRepresentation, SelectedStatus.NOT_SELECTED)
    setSelectedCodes(newSelectedCodes)
    setHierarchyRepresentation(updatedHierarchy)
  }

  const expandHierarchy = async (childrenIds: string, path: string[], displayIndex: number) => {
    const children = await fetchHandler(childrenIds)
    const newTree = addSubItems(path, hierarchyRepresentation, children)
    hierarchyDisplay[displayIndex] = getHierarchyDisplay([hierarchyDisplay[displayIndex]], newTree)[0]
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay([...hierarchyDisplay])
    // const sortedChild = children.sort((a: any, b: any) => a.name.localeCompare(b.label))
  }

  return {
    hierarchy: hierarchyDisplay,
    selectedCodes,
    loadingStatus,
    selectHierarchyCodes,
    expandHierarchy,
    deleteHierarchyCode
  }
}
