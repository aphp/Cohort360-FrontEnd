import { buildHierarchyFromSelectedIds, getBranch } from './../../utils/hierarchy'
import { useEffect, useState } from 'react'
import { LoadingStatus, SelectedStatus } from 'types'
import { addSubItems, getSelectedCodes, updateSelectedStatus, getItemSelectedStatus } from 'utils/hierarchy'
import { Hierarchy } from '../../types/hierarchy'
import { WithId } from '../../types/arrays'
import { removeElement } from 'utils/arrays'

export const useHierarchy = <T, S>(
  tree: WithId<T, S>[],
  childrenHandler: (ids: string) => Promise<Hierarchy<T, S>[]>,
  selectedIds?: string
) => {
  const [hierarchy, setHierarchy] = useState<Hierarchy<T, S>[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<T, S>[]>([])
  const [isChildrenLoading, setIsChildrenLoading] = useState(LoadingStatus.SUCCESS)

  useEffect(() => {
    const handleInit = async () => {
      if (selectedIds && tree.length) {
        setIsChildrenLoading(LoadingStatus.FETCHING)
        const codes = await childrenHandler(selectedIds)
        setSelectedCodes(codes)
        const newTree = await buildHierarchyFromSelectedIds(codes, tree, childrenHandler)
        setHierarchy(newTree)
      } else {
        setIsChildrenLoading(LoadingStatus.FETCHING)
        setHierarchy(tree)
      }
      setIsChildrenLoading(LoadingStatus.SUCCESS)
    }
    handleInit()
  }, [tree, selectedIds, childrenHandler])

  const mapToUniqueParent = (children: Hierarchy<T, S>[]) => {
    const firstParent: Hierarchy<T, S> = { id: 'firstParent' } as Hierarchy<T, S>
    firstParent.subItems = children
    firstParent.status = getItemSelectedStatus(firstParent)
    return firstParent
  }

  const selectHierarchyCodes = (path: number[], toAdd: boolean) => {
    const status = toAdd ? SelectedStatus.NOT_SELECTED : SelectedStatus.SELECTED
    const updatedHierarchy = updateSelectedStatus(path, hierarchy, status)
    const updatedSelectedCodes = getSelectedCodes(mapToUniqueParent(updatedHierarchy), [])
    setSelectedCodes(updatedSelectedCodes)
    setHierarchy(updatedHierarchy)
  }

  const deleteHierarchyCode = (hierarchyItem: Hierarchy<T, S>) => {
    const newSelectedCodes = removeElement(hierarchyItem, selectedCodes)
    const indexPath = getBranch(hierarchyItem, hierarchy)
    const updatedHierarchy = updateSelectedStatus(indexPath, hierarchy, SelectedStatus.NOT_SELECTED)
    console.log('test path', indexPath)
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
    hierarchy,
    selectedCodes,
    isChildrenLoading,
    selectHierarchyCodes,
    expandHierarchy,
    deleteHierarchyCode
  }
}
