import { Claim, Condition, Procedure } from 'fhir/r4'
import { ExplorationResults, FetchOptions, FetchParams, Patient } from 'types/exploration'
import { Direction, Order, PMSIFilters } from 'types/searchCriterias'
import { fetcherWithParams, fetchInPages, getCommonParamsAll, getCommonParamsList } from 'utils/exploration'
import { fetchClaim, fetchCondition, fetchProcedure } from './callApi'
import { getCategory, getExtensionStringValue } from 'utils/fhir'
import { getConfig } from 'config'

const getPMSIFilters = (
  { nda, ipp, executiveUnits, encounterStatus }: PMSIFilters,
  fetchParams: FetchParams,
  groupId: string[]
) => ({
  'encounter-identifier': nda,
  'patient-identifier': ipp,
  executiveUnits: executiveUnits.map((unit) => unit.id),
  encounterStatus: encounterStatus.map(({ id }) => id),
  ...getCommonParamsList(fetchParams, groupId)
})

/**
 * @param includeRelatedResources Set to `false` to skip `_include` entirely instead
 * of paginating around HAPI-0389 (see `fetchInPages`). Only safe for callers that
 * don't read the included Patient/Encounter resources from the bundle — e.g.
 * `fetchLastPmsi`, which links encounters from `patient.infos.hospits` instead.
 * Callers that do read them (e.g. `ExplorationBoard`'s cohort-level tabs, via
 * `getResourceInfosFromBundle`) must keep the `true` default. Defaults to `true`.
 */
export const fetchConditionList = (
  fetchParams: FetchParams,
  { filters }: FetchOptions<PMSIFilters>,
  patient: Patient | null,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal,
  includeRelatedResources = true
): Promise<ExplorationResults<Condition>> => {
  const { diagnosticTypes, source, code, durationRange } = filters
  const params = {
    code: code.map((e) => encodeURIComponent(`${e.system}|${e.id}`)).join(','),
    source: source,
    type: diagnosticTypes?.map((type) => type.id),
    'min-recorded-date': durationRange?.[0] ?? '',
    'max-recorded-date': durationRange?.[1] ?? '',
    uniqueFacet: ['subject'],
    subject: patient?.infos?.id,
    _include: includeRelatedResources
      ? (['Encounter:encounter', 'Patient:subject'] satisfies ('Encounter:encounter' | 'Patient:subject')[])
      : undefined,
    ...getPMSIFilters(filters, fetchParams, groupId),
    _sort: fetchParams.orderBy.orderBy === Order.CODE ? Order.CODE : Order.ONSET_DATE,
    signal
  }
  const paramsFetchAll = {
    uniqueFacet: ['subject'],
    subject: patient?.infos?.id,
    ...getCommonParamsAll(groupId),
    signal
  }
  const fetchList = includeRelatedResources
    ? () =>
        fetchInPages<Condition>(
          (size, offset) => fetchCondition({ ...params, size, offset }),
          params.size,
          params.offset
        )
    : () => fetchCondition(params)
  return fetcherWithParams(fetchList, () => fetchCondition(paramsFetchAll), {
    ...fetchParams,
    filters,
    deidentified,
    patient,
    groupId
  })
}

/** @param includeRelatedResources See `fetchConditionList`'s doc — same rationale. */
export const fetchProcedureList = (
  fetchParams: FetchParams,
  { filters }: FetchOptions<PMSIFilters>,
  patient: Patient | null,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal,
  includeRelatedResources = true
): Promise<ExplorationResults<Procedure>> => {
  const { source, code, durationRange } = filters
  const params = {
    code: code.map((e) => encodeURIComponent(`${e.system}|${e.id}`)).join(','),
    source: source,
    minDate: durationRange?.[0] ?? '',
    maxDate: durationRange?.[1] ?? '',
    uniqueFacet: ['subject'],
    subject: patient?.id,
    _include: includeRelatedResources
      ? (['Encounter:encounter', 'Patient:subject'] satisfies ('Encounter:encounter' | 'Patient:subject')[])
      : undefined,
    ...getPMSIFilters(filters, fetchParams, groupId),
    _sort: fetchParams.orderBy.orderBy === Order.CODE ? Order.CODE : Order.DATE,
    signal
  }
  const paramsFetchAll = {
    uniqueFacet: ['subject'],
    subject: patient?.id,
    ...getCommonParamsAll(groupId),
    signal
  }
  const fetchList = includeRelatedResources
    ? () =>
        fetchInPages<Procedure>(
          (size, offset) => fetchProcedure({ ...params, size, offset }),
          params.size,
          params.offset
        )
    : () => fetchProcedure(params)
  return fetcherWithParams(fetchList, () => fetchProcedure(paramsFetchAll), {
    ...fetchParams,
    filters,
    deidentified,
    patient,
    groupId
  })
}

export const fetchClaimList = (
  fetchParams: FetchParams,
  { filters }: FetchOptions<PMSIFilters>,
  patient: Patient | null,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<Claim>> => {
  const { code, durationRange } = filters
  const params = {
    diagnosis: code.map((e) => encodeURIComponent(`${e.system}|${e.id}`)).join(','),
    minCreated: durationRange?.[0] ?? '',
    maxCreated: durationRange?.[1] ?? '',
    uniqueFacet: ['patient'],
    patient: patient?.id,
    _include: ['Encounter:encounter', 'Patient:patient'] satisfies ('Encounter:encounter' | 'Patient:patient')[],
    ...getPMSIFilters(filters, fetchParams, groupId),
    _sort: fetchParams.orderBy.orderBy === Order.CODE ? Order.DIAGNOSIS : Order.CREATED,
    signal
  }
  const paramsFetchAll = {
    uniqueFacet: ['patient'],
    subject: patient?.id,
    ...getCommonParamsAll(groupId),
    signal
  }
  return fetcherWithParams(
    () => fetchClaim(params),
    () => fetchClaim(paramsFetchAll),
    { ...fetchParams, filters, facet: 'unique-patient', deidentified, patient, groupId }
  )
}

export const fetchLastPmsi = async ({ patient, groupId }: { patient: Patient; groupId?: string }) => {
  try {
    const deidentified = !!patient?.deidentified
    const fetchParams = {
      size: 0,
      page: 0,
      searchInput: '',
      orderBy: {
        orderBy: Order.DATE,
        orderDirection: Direction.DESC
      },
      includeFacets: false
    }
    const filters: PMSIFilters = {
      executiveUnits: [],
      encounterStatus: [],
      code: [],
      durationRange: [null, null]
    }
    const groupIds = groupId ? [groupId] : []
    const includeRelatedResources = false // see fetchConditionList's doc
    const pmsiTotal = await Promise.all([
      fetchConditionList(fetchParams, { filters }, patient, deidentified, groupIds, undefined, includeRelatedResources),
      fetchProcedureList(fetchParams, { filters }, patient, deidentified, groupIds, undefined, includeRelatedResources)
    ])
    const diagSize = pmsiTotal[0].totalAllResults
    const procSize = pmsiTotal[1].totalAllResults

    // `_count` is set to the full diagSize/procSize below — exactly the combination
    // that triggers HAPI-0389 if `_include` is left on, hence includeRelatedResources: false.
    const fetchPatientResponse = await Promise.all([
      diagSize
        ? fetchConditionList(
            { ...fetchParams, size: diagSize },
            { filters },
            patient,
            deidentified,
            groupIds,
            undefined,
            includeRelatedResources
          )
        : { list: [] },
      procSize
        ? fetchProcedureList(
            { ...fetchParams, size: procSize },
            { filters },
            patient,
            deidentified,
            groupIds,
            undefined,
            includeRelatedResources
          )
        : { list: [] }
      // fetchClaimList({ ...fetchParams, size: 1 }, { filters }, patient, deidentified, groupIds)
    ])
    if (fetchPatientResponse === undefined) return null
    const conditionList = fetchPatientResponse[0].list
    const procedureList = fetchPatientResponse[1].list
    // const claimList = fetchPatientResponse[2].list

    return {
      // lastGhm: claimList ? claimList[0] : null,
      lastProcedure: procedureList ? procedureList[0] : null,
      mainDiagnosis: conditionList.filter(
        (condition) =>
          getExtensionStringValue(condition, getConfig().features.condition.extensions.orbisStatus)?.toUpperCase() ===
          'DP'
      ),
      procedures: procedureList,
      diagnostics: conditionList
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
