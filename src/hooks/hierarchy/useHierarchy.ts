import { buildBranch, buildHierarchy, getHierarchyDisplay, getUniquePath } from './../../utils/hierarchy'
import { useEffect, useState } from 'react'
import { LoadingStatus, SelectedStatus } from 'types'
import { addSubItems, getSelectedCodes } from 'utils/hierarchy'
import { Hierarchy } from '../../types/hierarchy'
import { removeElement } from 'utils/arrays'

export const useHierarchy = <T, S>(
  baseTree: Hierarchy<T, string>[],
  fetchHandler: (ids: string) => Promise<Hierarchy<T, string>[]>,
  selectedIds?: string
) => {
  const [hierarchyRepresentation, setHierarchyRepresentation] = useState<Hierarchy<T, string>[]>([])
  const [hierarchyDisplay, setHierarchyDisplay] = useState<Hierarchy<T, string>[]>([])
  const [baseLevels, setBaseLevels] = useState<Hierarchy<T, string>[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<T, string>[]>([])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.SUCCESS)

  useEffect(() => {
    setBaseLevels(baseTree)
  }, [baseTree])

  useEffect(() => {
    const handleInit = async () => {
      setLoadingStatus(LoadingStatus.FETCHING)
      let newTree: Hierarchy<T, string>[] = []
      if (selectedIds && baseLevels.length) {
        const selectedCodes = await fetchHandler(selectedIds)
        newTree = await buildHierarchy(selectedCodes, hierarchyRepresentation, fetchHandler, SelectedStatus.SELECTED)
        setSelectedCodes(selectedCodes)
      } else {
        newTree = await buildHierarchy(baseLevels, [], fetchHandler, SelectedStatus.NOT_SELECTED)
      }
      const display = getHierarchyDisplay(baseLevels, newTree)
      setHierarchyRepresentation(newTree)
      setHierarchyDisplay(display)
      setLoadingStatus(LoadingStatus.SUCCESS)
    }
    handleInit()
  }, [baseLevels, selectedIds, fetchHandler])

  const search = async (search: string, fetchSearch: (ids: string) => Promise<Hierarchy<T, string>[]>) => {
    setLoadingStatus(LoadingStatus.FETCHING)

    if (search) {
      const searchResults = await fetchSearch(search)
      const newTree = await buildHierarchy(searchResults, hierarchyRepresentation, fetchHandler)
      setHierarchyRepresentation(newTree)
      const display = getHierarchyDisplay(searchResults, hierarchyRepresentation)
      setHierarchyDisplay(display)
    } else {
      const display = getHierarchyDisplay(baseLevels, hierarchyRepresentation)
      setHierarchyDisplay(display)
    }
    setLoadingStatus(LoadingStatus.SUCCESS)
  }

  const selectHierarchyCodes = async (path: string[], toAdd: boolean) => {
    const status = toAdd ? SelectedStatus.NOT_SELECTED : SelectedStatus.SELECTED
    const paths = getUniquePath([path])
    const [key, value] = paths.entries().next().value
    const index = hierarchyRepresentation.findIndex((elem) => elem.id === key)
    const branch = await buildBranch(hierarchyRepresentation[index], [key, value], new Map(), fetchHandler, status)
    hierarchyRepresentation[index] = branch
    const updatedHierarchyDisplay = getHierarchyDisplay(hierarchyDisplay, hierarchyRepresentation)
    const selectedCodes = getSelectedCodes(hierarchyRepresentation)
    setSelectedCodes(selectedCodes)
    setHierarchyRepresentation([...hierarchyRepresentation])
    setHierarchyDisplay(updatedHierarchyDisplay)
  }

  const deleteHierarchyCode = async (hierarchyItem: Hierarchy<T, string>) => {
    const path = hierarchyItem.above_levels_ids
      ? [...hierarchyItem.above_levels_ids.split(','), hierarchyItem.id]
      : [hierarchyItem.id]
    const paths = getUniquePath([path])
    const [key, value] = paths.entries().next().value
    const index = hierarchyRepresentation.findIndex((elem) => elem.id === key)
    const branch = await buildBranch(
      hierarchyRepresentation[index],
      [key, value],
      new Map(),
      fetchHandler,
      SelectedStatus.NOT_SELECTED
    )
    hierarchyRepresentation[index] = branch
    const updatedHierarchyDisplay = getHierarchyDisplay(hierarchyDisplay, hierarchyRepresentation)
    const updatedSelectedCodes = removeElement(hierarchyItem, selectedCodes)
    setSelectedCodes(updatedSelectedCodes)
    setHierarchyRepresentation([...hierarchyRepresentation])
    setHierarchyDisplay(updatedHierarchyDisplay)
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
    search,
    selectHierarchyCodes,
    expandHierarchy,
    deleteHierarchyCode
  }
}
