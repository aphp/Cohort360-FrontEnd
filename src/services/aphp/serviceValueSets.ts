import { CODE_HIERARCHY_EXTENSION_NAME } from 'constants.js'
import { Extension, ValueSet, ValueSetExpansion } from 'fhir/r4'
import apiFhir from 'services/apiFhir'
import { Back_API_Response, FHIR_API_Response, FHIR_Bundle_Response } from 'types'
import { FhirHierarchy, Hierarchy, HierarchyWithLabel } from 'types/hierarchy'
import { getApiResponseResourceOrThrow, getApiResponseResourcesOrThrow } from 'utils/apiHelpers'
import { capitalizeFirstLetter } from 'utils/capitalize'

const getParentIds = (extensions?: Extension[], id?: string): string[] => {
  const parentIds = ['*']
  extensions
    ?.find((ext) => ext.url === CODE_HIERARCHY_EXTENSION_NAME)
    ?.valueCodeableConcept?.coding?.forEach((code) => {
      if (code.code && code.code !== id) parentIds.push(code.code)
    })
  return parentIds
}

/**
 * Map a FhirHierarchy to a HierarchyWithLabelAndSystem
 * Warning: the fhirHierarchy may have not its parentIds, childrenIds, and subItems initialized so
 * `above_levels_ids`, `inferior_levels_ids` may be empty whereas there should be some value here
 * @param fhirHierarchy
 * @returns
 */
export const mapFhirHierarchyToHierarchyWithLabelAndSystem = (
  fhirHierarchy: FhirHierarchy
): Hierarchy<FhirHierarchy, string> => {
  const label = fhirHierarchy.id === '*' ? fhirHierarchy.label : `${fhirHierarchy.id} - ${fhirHierarchy.label}`
  return {
    id: fhirHierarchy.id,
    label: label,
    system: fhirHierarchy.system,
    above_levels_ids: fhirHierarchy.parentIds?.join(',') || '',
    inferior_levels_ids: fhirHierarchy.childrenIds?.join(',') || ''
  }
}

/**
 * Get the roots of a code system, the subItems won't have their subItems, childrenIds initialized
 * You must then call getFhirCode on subItems to expand the hierarchy
 * @param codeSystem the code system to get the roots from
 * @param valueSetTitle the title of the root element, name of the code system
 * @param joinDisplayWithCode whether to join the display with the code
 * @param filterRoots legacy parameter to filter in the roots
 * @param filterOut legacy paramter to filter out the roots
 * @param signal abort signal to cancel the request
 * @returns a partial hierarchy with the roots of the code system
 */
export const getHierarchyRoots = async (
  codeSystem: string,
  valueSetTitle: string,
  joinDisplayWithCode = true,
  filterRoots: (code: HierarchyWithLabel) => boolean = () => true,
  filterOut: (code: HierarchyWithLabel) => boolean = (value: HierarchyWithLabel) => value.id === 'APHP generated',
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirHierarchy, string>>> => {
  const res = await apiFhir.get<FHIR_Bundle_Response<ValueSet>>(
    `/ValueSet?only-roots=true&reference=${codeSystem}&_sort=code`,
    {
      signal: signal
    }
  )
  const valueSetBundle = getApiResponseResourcesOrThrow(res)
  const codeList = valueSetBundle
    .map((entry) => {
      return (
        entry.compose?.include[0].concept?.map((code) => ({
          ...code,
          codeSystem: entry.compose?.include[0].system,
          parentIds: []
        })) || []
      )
    })
    .filter((valueSetPerSystem) => !!valueSetPerSystem)
    .reduce((acc, val) => acc.concat(val), [])
    .map((code) => ({
      id: code.code as string, // it will always be defined
      label: joinDisplayWithCode
        ? `${code.code} - ${capitalizeFirstLetter(code.display)}`
        : capitalizeFirstLetter(code.display),
      system: code.codeSystem as string // it will always be defined
    }))
    .filter((code) => !filterOut(code))
    .filter((code) => filterRoots(code))
    .sort((a, b) => a.label.localeCompare(b.label))
  const results = [
    {
      id: '*',
      label: valueSetTitle,
      system: codeSystem,
      childrenIds: codeList.map((code) => code.id),
      parentIds: []
    }
  ]
  return {
    results: results.map((e) => mapFhirHierarchyToHierarchyWithLabelAndSystem(e)),
    count: codeList.length
  }
}

const formatValuesetExpansion = (
  valueSetExpansion?: ValueSetExpansion
): Back_API_Response<Hierarchy<FhirHierarchy, string>> => {
  const codeList: Array<FhirHierarchy> =
    valueSetExpansion?.contains?.map((code) => ({
      id: code.code as string, // it will always be defined
      system: code.system as string, // it will always be defined
      label: code.display as string, // it will always be defined
      childrenIds: code.contains?.map((child) => child.code as string) || [],
      parentIds: getParentIds(code.extension, code.code)
    })) || []
  return {
    results: codeList.map((e) => mapFhirHierarchyToHierarchyWithLabelAndSystem(e)),
    count: valueSetExpansion?.total || codeList.length
  }
}

/**
 * Fetch the partial hierarchy from a certain node with a specific code value
 * the subItems won't have their subItems, childrenIds, and parentIds initialized
 * You must then call getFhirCode on subItems to expand the hierarchy
 * @param codeSystem the code system from which belongs the code
 * @param codes the codes to get the partial hierarchy from
 * @param signal the abort signal to cancel the request
 * @returns the partial hierarchy from the codes
 */
export const getFhirCodes = async (
  codeSystem: string,
  codes: string[],
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirHierarchy, string>>> => {
  if (codes.length === 0) {
    return {
      results: [],
      count: 0
    }
  }
  const json = {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'valueSet',
        resource: {
          resourceType: 'ValueSet',
          url: codeSystem,
          compose: {
            include: [
              {
                filter: codes.map((code) => ({
                  op: 'is-a',
                  value: code
                }))
              }
            ]
          }
        }
      },
      {
        name: 'excludeNested',
        valueString: 'false'
      }
    ]
  }
  const res = await apiFhir.post<FHIR_API_Response<ValueSet>>(`/ValueSet/$expand`, JSON.stringify(json), {
    signal: signal
  })
  return formatValuesetExpansion(getApiResponseResourceOrThrow(res).expansion)
}

/**
 * Search nodes matching the search string and retrieve the partial hierarchy for theses nodes
 * the subItems won't have their subItems, childrenIds, and parentIds initialized
 * You must then call getFhirCode on subItems to expand the hierarchy
 * @param codeSystems the code systems to search in
 * @param search the search string
 * @param offset the offset
 * @param count the size of the result
 * @param signal the abort signal to cancel the request
 * @returns the partial hierarchy for the nodes matching the search string
 */
export const searchCodes = async (
  codeSystems: string[],
  search: string,
  offset: number,
  count: number,
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirHierarchy, string>>> => {
  const res = await apiFhir.get<FHIR_API_Response<ValueSet>>(
    `/ValueSet/$expand?url=${codeSystems.join(',')}&filter=${encodeURIComponent(
      search
    )}&excludeNested=false&offset=${offset}&count=${count}`,
    {
      signal: signal
    }
  )
  return formatValuesetExpansion(getApiResponseResourceOrThrow(res).expansion)
}
