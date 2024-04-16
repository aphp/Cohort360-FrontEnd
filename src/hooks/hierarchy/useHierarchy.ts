import { useEffect, useState } from 'react'
import { Back_API_Response, SelectedStatus } from 'types'
import { addSubItems, getSelectedCodes, updateSelectedStatus, getItemSelectedStatus } from 'utils/hierarchy'
import { Hierarchy } from '../../types/hierarchy'
import { WithId } from '../../types/arrays'
import { removeElement } from 'utils/arrays'

export const useHierarchy = <T, S>(tree: WithId<T, S>[], selectedIds?: Hierarchy<T, S>[]) => {
  const [hierarchy, setHierarchy] = useState<Hierarchy<T, S>[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<T, S>[]>([])

  useEffect(() => {
    if (selectedIds) setSelectedCodes(selectedIds)
  }, [selectedIds])

  useEffect(() => {
    setHierarchy(tree)
  }, [tree])

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
    setSelectedCodes(newSelectedCodes)
  }

  const expandHierarchy = async (path: number[], fetchChild: () => Promise<Back_API_Response<Hierarchy<T, S>>>) => {
    const childrenRequest: Back_API_Response<Hierarchy<T, S>> = await fetchChild()
    const children: Hierarchy<T, S>[] = childrenRequest.results
    // const sortedChild = children.sort((a: any, b: any) => a.name.localeCompare(b.label))
    const newTree = addSubItems(hierarchy, 0, path, children)
    setHierarchy([...newTree])
  }

  return {
    hierarchy,
    selectedCodes,
    selectHierarchyCodes,
    expandHierarchy,
    deleteHierarchyCode
  }
}
