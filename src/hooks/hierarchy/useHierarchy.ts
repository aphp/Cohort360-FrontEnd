import {
  buildBranch,
  buildHierarchy,
  getHierarchyDisplay,
  getItemSelectedStatus,
  getUniquePath
} from './../../utils/hierarchy'
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
  const [baseLevels, setBaseLevels] = useState<Hierarchy<T, string>[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<T, string>[]>([])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.SUCCESS)
  const [selectAllStatus, setSelectAllStatus] = useState(SelectedStatus.NOT_SELECTED)

  useEffect(() => {
    setBaseLevels(baseTree)
    //setHierarchyRepresentation(baseTree)
    //setHierarchyDisplay(baseLevels)
  }, [baseTree])

  /*
  useEffect(() => {
    const handle = async () => {
      if (selectedIds && baseLevels.length) {
        const selectedCodes = await fetchHandler(selectedIds)
        const newTree = await buildHierarchy(
          selectedCodes,
          hierarchyRepresentation,
          fetchHandler,
          SelectedStatus.SELECTED
        )
        setSelectedCodes(selectedCodes)
        setHierarchyRepresentation(newTree)
      }
    }
    handle()
  }, [selectedIds, baseLevels])

  useEffect(() => {
    setBaseLevels(baseTree)
    setHierarchyRepresentation(baseTree)
  }, [hierarchyRepresentation])*/

  useEffect(() => {
    const node = { id: 'parent', subItems: hierarchyDisplay } as Hierarchy<T, string>
    const status = getItemSelectedStatus(node)
    setSelectAllStatus(status)
 /*   if (status === SelectedStatus.SELECTED) console.log('test status CHECKED')
    if (status === SelectedStatus.NOT_SELECTED) console.log('test status NOT CHECKED')
    if (status === SelectedStatus.INDETERMINATE) console.log('test status INDETERMINATE')*/
  }, [hierarchyDisplay])

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

  const search = async (
    search: string,
    page: number,
    fetchSearch: (sarch: string, page: number) => Promise<Hierarchy<T, string>[]>
  ) => {
    setLoadingStatus(LoadingStatus.FETCHING)
    if (search) {
      const searchResults = await fetchSearch(search, page)
      const newTree = await buildHierarchy(searchResults, hierarchyRepresentation, fetchHandler, null)
      const display = getHierarchyDisplay(searchResults, newTree)
      setHierarchyRepresentation(newTree)
      setHierarchyDisplay(display)
    } else {
      const display = getHierarchyDisplay(baseLevels, hierarchyRepresentation)
      setHierarchyDisplay(display)
    }
    setLoadingStatus(LoadingStatus.SUCCESS)
  }

  const selectHierarchyCode = async (path: string[], toAdd: boolean) => {
    const status = toAdd ? SelectedStatus.SELECTED : SelectedStatus.NOT_SELECTED
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

  const selectAllHierarchyCodes = async (toAdd: boolean) => {
    const status = toAdd ? SelectedStatus.SELECTED : SelectedStatus.NOT_SELECTED
    const newTree = await buildHierarchy(hierarchyDisplay, hierarchyRepresentation, fetchHandler, status)
    const updatedHierarchyDisplay = getHierarchyDisplay(hierarchyDisplay, newTree)
    const selectedCodes = getSelectedCodes(hierarchyRepresentation)
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay(updatedHierarchyDisplay)
    setSelectedCodes(selectedCodes)
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

  const expandHierarchy = async (path: string[], displayIndex: number) => {
    const paths = getUniquePath([path])
    const [key, value] = paths.entries().next().value
    const index = hierarchyRepresentation.findIndex((elem) => elem.id === key)
    const branch = await buildBranch(hierarchyRepresentation[index], [key, value], new Map(), fetchHandler, null, true)
    hierarchyRepresentation[index] = branch
    hierarchyDisplay[displayIndex] = getHierarchyDisplay([hierarchyDisplay[displayIndex]], hierarchyRepresentation)[0]
    setHierarchyRepresentation([...hierarchyRepresentation])
    setHierarchyDisplay([...hierarchyDisplay])
  }

  return {
    hierarchy: hierarchyDisplay,
    selectedCodes,
    loadingStatus,
    selectAllStatus,
    search,
    selectHierarchyCode,
    selectAllHierarchyCodes,
    expandHierarchy,
    deleteHierarchyCode
  }
}
