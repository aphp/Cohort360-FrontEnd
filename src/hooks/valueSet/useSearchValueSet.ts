import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Reference } from 'types/searchValueSet'
import { getFhirCodes, getHierarchyRoots, searchCodes } from 'services/aphp/serviceValueSets'
import { useSearchParameters } from '../search/useSearchParameters'
import { useHierarchy } from 'hooks/hierarchy/useHierarchy'

const LIMIT_PER_PAGE = 20

export const useSearchValueSet = (references: Reference[]) => {
  const listParameters = useSearchParameters()
  const hierarchyParameters = useSearchParameters()

  const fetchChildren = useCallback(async (ids: string, system: string) => {
    const { results } = await getFhirCodes(system, ids.split(','))
    return results
  }, [])

  const {
    hierarchies,
    list,
    selectedCodes,
    loadingStatus,
    selectAllStatus,
    initTree,
    search,
    expand,
    select,
    selectAll,
    deleteCode
  } = useHierarchy([], [], () => {}, fetchChildren)

  const controllerRef = useRef<AbortController | null>(null)

  const currentHierarchy = useMemo(() => {
    const system = hierarchyParameters.options.references.find((ref) => ref.checked)?.url
    if (system) {
      const found = hierarchies.get(system)
      if (found) return found
    }
    return []
  }, [hierarchies, hierarchyParameters.options.references])

  useEffect(() => {
    console.log('test current', currentHierarchy)
  }, [currentHierarchy])

  /*const getList = async () => {
    const ref = listParameters.options.references.filter((ref) => ref.checked).map((ref) => ref.url)
    if (ref.length) {
      const response = await searchCodes(
        ref,
        listParameters.options.searchInput,
        listParameters.options.page * LIMIT_PER_PAGE,
        LIMIT_PER_PAGE
      )
      //setValueSetHierarchies({ ...valueSetHierarchies, list: response.results })
      listParameters.onChangeCount(response.count)
    } else {
      //  setValueSetHierarchies({ ...valueSetHierarchies, list: [] })
      listParameters.onChangeCount(0)
    }
  }*/

  const fetchBaseTree = async (ref: Reference) => {
    const title = 'Toute la hiérarchie'
    try {
      const response = await getHierarchyRoots(ref.url, title, true, ref.filterRoots)
      return response.results
    } catch (error) {
      return []
    }
  }

  useEffect(() => {
    hierarchyParameters.onChangeReferences(references.map((ref, index) => ({ ...ref, checked: index === 0 })))
    listParameters.onChangeReferences(references)
  }, [references])

  const handleChangeListRef = (reference: Reference) => {
    const id = reference.id
    const url = reference.url
    const newReferences = listParameters.options.references.map((ref) => ({
      ...ref,
      checked: id === ref.id ? !ref.checked : ref.checked
    }))
    listParameters.onChangeReferences(newReferences)
    initTree(url, () => fetchBaseTree(reference))
  }

  const handleChangeHierarchyRef = (reference: Reference) => {
    const id = reference.id
    const url = reference.url
    const newReferences = hierarchyParameters.options.references.map((ref) => ({
      ...ref,
      checked: ref.id === id
    }))
    hierarchyParameters.onChangeReferences(newReferences)
    initTree(url, () => fetchBaseTree(reference))
  }

  /*useEffect(() => {
    getList()
  }, [listParameters.options.references, listParameters.options.searchInput, listParameters.options.page])*/

  return {
    hierarchyData: {
      hierarchy: currentHierarchy,
      loadingStatus,
      selectAllStatus,
      selectedCodes
    },
    hierarchyActions: {
      expand,
      select,
      selectAll,
      deleteCode
    },
    parametersData: {
      page: listParameters.options.page,
      searchInput: listParameters.options.searchInput,
      totalPages: listParameters.options.totalPages,
      count: listParameters.options.count,
      refs: {
        list: listParameters.options.references,
        hierarchy: hierarchyParameters.options.references
      }
    },
    parametersActions: {
      onChangeRefs: {
        list: handleChangeListRef,
        hierarchy: handleChangeHierarchyRef
      },
      onChangePage: listParameters.onChangePage,
      onChangeSearchInput: listParameters.onChangeSearchInput,
      onChangeSearchMode: listParameters.onChangeSearchMode
    }
  }
}
