import { buildHierarchyFromSelectedIds, getBranch } from './../../utils/hierarchy'
import { useEffect, useState } from 'react'
import { LoadingStatus, SelectedStatus } from 'types'
import { addSubItems, getSelectedCodes, updateSelectedStatus, getItemSelectedStatus } from 'utils/hierarchy'
import { Hierarchy } from '../../types/hierarchy'
import { WithId } from '../../types/arrays'
import { removeElement } from 'utils/arrays'

export enum DisplayMode {
  TREE,
  SEARCH
}

export const useHierarchy = <T, S>(
  tree: WithId<T, S>[],
  childrenHandler: (ids: string) => Promise<Hierarchy<T, S>[]>,
  displayMode: DisplayMode,
  selectedIds?: string
) => {
  const [hierarchy, setHierarchy] = useState<Hierarchy<T, S>[]>([])
  const [hierarchyDisplay, setHierarchyDisplay] = useState<Hierarchy<T, S>[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<T, S>[]>([])
  const [isChildrenLoading, setIsChildrenLoading] = useState(LoadingStatus.SUCCESS)

  useEffect(() => {
    const handleInit = async () => {
      /*if (selectedIds && tree.length) {
        setIsChildrenLoading(LoadingStatus.FETCHING)
        const codes = await childrenHandler(selectedIds)
        setSelectedCodes(codes)
        const newTree = await buildHierarchyFromSelectedIds(codes, tree, childrenHandler)
        if (displayMode === DisplayMode.TREE) setHierarchy(newTree)
      } else {
        setIsChildrenLoading(LoadingStatus.FETCHING)
        setHierarchy(tree)
      }
      setIsChildrenLoading(LoadingStatus.SUCCESS)*/
      if (!selectedIds && displayMode === DisplayMode.TREE) {
        setHierarchy(tree)
        setHierarchyDisplay(tree)
      }
      if (selectedIds && tree.length && displayMode === DisplayMode.TREE) {
        const codes = await childrenHandler(selectedIds)
        setSelectedCodes(codes)
        const newTree = await buildHierarchyFromSelectedIds(codes, tree, childrenHandler)
        setHierarchy(newTree)
        setHierarchyDisplay(newTree)
      }
      if (tree.length && displayMode === DisplayMode.SEARCH) {
        //const codes = await childrenHandler(selectedIds)
        //const newTree = await buildHierarchyFromSelectedIds(codes, tree, childrenHandler)
        //setSelectedCodes(codes)
        //setHierarchy(newTree)
        setHierarchyDisplay(tree)
      }
    }
    handleInit()
  }, [tree, selectedIds, childrenHandler, displayMode])

  const mapToUniqueParent = (children: Hierarchy<T, S>[]) => {
    const firstParent: Hierarchy<T, S> = { id: 'firstParent' } as Hierarchy<T, S>
    firstParent.subItems = children
    firstParent.status = getItemSelectedStatus(firstParent)
    return firstParent
  }

  const selectHierarchyCodes = async (path: number[], toAdd: boolean, code: Hierarchy<T, S>) => {
    const status = toAdd ? SelectedStatus.NOT_SELECTED : SelectedStatus.SELECTED
    if (displayMode === DisplayMode.SEARCH) {
      const { path, branch } = await getBranch(code, hierarchy, childrenHandler)
      console.log('test fusion', path, branch, code)
    }
    const updatedHierarchy = updateSelectedStatus(path, hierarchy, status)
    const updatedSelectedCodes = getSelectedCodes(mapToUniqueParent(updatedHierarchy), [])
    setSelectedCodes(updatedSelectedCodes)
    setHierarchy(updatedHierarchy)
  }

  const deleteHierarchyCode = async (hierarchyItem: Hierarchy<T, S>) => {
    const newSelectedCodes = removeElement(hierarchyItem, selectedCodes)
    const { path } = await getBranch(hierarchyItem, hierarchy, childrenHandler)
    const updatedHierarchy = updateSelectedStatus(path, hierarchy, SelectedStatus.NOT_SELECTED)
    setSelectedCodes(newSelectedCodes)
    setHierarchy(updatedHierarchy)
  }

  const expandHierarchy = async (childrenIds: string, path: number[]) => {
    const children = await childrenHandler(childrenIds)
    // const sortedChild = children.sort((a: any, b: any) => a.name.localeCompare(b.label))
    const newTree = addSubItems(hierarchy, 0, path, children)
    setHierarchy([...newTree])
  }

  return {
    hierarchyDisplay,
    selectedCodes,
    isChildrenLoading,
    selectHierarchyCodes,
    expandHierarchy,
    deleteHierarchyCode
  }
}
