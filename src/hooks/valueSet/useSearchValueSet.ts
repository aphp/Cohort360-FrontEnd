import { useCallback, useEffect, useRef, useState } from 'react'
import { Reference } from 'types/searchValueSet'
import { FhirHierarchy, Hierarchy, HierarchyReturn } from 'types/hierarchy'
import { getFhirCodes, getHierarchyRoots, searchCodes } from 'services/aphp/serviceValueSets'
import { useSearchParameters } from '../search/useSearchParameters'
import { useHierarchy } from 'hooks/hierarchy/useHierarchy'

const LIMIT_PER_PAGE = 20

type HierarchyHooks<FhirHierarchy> = {
  id: string
  // baseTree: Hierarchy<FhirHierarchy, string>[]
  // list: Hierarchy<FhirHierarchy, string>[]
  //arborescence: Hierarchy<FhirHierarchy, string>[]
  hook: HierarchyReturn<FhirHierarchy>
}

type HierarchyRoots<FhirHierarchy> = {
  id: string
  // baseTree: Hierarchy<FhirHierarchy, string>[]
  // list: Hierarchy<FhirHierarchy, string>[]
  //arborescence: Hierarchy<FhirHierarchy, string>[]
  root: Hierarchy<FhirHierarchy, string>[]
}

const getHierarchyHook = (
  root: Hierarchy<FhirHierarchy>[],
  id: string,
  fetchChildren: (ids: string) => Promise<Hierarchy<FhirHierarchy, string>[]>
) => {
  const hook = { hook: useHierarchy(root, [], [], () => {}, fetchChildren), id: id }
  return hook
}

export const useSearchValueSet = (references: Reference[]) => {
  const listParameters = useSearchParameters()
  const arborescenceParameters = useSearchParameters()

  const fetchChildren = useCallback(
    async (ids: string) => {
      const refUrl = arborescenceParameters.options.references.find((ref) => ref.checked)?.url || ''
      const { results } = await getFhirCodes(refUrl, ids.split(','))
      return results
    },
    [arborescenceParameters.options.references]
  )

  const [roots, setRoots] = useState<HierarchyRoots<FhirHierarchy>[]>([])
  //const [hierarchyHooks, setHierarchyHooks] = useState<HierarchyHooks<FhirHierarchy>[]>([])

  const controllerRef = useRef<AbortController | null>(null)

  const getList = async () => {
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
  }

  const getAllRoots = async (references: Reference[]) => {
    const getRoots = async (ref: Reference) => {
      const title = 'Toute la hiérarchie'
      try {
        const response = await getHierarchyRoots(ref.url, title, true, ref.filterRoots)
        return response
      } catch (error) {
        console.error(`Erreur lors de la récupération des racines pour la référence ${ref.url}:`, error)
        throw error
      }
    }
    console.log('test refs', references)
    const promises = references.map((ref) => getRoots(ref))
    const response = await Promise.all(promises)
    const roots = references.map((ref, index) => ({
      id: ref.url,
      root: response[index].results
    }))
    setRoots(roots)
  }

  /*const findCurrentHierarchy = () => {
    const selectedRef = arborescenceParameters.options.references.find((ref) => ref.checked)
    if (selectedRef) {
      const found = hierarchyHooks.find((hook) => hook.id === selectedRef.url)
      if (found) return found?.hook.hierarchy
      else return []
    } else return []
  }*/

  useEffect(() => {
    arborescenceParameters.onChangeReferences(references.map((ref, index) => ({ ...ref, checked: index === 0 })))
    listParameters.onChangeReferences(references)
    getAllRoots(references)
  }, [references])

  /*useEffect(() => {
    getList()
  }, [listParameters.options.references, listParameters.options.searchInput, listParameters.options.page])*/

  return {
    /*hierarchyData: {
      hierarchies: {
        list: valueSetHierarchies.list,
        arboresence: valueSetHierarchies.arborescence
      },
      loadingStatus,
      selectAllStatus,
      selectedCodes
    },
    hierarchyActions: {
      expand,
      select,
      selectAll,
      deleteCode
    },*/
    //arborescense: findCurrentHierarchy(),
    arborescences: roots.map((root) => getHierarchyHook(root.root, root.id, fetchChildren)),
    parametersData: {
      page: listParameters.options.page,
      searchInput: listParameters.options.searchInput,
      totalPages: listParameters.options.totalPages,
      count: listParameters.options.count,
      refs: {
        list: listParameters.options.references,
        arboresence: arborescenceParameters.options.references
      }
    },
    parametersActions: {
      onChangeRefs: {
        list: listParameters.onChangeReferences,
        arboresence: arborescenceParameters.onChangeReferences
      },
      onChangePage: listParameters.onChangePage,
      onChangeSearchInput: listParameters.onChangeSearchInput,
      onChangeSearchMode: listParameters.onChangeSearchMode
    }
  }
}
