import { Claim, Condition, Procedure } from 'fhir/r4'
import { ExplorationResults, FetchOptions, FetchParams, Patient } from 'types/exploration'
import { Direction, Order, PMSIFilters } from 'types/searchCriterias'
import { fetcherWithParams, getCommonParamsAll, getCommonParamsList } from 'utils/exploration'
import { fetchClaim, fetchCondition, fetchProcedure } from './callApi'
import { getCategory } from 'utils/fhir'
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

export const fetchConditionList = (
  fetchParams: FetchParams,
  { filters }: FetchOptions<PMSIFilters>,
  patient: Patient | null,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
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
    ...getPMSIFilters(filters, fetchParams, groupId),
    _sort: fetchParams.orderBy.orderBy === Order.CODE ? Order.CODE : Order.RECORDED_DATE,
    signal
  }
  const paramsFetchAll = {
    uniqueFacet: ['subject'],
    subject: patient?.infos?.id,
    ...getCommonParamsAll(groupId),
    signal
  }
  return fetcherWithParams(
    () => fetchCondition(params),
    () => fetchCondition(paramsFetchAll),
    { ...fetchParams, filters, deidentified, patient, groupId }
  )
}

export const fetchProcedureList = (
  fetchParams: FetchParams,
  { filters }: FetchOptions<PMSIFilters>,
  patient: Patient | null,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<Procedure>> => {
  const { source, code, durationRange } = filters
  const params = {
    code: code.map((e) => encodeURIComponent(`${e.system}|${e.id}`)).join(','),
    source: source,
    minDate: durationRange?.[0] ?? '',
    maxDate: durationRange?.[1] ?? '',
    uniqueFacet: ['subject'],
    subject: patient?.id,
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
  return fetcherWithParams(
    () => fetchProcedure(params),
    () => fetchProcedure(paramsFetchAll),
    { ...fetchParams, filters, deidentified, patient, groupId }
  )
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
    const pmsiTotal = await Promise.all([
      fetchConditionList(fetchParams, { filters }, patient, deidentified, groupIds),
      fetchProcedureList(fetchParams, { filters }, patient, deidentified, groupIds)
    ])
    const diagSize = pmsiTotal[0].totalAllResults
    const procSize = pmsiTotal[1].totalAllResults

    const fetchPatientResponse = await Promise.all([
      diagSize
        ? fetchConditionList({ ...fetchParams, size: diagSize }, { filters }, patient, deidentified, groupIds)
        : { list: [] },
      procSize
        ? fetchProcedureList({ ...fetchParams, size: procSize }, { filters }, patient, deidentified, groupIds)
        : { list: [] },
      fetchClaimList({ ...fetchParams, size: 1 }, { filters }, patient, deidentified, groupIds)
    ])
    if (fetchPatientResponse === undefined) return null
    const conditionList = fetchPatientResponse[0].list
    const procedureList = fetchPatientResponse[1].list
    const claimList = fetchPatientResponse[2].list

    return {
      lastGhm: claimList ? claimList[0] : null,
      lastProcedure: procedureList ? procedureList[0] : null,
      mainDiagnosis: conditionList.filter(
        (condition) =>
          getCategory(condition, getConfig().features.condition.valueSets.conditionStatus.url)?.coding?.[0].code ===
          'dp'
      ),
      procedures: procedureList,
      diagnostics: conditionList
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
