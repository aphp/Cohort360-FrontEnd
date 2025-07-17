import { CodeSystem, Extension, ValueSet, ValueSetComposeIncludeConcept, ValueSetExpansion } from 'fhir/r4'
import apiFhir from 'services/apiFhir'
import { Back_API_Response, FHIR_API_Response, FHIR_Bundle_Response } from 'types'
import { Hierarchy } from 'types/hierarchy'
import { getApiResponseResourceOrThrow, getApiResponseResourcesOrThrow } from 'utils/apiHelpers'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { getConfig } from 'config'
import { LOW_TOLERANCE_TAG } from './callApi'
import { sortArray } from 'utils/arrays'
import { FhirItem, ValueSetSorting } from 'types/valueSet'
import axios from 'axios'
import { getExtension, getExtensionIntegerValue } from 'utils/fhir'

export const UNKOWN_HIERARCHY_CHAPTER = 'UNKNOWN'
export const HIERARCHY_ROOT = '*'

const isDataNonQuali = (system: string) => {
  switch (system) {
    case getConfig().features.observation.valueSets.biologyHierarchyAnabio.url:
    case getConfig().features.medication.valueSets.medicationAtc.url:
      return true
  }
  return false
}

const getParentIds = (extensions?: Extension[], id?: string): string[] => {
  const parentIds = [HIERARCHY_ROOT]
  const hierarchyExtension = getExtension({ extension: extensions }, getConfig().core.extensions.codeHierarchy)
  hierarchyExtension?.valueCodeableConcept?.coding?.forEach((code) => {
    if (code.code && code.code !== id) parentIds.push(code.code)
  })
  return parentIds
}

const mapAbandonedChildren = (children: Hierarchy<FhirItem>[]) => {
  return children.map((child) =>
    child.above_levels_ids === HIERARCHY_ROOT && !child.inferior_levels_ids && isDataNonQuali(child.system)
      ? { ...child, above_levels_ids: `${HIERARCHY_ROOT},${UNKOWN_HIERARCHY_CHAPTER}` }
      : child
  )
}

/**
 * Map a FhirHierarchy to a HierarchyWithLabelAndSystem
 * Warning: the fhirHierarchy may have not its parentIds, childrenIds, and subItems initialized so
 * `above_levels_ids`, `inferior_levels_ids` may be empty whereas there should be some value here
 * @param fhirItem
 * @returns
 */
const mapFhirHierarchyToHierarchyWithLabelAndSystem = (fhirItem: FhirItem): Hierarchy<FhirItem> => {
  return {
    id: fhirItem.id,
    label: fhirItem.label,
    system: fhirItem.system,
    above_levels_ids: fhirItem.parentIds?.join(',') ?? '',
    inferior_levels_ids: fhirItem.childrenIds?.join(',') ?? '',
    statTotal: fhirItem.statTotal,
    statTotalUnique: fhirItem.statTotalUnique
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
        ? `${code.code} - ${capitalizeFirstLetter(code.display)}`
        : capitalizeFirstLetter(code.display),
      system: codeSystem
    })),
    'label'
  )
}

/**
 * Extracts statistics from code extensions
 * @param codeExtensions Extensions array from a code
 * @returns Object containing statistics values
 */
const extractStats = (codeExtensions?: Extension[]) => {
  try {
    if (!codeExtensions || !Array.isArray(codeExtensions)) {
      return { statTotal: undefined, statTotalUnique: undefined }
    }

    const statTotalUrl = getConfig().core.extensions.statTotal
    const statTotalUniqueUrl = getConfig().core.extensions.statTotalUnique

    return {
      statTotal: getExtensionIntegerValue({ extension: codeExtensions }, statTotalUrl),
      statTotalUnique: getExtensionIntegerValue({ extension: codeExtensions }, statTotalUniqueUrl)
    }
  } catch (error) {
    console.error('Error extracting statistics from extensions:', error)
    return { statTotal: undefined, statTotalUnique: undefined }
  }
}

const formatValuesetExpansion = (valueSetExpansion?: ValueSetExpansion): Back_API_Response<Hierarchy<FhirItem>> => {
  const codeList: Array<FhirItem> =
    valueSetExpansion?.contains?.map((code) => {
      const stats = code?.extension
        ? extractStats(code.extension)
        : { statTotal: undefined, statTotalUnique: undefined }
      return {
        id: code.code as string, // it will always be defined
        system: code.system as string, // it will always be defined
        label: code.display as string, // it will always be defined
        childrenIds: code.contains?.map((child) => child.code as string) || [],
        parentIds: getParentIds(code.extension, code.code),
        statTotal: stats?.statTotal,
        statTotalUnique: stats?.statTotalUnique
      }
    }) || []
  return {
    results: codeList.map((e) => mapFhirHierarchyToHierarchyWithLabelAndSystem(e)),
    count: valueSetExpansion?.total ?? codeList.length
  }
}

const formatCodesFromValueSetReponse = (valueSetBundle: ValueSet[]) => {
  return valueSetBundle.map((entry) => entry.compose?.include[0].concept?.map((code) => code) || [])
}

/**
 * Fetch the list of all codes in a codesystem
 * @param codeSystem codesystem from which to fetch codes
 * @param signal the abort signal to cancel the request
 * @returns the list of codes from the codesystem
 */
export const fetchCodeSystem = async (codeSystem: string, signal?: AbortSignal): Promise<FhirItem[]> => {
  const res = await apiFhir.get<FHIR_Bundle_Response<CodeSystem>>(`/CodeSystem?system=${codeSystem}`, {
    signal: signal
  })
  const codeSystemBundle = getApiResponseResourcesOrThrow(res)
  return (
    codeSystemBundle.at(0)?.concept?.map((concept) => ({
      id: concept.code as string,
      label: concept.display as string,
      system: codeSystem
    })) ?? []
  )
}

/**
 * Fetch the partial hierarchy from a certain node with a specific code value
 * the subItems won't have their subItems, childrenIds, and parentIds initialized
 * You must then call getFhirCode on subItems to expand the hierarchy
 * For large code arrays (> config.core.maxParallelCodeSearchExpandCount), calls are batched
 * to prevent API limits and improve performance
 * @param codeSystem the code system from which belongs the code
 * @param codes the codes to get the partial hierarchy from
 * @param signal the abort signal to cancel the request
 * @returns the partial hierarchy from the codes
 */
export const getChildrenFromCodes = async (
  codeSystem: string,
  codes: string[],
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirItem>>> => {
  if (codes.length === 0) {
    return {
      results: [],
      count: 0
    }
  }

  const maxBatchSize = getConfig().core.maxParallelCodeSearchExpandCount

  if (codes.length <= maxBatchSize) {
    return await getChildrenFromCodesBatch(codeSystem, codes, signal)
  }

  const batches: string[][] = []
  for (let i = 0; i < codes.length; i += maxBatchSize) {
    batches.push(codes.slice(i, i + maxBatchSize))
  }

  const batchPromises = batches.map((batch) => getChildrenFromCodesBatch(codeSystem, batch, signal))

  const batchResults = await Promise.all(batchPromises)

  const combinedResults = batchResults.reduce(
    (acc, batch) => {
      acc.results.push(...batch.results)
      acc.count += batch.count
      return acc
    },
    { results: [] as Hierarchy<FhirItem>[], count: 0 }
  )

  return combinedResults
}

/**
 * Internal helper function to process a batch of codes for hierarchy expansion
 * @param codeSystem the code system from which belongs the code
 * @param codes the codes to get the partial hierarchy from (should be <= maxParallelCodeSearchExpandCount)
 * @param signal the abort signal to cancel the request
 * @returns the partial hierarchy from the code batch
 */
const getChildrenFromCodesBatch = async (
  codeSystem: string,
  codes: string[],
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirItem>>> => {
  const json = {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'count',
        valueInteger: 999
      },
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
 * @param sorting the sorting configuration for the results
 * @param signal the abort signal to cancel the request
 * @returns the partial hierarchy for the nodes matching the search string
 */
export const searchInValueSets = async (
  codeSystems: string[],
  search: string,
  offset?: number,
  count?: number,
  sorting?: ValueSetSorting,
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirItem>>> => {
  let options = ''
  if (offset !== undefined) options += `&offset=${offset}`
  if (count !== undefined) options += `&count=${count}`

  // Add sorting parameter if provided
  if (sorting) {
    const sortField = sorting.field === 'statTotalUnique' ? 'statTotalUnique' : 'statTotal'
    const sortOrder = sorting.order === 'desc' ? '-' : ''
    options += `&_sort=${sortOrder}${sortField}`
  }

  const searchValue = search || HIERARCHY_ROOT
  try {
    const res = await apiFhir.get<FHIR_API_Response<ValueSet>>(
      `/ValueSet/$expand?url=${codeSystems.join(',')}&filter=${encodeURIComponent(
        searchValue
      )}&excludeNested=false&_tag=text-search-rank&_tag=${LOW_TOLERANCE_TAG}${options}`,
      { signal }
    )
    const response = formatValuesetExpansion(getApiResponseResourceOrThrow(res).expansion)
    response.results = mapAbandonedChildren(response.results)
    return response
  } catch (error) {
    if (axios.isCancel(error)) throw 'Cancelled request.'
    return {
      count: 0,
      results: []
    }
  }
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
  if (
    valueSetBundle.at(0)?.compose?.include[0].concept === undefined &&
    !!valueSetBundle.at(0)?.compose?.include[0].system
  ) {
    const codeSystemItems = await fetchCodeSystem(valueSetBundle.at(0)?.compose?.include[0].system as string, signal)
    return {
      results: codeSystemItems,
      count: codeSystemItems.length
    }
  }
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
  filterRoots: (code: Hierarchy<FhirItem>) => boolean = () => true,
  filterOut: (code: Hierarchy<FhirItem>) => boolean = (value: Hierarchy<FhirItem>) => value.id === 'APHP generated',
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirItem>>> => {
  const res = await apiFhir.get<FHIR_Bundle_Response<ValueSet>>(
    `/ValueSet?only-roots=true&reference=${codeSystem}&_sort=code`,
    { signal }
  )
  const valueSetBundle = getApiResponseResourcesOrThrow(res)
  const codeList = (
    formatCodesFromValueSetReponse(valueSetBundle)
      .filter((valueSetPerSystem) => !!valueSetPerSystem)
      .reduce((acc, val) => acc.concat(val), [])
      .map((code) => ({
        id: code.code,
        label: capitalizeFirstLetter(code.display),
        system: codeSystem
      })) as Hierarchy<FhirItem>[]
  ).filter((code) => !filterOut(code))

  const chapters = codeList
    .filter((code) => filterRoots(code))
    .map((e) => mapFhirHierarchyToHierarchyWithLabelAndSystem(e))
  const toBeAdoptedCodes = codeList.filter((code) => !filterRoots(code))
  const childrenIds = chapters.map((code) => code.id)
  let subItems: Hierarchy<FhirItem>[] | undefined = undefined
  if (toBeAdoptedCodes.length) {
    const unknownChaptersIds = toBeAdoptedCodes.map((code) => code.id)
    const unknownChapters = (await getChildrenFromCodes(codeSystem, unknownChaptersIds)).results
    const unknownChapter: Hierarchy<FhirItem> = {
      id: UNKOWN_HIERARCHY_CHAPTER,
      label: `${UNKOWN_HIERARCHY_CHAPTER}`,
      system: codeSystem,
      above_levels_ids: HIERARCHY_ROOT,
      inferior_levels_ids: unknownChapters.map((code) => code.id).join(','),
      subItems: unknownChapters
    }
    const chaptersEntities = (await getChildrenFromCodes(codeSystem, childrenIds)).results
    childrenIds.push(UNKOWN_HIERARCHY_CHAPTER)
    subItems = [...chaptersEntities, unknownChapter]
  }
  const results = [
    {
      id: HIERARCHY_ROOT,
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
