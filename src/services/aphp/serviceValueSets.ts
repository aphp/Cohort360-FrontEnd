import { Extension, ValueSet, ValueSetComposeIncludeConcept, ValueSetExpansion } from 'fhir/r4'
import apiFhir from 'services/apiFhir'
import { Back_API_Response, FHIR_API_Response, FHIR_Bundle_Response } from 'types'
import { FhirHierarchy, FhirItem, Hierarchy, HierarchyWithLabel } from 'types/hierarchy'
import { getApiResponseResourceOrThrow, getApiResponseResourcesOrThrow } from 'utils/apiHelpers'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { getConfig } from 'config'
import { LOW_TOLERANCE_TAG } from './callApi'
import { sortArray } from 'utils/arrays'

export const UNKOWN_CHAPTER = 'UNKNOWN'

const getParentIds = (extensions?: Extension[], id?: string): string[] => {
  const parentIds = ['*']
  extensions
    ?.find((ext) => ext.url === getConfig().core.extensions.codeHierarchy)
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

const mapFhirHierarchyToHierarchyWithLabelAndSystem = (
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

const mapCodesToFhirItems = (
  codes: ValueSetComposeIncludeConcept[],
  codeSystem: string,
  codeInLabel: boolean
): FhirItem[] => {
  return sortArray(
    codes.map((code) => ({
      id: code.code,
      label: codeInLabel
        ? `${capitalizeFirstLetter(code.code)} - ${capitalizeFirstLetter(code.display)}`
        : capitalizeFirstLetter(code.display),
      system: codeSystem
    })),
    'label'
  )
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

const formatCodesFromValueSetReponse = (valueSetBundle: ValueSet[]) => {
  return valueSetBundle.map((entry) => entry.compose?.include[0].concept?.map((code) => code) || [])
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
export const getChildrenFromCodes = async (
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
export const searchInValueSets = async (
  codeSystems: string[],
  search: string,
  offset?: number,
  count?: number,
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirHierarchy, string>>> => {
  let options = ''
  if (offset !== undefined) options += `&offset=${offset}`
  if (count !== undefined) options += `&count=${count}`
  const searchValue = search || '*'
  const res = await apiFhir.get<FHIR_API_Response<ValueSet>>(
    `/ValueSet/$expand?url=${codeSystems.join(',')}&filter=${encodeURIComponent(
      searchValue
    )}&excludeNested=false&_tag=text-search-rank&_tag=${LOW_TOLERANCE_TAG}${options}`,
    {
      signal: signal
    }
  )
  return formatValuesetExpansion(getApiResponseResourceOrThrow(res).expansion)
}

/**
 * Get the complete list of a specific code system
 * @param codeSystem the code system to search in
 * @param codeInLabel the code is included in the Fhir Items labels
 * @param signal the abort signal to cancel the request
 * @returns the complete list of the code system
 */
export const getCodeList = async (
  codeSystem: string,
  codeInLabel = false,
  signal?: AbortSignal
): Promise<Back_API_Response<FhirItem>> => {
  const res = await apiFhir.get<FHIR_Bundle_Response<ValueSet>>(`/ValueSet?reference=${codeSystem}`, {
    signal: signal
  })
  const valueSetBundle = getApiResponseResourcesOrThrow(res)
  const codeList = formatCodesFromValueSetReponse(valueSetBundle)[0]
  const fhirItems = mapCodesToFhirItems(codeList, codeSystem, codeInLabel)
  return {
    results: fhirItems,
    count: codeList.length
  }
}

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
    { signal }
  )
  const valueSetBundle = getApiResponseResourcesOrThrow(res)
  const codeList = formatCodesFromValueSetReponse(valueSetBundle)
    .filter((valueSetPerSystem) => !!valueSetPerSystem)
    .reduce((acc, val) => acc.concat(val), [])
    .map((code) => ({
      id: code.code,
      label: joinDisplayWithCode
        ? `${code.code} - ${capitalizeFirstLetter(code.display)}`
        : capitalizeFirstLetter(code.display),
      system: codeSystem
    }))
    .filter((code) => !filterOut(code))

  const chapters = codeList
    .filter((code) => filterRoots(code))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((e) => mapFhirHierarchyToHierarchyWithLabelAndSystem(e))
  let toBeAdoptedCodes = codeList
    .filter((code) => !filterRoots(code))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((e) => mapFhirHierarchyToHierarchyWithLabelAndSystem(e))
  const childrenIds = chapters.map((code) => code.id)
  let subItems: Hierarchy<FhirHierarchy>[] | undefined = undefined
  if (toBeAdoptedCodes.length) {
    childrenIds.push(UNKOWN_CHAPTER)
    const unknownChildren = (
      await getChildrenFromCodes(
        codeSystem,
        toBeAdoptedCodes.map((code) => code.id)
      )
    ).results.map((child) => ({ ...child, above_levels_ids: `*,${UNKOWN_CHAPTER}` }))
    const unknownChapter: Hierarchy<FhirHierarchy> = {
      id: UNKOWN_CHAPTER,
      label: `U - ${UNKOWN_CHAPTER}`,
      system: codeSystem,
      above_levels_ids: '*',
      inferior_levels_ids: toBeAdoptedCodes.map((code) => code.id).join(','),
      subItems: unknownChildren
    }
    const chaptersEntities = (await getChildrenFromCodes(codeSystem, childrenIds)).results
    subItems = [...chaptersEntities, unknownChapter]
  }
  let results = [
    {
      id: '*',
      label: valueSetTitle,
      system: codeSystem,
      childrenIds,
      parentIds: []
    }
  ].map((e) => ({ ...mapFhirHierarchyToHierarchyWithLabelAndSystem(e), subItems }))
  return {
    results: results,
    count: codeList.length
  }
}
