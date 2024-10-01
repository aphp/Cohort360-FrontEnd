import { Claim, Condition, Procedure } from 'fhir/r4'
import { PatientState } from 'state/patient'
import { ExplorationResults, FetchOptions, FetchParams } from 'types/exploration'
import { Order, PMSIFilters } from 'types/searchCriterias'
import { fetcherWithParams, getCommonParamsAll, getCommonParamsList } from 'utils/exploration'
import { fetchClaim, fetchCondition, fetchProcedure } from './callApi'

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
  patient: PatientState,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<Condition>> => {
  const { diagnosticTypes, source, code, durationRange } = filters
  const params = {
    code: code.map((e) => encodeURIComponent(`${e.system}|${e.id}`)).join(','),
    source: source,
    type: diagnosticTypes?.map((type) => type.id),
    'min-recorded-date': (durationRange && durationRange[0]) ?? '',
    'max-recorded-date': (durationRange && durationRange[1]) ?? '',
    uniqueFacet: ['subject'],
    subject: patient?.patientInfo?.id,
    ...getPMSIFilters(filters, fetchParams, groupId),
    _sort: fetchParams.orderBy.orderBy === Order.CODE ? Order.CODE : Order.RECORDED_DATE,
    signal
  }
  const paramsFetchAll = {
    uniqueFacet: ['subject'],
    subject: patient?.patientInfo?.id,
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
  patient: PatientState,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<Procedure>> => {
  const { source, code, durationRange } = filters
  const params = {
    code: code.map((e) => encodeURIComponent(`${e.system}|${e.id}`)).join(','),
    source: source,
    minDate: (durationRange && durationRange[0]) ?? '',
    maxDate: (durationRange && durationRange[1]) ?? '',
    uniqueFacet: ['subject'],
    subject: patient?.patientInfo?.id,
    ...getPMSIFilters(filters, fetchParams, groupId),
    _sort: fetchParams.orderBy.orderBy === Order.CODE ? Order.CODE : Order.DATE,
    signal
  }
  const paramsFetchAll = {
    uniqueFacet: ['subject'],
    subject: patient?.patientInfo?.id,
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
  patient: PatientState,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<Claim>> => {
  const { code, durationRange } = filters
  const params = {
    diagnosis: code.map((e) => encodeURIComponent(`${e.system}|${e.id}`)).join(','),
    minCreated: (durationRange && durationRange[0]) ?? '',
    maxCreated: (durationRange && durationRange[1]) ?? '',
    uniqueFacet: ['patient'],
    patient: patient?.patientInfo?.id,
    ...getPMSIFilters(filters, fetchParams, groupId),
    _sort: fetchParams.orderBy.orderBy === Order.CODE ? Order.DIAGNOSIS : Order.CREATED,
    signal
  }
  const paramsFetchAll = {
    uniqueFacet: ['patient'],
    subject: patient?.patientInfo?.id,
    ...getCommonParamsAll(groupId),
    signal
  }
  return fetcherWithParams(
    () => fetchClaim(params),
    () => fetchClaim(paramsFetchAll),
    { ...fetchParams, filters, facet: 'unique-patient', deidentified, patient, groupId }
  )
}
