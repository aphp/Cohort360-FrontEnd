import {
  AdministrationParamsKeys,
  ClaimParamsKeys,
  ConditionParamsKeys,
  DocumentsParamsKeys,
  ImagingParamsKeys,
  ObservationParamsKeys,
  PatientsParamsKeys,
  PrescriptionParamsKeys,
  ProcedureParamsKeys,
  ResourceType
} from 'types/requestCriterias'
import { ScopeElement, SimpleCodeType } from 'types'
import {
  Direction,
  Filters,
  GenderCodes,
  Order,
  PatientsFilters,
  SearchCriterias,
  VitalStatus,
  SearchByTypes,
  DurationRangeType,
  DocumentsFilters,
  BiologyFilters,
  ImagingFilters,
  MedicationFilters,
  PMSIFilters,
  LabelObject,
  GenericFilter,
  mapDocumentStatusesToRequestParam,
  mapGenderStatusToGenderCodes,
  mapDocumentStatusesFromRequestParam,
  mapGenderCodesToGenderStatus
} from 'types/searchCriterias'
import allDocTypesList from 'assets/docTypes.json'
import {
  convertDurationToString,
  convertDurationToTimestamp,
  convertStringToDuration,
  convertTimestampToDuration
} from 'utils/age'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import { Hierarchy } from 'types/hierarchy'
import { getConfig } from 'config'
import { HIERARCHY_ROOT, getChildrenFromCodes, getCodeList, getHierarchyRoots } from 'services/aphp/serviceValueSets'

const getGenericKeyFromResourceType = (
  type: ResourceType,
  key: 'NDA' | 'DATE' | 'EXECUTIVE_UNITS' | 'ENCOUNTER_STATUS'
) => {
  switch (type) {
    case ResourceType.DOCUMENTS:
      return DocumentsParamsKeys[key]
    case ResourceType.CONDITION:
      return ConditionParamsKeys[key]
    case ResourceType.PROCEDURE:
      return ProcedureParamsKeys[key]
    case ResourceType.CLAIM:
      return ClaimParamsKeys[key]
    case ResourceType.MEDICATION_REQUEST:
      return PrescriptionParamsKeys[key]
    case ResourceType.MEDICATION_ADMINISTRATION:
      return AdministrationParamsKeys[key]
    case ResourceType.OBSERVATION:
      return ObservationParamsKeys[key]
    case ResourceType.IMAGING:
      return ImagingParamsKeys[key]
  }
  return ''
}

const getValueSetCodes = async (parameters: URLSearchParams, key: string) => {
  const codeIds = decodeURIComponent(parameters.get(key) ?? '')
  const urlMap: Map<string, string[]> = new Map()
  if (codeIds)
    codeIds.split(',').forEach((str) => {
      const [url, id] = str.split('|')
      const isFound = urlMap.get(url)
      if (isFound) urlMap.set(url, [...isFound, id])
      else urlMap.set(url, [id])
    })
  try {
    return (
      await Promise.all(
        [...urlMap.entries()].map(([key, value]) =>
          value?.[0] === HIERARCHY_ROOT
            ? getHierarchyRoots(key, 'Toute la hiérarchie')
            : getChildrenFromCodes(key, value)
        )
      )
    ).flatMap((res) => res.results)
  } catch (error) {
    return []
  }
}

const mapGenericFromRequestParams = async (parameters: URLSearchParams, type: ResourceType) => {
  const nda = decodeURIComponent(parameters.get(getGenericKeyFromResourceType(type, 'NDA')) ?? '')
  const dates = parameters.getAll(getGenericKeyFromResourceType(type, 'DATE'))
  const startDate = dates.find((e) => e.includes('ge'))?.split('ge')?.[1] ?? null
  const endDate = dates.find((e) => e.includes('le'))?.split('le')?.[1] ?? null
  const executiveUnitsParams = parameters.get(getGenericKeyFromResourceType(type, 'EXECUTIVE_UNITS'))
  let executiveUnits: Hierarchy<ScopeElement>[] = []
  if (executiveUnitsParams) {
    const fetchedData = await servicesPerimeters.getPerimeters({ ids: executiveUnitsParams })
    executiveUnits = fetchedData.results
  }
  const encounterStatusParams = decodeURIComponent(
    parameters.get(getGenericKeyFromResourceType(type, 'ENCOUNTER_STATUS')) ?? ''
  )
  let encounterStatus: LabelObject[] = []
  if (encounterStatusParams) {
    const allEncounterStatus = (await getCodeList(getConfig().core.valueSets.encounterStatus.url)).results
    encounterStatus = encounterStatusParams?.split(',')?.map((elem) => {
      return {
        id: elem.split('|')?.[1],
        label: allEncounterStatus.find((encounterStatus) => encounterStatus.id === elem.split('|')?.[1])?.label ?? ''
      }
    })
  }
  return { nda, startDate, endDate, executiveUnits, encounterStatus }
}

const mapPatientFromRequestParams = (parameters: URLSearchParams) => {
  const genders =
    parameters
      .get(PatientsParamsKeys.GENDERS)
      ?.split(',')
      ?.map((code) => mapGenderCodesToGenderStatus(code as GenderCodes)) || []
  const vitalStatuses =
    parameters
      .get(PatientsParamsKeys.VITAL_STATUS)
      ?.split(',')
      ?.map((bool) => (bool === 'true' ? VitalStatus.DECEASED : VitalStatus.ALIVE)) || []
  const birthdatesRanges =
    parameters.getAll(PatientsParamsKeys.DATE_IDENTIFIED).length > 0
      ? mapBirthdatesRangesFromRequestParams(PatientsParamsKeys.DATE_IDENTIFIED, parameters)
      : mapBirthdatesRangesFromRequestParams(PatientsParamsKeys.DATE_DEIDENTIFIED, parameters)
  return { genders, vitalStatuses, birthdatesRanges }
}

const mapDocumentsFromRequestParams = async (parameters: URLSearchParams) => {
  const docTypesParams = parameters.get(DocumentsParamsKeys.DOC_TYPES)
  const docStatusesParams = parameters.get(DocumentsParamsKeys.DOC_STATUSES)
  let docTypes: SimpleCodeType[] = []
  let docStatuses: string[] = []
  if (docTypesParams) {
    docTypes = decodeURIComponent(docTypesParams)
      ?.split(',')
      ?.map((code) => {
        const elem = allDocTypesList.docTypes.find((docType) => docType.code === code)
        return elem ? { label: elem.label, code: elem.code, type: elem.type } : null
      })
      .filter((elem) => elem !== null) as SimpleCodeType[]
  }
  const ipp = decodeURIComponent(parameters.get(DocumentsParamsKeys.IPP) ?? '')
  if (docStatusesParams) {
    docStatuses = decodeURIComponent(docStatusesParams)
      ?.split(',')
      ?.map((e) => mapDocumentStatusesFromRequestParam(e.split('|')?.[1]))
  }
  const onlyPdfAvailable = true
  const { nda, startDate, endDate, executiveUnits, encounterStatus } = await mapGenericFromRequestParams(
    parameters,
    ResourceType.DOCUMENTS
  )
  return { docStatuses, docTypes, ipp, onlyPdfAvailable, nda, startDate, endDate, executiveUnits, encounterStatus }
}

const mapConditionFromRequestParams = async (parameters: URLSearchParams) => {
  const code = await getValueSetCodes(parameters, ConditionParamsKeys.CODE)
  const diagnosticTypesParams = decodeURIComponent(parameters.get(ConditionParamsKeys.DIAGNOSTIC_TYPES) ?? '')
  let diagnosticTypes: LabelObject[] = []
  if (diagnosticTypesParams) {
    const allDiagnosticTypes = await getCodeList(getConfig().features.condition.valueSets.conditionStatus.url)
    diagnosticTypes = diagnosticTypesParams?.split(',')?.map((elem) => {
      const toParse = elem.split('|')?.[1]
      return { id: toParse, label: (allDiagnosticTypes.results || []).find((diag) => diag.id === toParse)?.label ?? '' }
    })
  }
  const source = parameters.get(ConditionParamsKeys.SOURCE) ?? ''
  const { nda, startDate, endDate, executiveUnits, encounterStatus } = await mapGenericFromRequestParams(
    parameters,
    ResourceType.CONDITION
  )
  return { code, source, diagnosticTypes, nda, startDate, endDate, executiveUnits, encounterStatus }
}

const mapProcedureFromRequestParams = async (parameters: URLSearchParams) => {
  const code = await getValueSetCodes(parameters, ProcedureParamsKeys.CODE)
  const source = parameters.get(ProcedureParamsKeys.SOURCE) ?? ''
  const { nda, startDate, endDate, executiveUnits, encounterStatus } = await mapGenericFromRequestParams(
    parameters,
    ResourceType.PROCEDURE
  )
  return { code, source, nda, startDate, endDate, executiveUnits, encounterStatus }
}

const mapClaimFromRequestParams = async (parameters: URLSearchParams) => {
  const code = await getValueSetCodes(parameters, ClaimParamsKeys.CODE)
  const { nda, startDate, endDate, executiveUnits, encounterStatus } = await mapGenericFromRequestParams(
    parameters,
    ResourceType.CLAIM
  )
  return { code, nda, startDate, endDate, executiveUnits, encounterStatus }
}

const mapPrescriptionFromRequestParams = async (parameters: URLSearchParams) => {
  const prescriptionTypesParam = decodeURIComponent(parameters.get(PrescriptionParamsKeys.PRESCRIPTION_TYPES) ?? '')
  let prescriptionTypes: LabelObject[] = []
  if (prescriptionTypesParam) {
    const types = (await getCodeList(getConfig().features.medication.valueSets.medicationPrescriptionTypes.url)).results
    prescriptionTypes = prescriptionTypesParam?.split(',')?.map((elem) => {
      return { id: elem.split('|')?.[1], label: types.find((type) => type.id === elem.split('|')?.[1])?.label ?? '' }
    })
  }
  const { nda, startDate, endDate, executiveUnits, encounterStatus } = await mapGenericFromRequestParams(
    parameters,
    ResourceType.MEDICATION_REQUEST
  )
  const code = await getValueSetCodes(parameters, PrescriptionParamsKeys.CODE)
  return { code, prescriptionTypes, nda, startDate, endDate, executiveUnits, encounterStatus }
}

const mapAdministrationFromRequestParams = async (parameters: URLSearchParams) => {
  const administrationRoutesParam = decodeURIComponent(
    parameters.get(AdministrationParamsKeys.ADMINISTRATION_ROUTES) ?? ''
  )
  let administrationRoutes: LabelObject[] = []
  if (administrationRoutesParam) {
    const routes = (await getCodeList(getConfig().features.medication.valueSets.medicationAdministrations.url)).results
    administrationRoutes = administrationRoutesParam?.split(',')?.map((elem) => {
      return { id: elem.split('|')?.[1], label: routes.find((route) => route.id === elem.split('|')?.[1])?.label ?? '' }
    })
  }
  const code = await getValueSetCodes(parameters, AdministrationParamsKeys.CODE)
  const { nda, startDate, endDate, executiveUnits, encounterStatus } = await mapGenericFromRequestParams(
    parameters,
    ResourceType.MEDICATION_ADMINISTRATION
  )
  return { code, administrationRoutes, nda, startDate, endDate, executiveUnits, encounterStatus }
}

const mapBiologyFromRequestParams = async (parameters: URLSearchParams) => {
  const code = await getValueSetCodes(parameters, ObservationParamsKeys.CODE)
  const validatedStatus = true
  const { nda, startDate, endDate, executiveUnits, encounterStatus } = await mapGenericFromRequestParams(
    parameters,
    ResourceType.OBSERVATION
  )
  return { code, validatedStatus, nda, startDate, endDate, executiveUnits, encounterStatus }
}

const mapImagingFromRequestParams = async (parameters: URLSearchParams) => {
  const modalityParams = decodeURIComponent(parameters.get(ImagingParamsKeys.MODALITY) ?? '')
  const ipp = decodeURIComponent(parameters.get(ImagingParamsKeys.IPP) ?? '')
  let modality: LabelObject[] = []
  if (modalityParams) {
    const allModalities = (await getCodeList(getConfig().features.imaging.valueSets.imagingModalities.url, true))
      .results
    modality = modalityParams?.split(',')?.map((elem) => {
      return {
        id: elem.split('|')?.[1],
        label: allModalities.find((allModality) => allModality.id === elem.split('|')?.[1])?.label ?? ''
      }
    })
  }
  const { nda, startDate, endDate, executiveUnits, encounterStatus } = await mapGenericFromRequestParams(
    parameters,
    ResourceType.IMAGING
  )
  return { modality, nda, startDate, endDate, executiveUnits, encounterStatus, ipp }
}

const mapFiltersFromRequestParams = async (parameters: URLSearchParams, type: ResourceType): Promise<Filters> => {
  switch (type) {
    case ResourceType.PATIENT:
      return mapPatientFromRequestParams(parameters)
    case ResourceType.DOCUMENTS:
      return await mapDocumentsFromRequestParams(parameters)
    case ResourceType.CONDITION:
      return await mapConditionFromRequestParams(parameters)
    case ResourceType.PROCEDURE:
      return await mapProcedureFromRequestParams(parameters)
    case ResourceType.CLAIM:
      return await mapClaimFromRequestParams(parameters)
    case ResourceType.MEDICATION_REQUEST:
      return await mapPrescriptionFromRequestParams(parameters)
    case ResourceType.MEDICATION_ADMINISTRATION:
      return await mapAdministrationFromRequestParams(parameters)
    case ResourceType.IMAGING:
      return await mapImagingFromRequestParams(parameters)
    default:
      return await mapBiologyFromRequestParams(parameters)
  }
}

export const mapRequestParamsToSearchCriteria = async (
  filtersString: string,
  type: ResourceType
): Promise<SearchCriterias<Filters>> => {
  const parameters = new URLSearchParams(filtersString)
  const [searchBy, searchInput] = mapSearchByAndSearchInputFromRequestParams(parameters)
  const filters = await mapFiltersFromRequestParams(parameters, type)
  const orderBy = getDefaultOrderBy(type)
  return {
    searchBy,
    searchInput,
    orderBy: orderBy,
    filters
  }
}

const mapGenericToRequestParams = (filters: GenericFilter, type: ResourceType) => {
  const { nda, startDate, endDate, executiveUnits, encounterStatus } = filters
  const requestParams: string[] = []
  if (nda) requestParams.push(`${getGenericKeyFromResourceType(type, 'NDA')}=${encodeURIComponent(nda)}`)
  if (startDate) requestParams.push(`${getGenericKeyFromResourceType(type, 'DATE')}=ge${startDate}`)
  if (endDate) requestParams.push(`${getGenericKeyFromResourceType(type, 'DATE')}=le${endDate}`)
  if (executiveUnits && executiveUnits.length > 0)
    requestParams.push(
      `${getGenericKeyFromResourceType(type, 'EXECUTIVE_UNITS')}=${executiveUnits.map((unit) => unit.id)}`
    )
  if (encounterStatus && encounterStatus.length > 0) {
    const encounterStatusUrl = `${getConfig().core.valueSets.encounterStatus.url}|`
    const urlString = encounterStatus.map((elem) => encounterStatusUrl + elem.id).join(',')
    requestParams.push(`${getGenericKeyFromResourceType(type, 'ENCOUNTER_STATUS')}=${encodeURIComponent(urlString)}`)
  }
  return requestParams
}

const mapPatientToRequestParams = (filters: PatientsFilters, deidentified: boolean) => {
  const { genders, vitalStatuses, birthdatesRanges } = filters
  const requestParams: string[] = []
  if (vitalStatuses && vitalStatuses.length > 0)
    requestParams.push(
      `${PatientsParamsKeys.VITAL_STATUS}=${vitalStatuses.map((status) => status === VitalStatus.DECEASED)}`
    )
  if (genders && genders.length > 0)
    requestParams.push(`${PatientsParamsKeys.GENDERS}=${genders.map(mapGenderStatusToGenderCodes)}`)
  const minBirthdate = convertDurationToTimestamp(convertStringToDuration(birthdatesRanges?.[0]), deidentified)
  const maxBirthdate = convertDurationToTimestamp(convertStringToDuration(birthdatesRanges?.[1]), deidentified)
  if (minBirthdate && deidentified) requestParams.push(`${PatientsParamsKeys.DATE_DEIDENTIFIED}=ge${minBirthdate}`)
  if (minBirthdate && !deidentified) requestParams.push(`${PatientsParamsKeys.DATE_IDENTIFIED}=ge${minBirthdate}`)
  if (maxBirthdate && deidentified) requestParams.push(`${PatientsParamsKeys.DATE_DEIDENTIFIED}=le${maxBirthdate}`)
  if (maxBirthdate && !deidentified) requestParams.push(`${PatientsParamsKeys.DATE_IDENTIFIED}=le${maxBirthdate}`)
  return requestParams
}

const mapDocumentsToRequestParams = (filters: DocumentsFilters) => {
  const { ipp, docStatuses, docTypes, nda, endDate, startDate, executiveUnits, encounterStatus } = filters
  const docStatusCodeSystem = getConfig().core.codeSystems.docStatus
  const requestParams: string[] = []
  if (ipp) requestParams.push(`${DocumentsParamsKeys.IPP}=${encodeURIComponent(ipp)}`)
  if (docStatuses && docStatuses.length > 0) {
    requestParams.push(
      `${DocumentsParamsKeys.DOC_STATUSES}=${encodeURIComponent(
        docStatuses.map((status) => `${docStatusCodeSystem}|${mapDocumentStatusesToRequestParam(status)}`).toString()
      )}`
    )
  }
  if (docTypes && docTypes.length > 0)
    requestParams.push(
      `${DocumentsParamsKeys.DOC_TYPES}=${encodeURIComponent(docTypes.map((codeType) => codeType.code).toString())}`
    )
  requestParams.push(
    ...mapGenericToRequestParams({ nda, startDate, endDate, executiveUnits, encounterStatus }, ResourceType.DOCUMENTS)
  )
  return requestParams
}

const mapConditionToRequestParams = (filters: PMSIFilters) => {
  const { diagnosticTypes, code, source, nda, endDate, startDate, executiveUnits, encounterStatus } = filters
  const requestParams: string[] = []
  if (diagnosticTypes && diagnosticTypes.length > 0) {
    const diagnosticTypesUrl = `${getConfig().features.condition.valueSets.conditionStatus.url}|`
    const urlString = diagnosticTypes.map((elem) => diagnosticTypesUrl + elem.id).join(',')
    requestParams.push(`${ConditionParamsKeys.DIAGNOSTIC_TYPES}=${encodeURIComponent(urlString)}`)
  }
  if (code.length)
    requestParams.push(
      `${ConditionParamsKeys.CODE}=${encodeURIComponent(code.map((e) => `${e.system}|${e.id}`).join(','))}`
    )
  if (source) requestParams.push(`${ProcedureParamsKeys.SOURCE}=${source}`)
  requestParams.push(
    ...mapGenericToRequestParams({ nda, startDate, endDate, executiveUnits, encounterStatus }, ResourceType.CONDITION)
  )
  return requestParams
}

const mapClaimToRequestParams = (filters: PMSIFilters) => {
  const { code, nda, endDate, startDate, executiveUnits, encounterStatus } = filters
  const requestParams: string[] = []
  if (code.length)
    requestParams.push(
      `${ClaimParamsKeys.CODE}=${encodeURIComponent(code.map((e) => `${e.system}|${e.id}`).join(','))}`
    )
  requestParams.push(
    ...mapGenericToRequestParams({ nda, startDate, endDate, executiveUnits, encounterStatus }, ResourceType.CLAIM)
  )
  return requestParams
}

const mapProcedureToRequestParams = (filters: PMSIFilters) => {
  const { source, code, nda, endDate, startDate, executiveUnits, encounterStatus } = filters
  const requestParams: string[] = []
  if (code.length)
    requestParams.push(
      `${ProcedureParamsKeys.CODE}=${encodeURIComponent(code.map((e) => `${e.system}|${e.id}`).join(','))}`
    )
  if (source) requestParams.push(`${ProcedureParamsKeys.SOURCE}=${source}`)
  requestParams.push(
    ...mapGenericToRequestParams({ nda, startDate, endDate, executiveUnits, encounterStatus }, ResourceType.PROCEDURE)
  )
  return requestParams
}

const mapPrescriptionToRequestParams = (filters: MedicationFilters) => {
  const { code, prescriptionTypes, nda, endDate, startDate, executiveUnits, encounterStatus } = filters
  const requestParams: string[] = []
  if (prescriptionTypes && prescriptionTypes.length > 0) {
    const prescriptionTypesUrl = `${getConfig().features.medication.valueSets.medicationPrescriptionTypes.url}|`
    const urlString = prescriptionTypes.map((elem) => prescriptionTypesUrl + elem.id).join(',')
    requestParams.push(`${PrescriptionParamsKeys.PRESCRIPTION_TYPES}=${encodeURIComponent(urlString)}`)
  }
  if (code.length > 0)
    requestParams.push(
      `${PrescriptionParamsKeys.CODE}=${encodeURIComponent(code.map((e) => `${e.system}|${e.id}`).join(','))}`
    )
  requestParams.push(
    ...mapGenericToRequestParams(
      { nda, startDate, endDate, executiveUnits, encounterStatus },
      ResourceType.MEDICATION_REQUEST
    )
  )
  return requestParams
}

const mapAdministrationToRequestParams = (filters: MedicationFilters) => {
  const { code, administrationRoutes, nda, endDate, startDate, executiveUnits, encounterStatus } = filters
  const requestParams: string[] = []
  if (administrationRoutes && administrationRoutes.length > 0) {
    const administrationRoutesUrl = `${getConfig().features.medication.valueSets.medicationAdministrations.url}|`
    const urlString = administrationRoutes.map((elem) => administrationRoutesUrl + elem.id).join(',')
    requestParams.push(`${AdministrationParamsKeys.ADMINISTRATION_ROUTES}=${encodeURIComponent(urlString)}`)
  }
  if (code.length > 0)
    requestParams.push(
      `${PrescriptionParamsKeys.CODE}=${encodeURIComponent(code.map((e) => `${e.system}|${e.id}`).join(','))}`
    )
  requestParams.push(
    ...mapGenericToRequestParams(
      { nda, startDate, endDate, executiveUnits, encounterStatus },
      ResourceType.MEDICATION_ADMINISTRATION
    )
  )
  return requestParams
}

const mapBiologyToRequestParams = (filters: BiologyFilters) => {
  const { code, validatedStatus, nda, endDate, startDate, executiveUnits, encounterStatus } = filters
  const requestParams: string[] = ['value-quantity=ge0,le0', 'subject.active=true']
  if (code.length)
    requestParams.push(
      `${ObservationParamsKeys.CODE}=${encodeURIComponent(code.map((e) => `${e.system}|${e.id}`).join(','))}`
    )
  if (validatedStatus) requestParams.push(`${ObservationParamsKeys.VALIDATED_STATUS}=VAL`)
  requestParams.push(
    ...mapGenericToRequestParams({ nda, startDate, endDate, executiveUnits, encounterStatus }, ResourceType.OBSERVATION)
  )
  return requestParams
}

const mapImagingToRequestParams = (filters: ImagingFilters) => {
  const { modality, nda, endDate, startDate, executiveUnits, ipp, encounterStatus } = filters
  const requestParams: string[] = []
  if (ipp) requestParams.push(`${ImagingParamsKeys.IPP}=${encodeURIComponent(ipp)}`)
  if (modality && modality.length > 0)
    requestParams.push(
      `${ImagingParamsKeys.MODALITY}=${encodeURIComponent(
        modality
          .map((labelObject) => `${getConfig().features.imaging.valueSets.imagingModalities.url}|${labelObject.id}`)
          .join(',')
      )}`
    )
  requestParams.push(
    ...mapGenericToRequestParams({ nda, startDate, endDate, executiveUnits, encounterStatus }, ResourceType.IMAGING)
  )
  return requestParams
}

export const mapSearchCriteriasToRequestParams = (
  searchCriterias: SearchCriterias<Filters>,
  type: ResourceType,
  deidentified: boolean
) => {
  const { searchBy, searchInput, filters } = searchCriterias
  const searchByParam = searchBy || SearchByTypes.TEXT
  const filtersParam: string[] = searchInput
    ? mapSearchByAndSearchInputToRequestParams(searchByParam, searchInput, type)
    : []

  switch (type) {
    case ResourceType.PATIENT:
      filtersParam.push(...mapPatientToRequestParams(filters as PatientsFilters, deidentified))
      break
    case ResourceType.DOCUMENTS:
      filtersParam.push(...mapDocumentsToRequestParams(filters as DocumentsFilters))
      break
    case ResourceType.CONDITION:
      filtersParam.push(...mapConditionToRequestParams(filters as PMSIFilters))
      break

    case ResourceType.PROCEDURE:
      filtersParam.push(...mapProcedureToRequestParams(filters as PMSIFilters))
      break
    case ResourceType.CLAIM:
      filtersParam.push(...mapClaimToRequestParams(filters as PMSIFilters))
      break
    case ResourceType.MEDICATION_REQUEST:
      filtersParam.push(...mapPrescriptionToRequestParams(filters as MedicationFilters))
      break
    case ResourceType.MEDICATION_ADMINISTRATION:
      filtersParam.push(...mapAdministrationToRequestParams(filters as MedicationFilters))
      break
    case ResourceType.OBSERVATION:
      filtersParam.push(...mapBiologyToRequestParams(filters as BiologyFilters))
      break

    case ResourceType.IMAGING:
      filtersParam.push(...mapImagingToRequestParams(filters as ImagingFilters))
      break
  }
  const _filtersParam = filtersParam.join('&')
  return _filtersParam
}

const getDefaultOrderBy = (type: ResourceType) => {
  switch (type) {
    case ResourceType.PATIENT:
      return {
        orderBy: Order.FAMILY,
        orderDirection: Direction.ASC
      }
    case ResourceType.CLAIM:
    case ResourceType.PROCEDURE:
    case ResourceType.CONDITION:
      return {
        orderBy: Order.DATE,
        orderDirection: Direction.DESC
      }
    case ResourceType.MEDICATION_REQUEST:
    case ResourceType.MEDICATION_ADMINISTRATION:
      return {
        orderBy: Order.PERIOD_START,
        orderDirection: Direction.DESC
      }
    case ResourceType.OBSERVATION:
      return {
        orderBy: Order.DATE,
        orderDirection: Direction.ASC
      }
    case ResourceType.IMAGING:
      return {
        orderBy: Order.STUDY_DATE,
        orderDirection: Direction.DESC
      }
    default:
      return {
        orderBy: Order.DATE,
        orderDirection: Direction.DESC
      }
  }
}

const mapSearchByAndSearchInputToRequestParams = (searchBy: SearchByTypes, searchInput: string, type: ResourceType) => {
  const inputs = searchInput.split(' ').filter((elem: string) => elem)
  const params: string[] = []

  if (type === ResourceType.PATIENT) {
    switch (searchBy) {
      case SearchByTypes.TEXT:
      case SearchByTypes.FAMILY:
      case SearchByTypes.GIVEN:
        inputs.forEach((input) => params.push(`${searchBy}=${encodeURIComponent(input)}`))
        break
      case SearchByTypes.IDENTIFIER:
        params.push(`${searchBy}=${encodeURIComponent(inputs.join())}`)
        break
    }
  } else {
    params.push(`${searchBy}=${encodeURIComponent(searchInput)}`)
  }
  return params
}

const mapSearchByAndSearchInputFromRequestParams = (parameters: URLSearchParams): [SearchByTypes, string] => {
  const keysToCheck = [
    SearchByTypes.TEXT,
    SearchByTypes.FAMILY,
    SearchByTypes.GIVEN,
    SearchByTypes.IDENTIFIER,
    SearchByTypes.DESCRIPTION
  ]
  const [searchBy, searchInput] = (keysToCheck
    .map((key) => [key, parameters.getAll(key).join(' ')])
    .find(([, values]) => values) as [SearchByTypes, string]) ?? [SearchByTypes.TEXT, '']
  return [searchBy, searchInput]
}

function mapBirthdatesRangesFromRequestParams(key: PatientsParamsKeys, parameters: URLSearchParams): DurationRangeType {
  const birthdatesRanges: DurationRangeType = [null, null]
  const dates = parameters.getAll(key)
  dates.forEach((date) => {
    if (date?.includes('ge')) {
      const ageMin = date?.replace('ge', '')
      birthdatesRanges[0] = convertDurationToString(
        convertTimestampToDuration(+ageMin, key === PatientsParamsKeys.DATE_IDENTIFIED ? false : true)
      )
    }
    if (date?.includes('le')) {
      const ageMax = date?.replace('le', '')
      birthdatesRanges[1] = convertDurationToString(
        convertTimestampToDuration(+ageMax, key === PatientsParamsKeys.DATE_IDENTIFIED ? false : true)
      )
    }
  })
  return birthdatesRanges
}
