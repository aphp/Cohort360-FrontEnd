import api from './api'
import { CONTEXT, API_RESOURCE_TAG } from '../constants'
import { CohortPatient, CohortComposition, PMSIEntry, FHIR_API_Response, ScopeTreeRow, PatientData } from 'types'
import {
  IClaim,
  IComposition,
  ICondition,
  IDocumentReference,
  IEncounter,
  IGroup,
  IIdentifier,
  IObservation,
  IPatient,
  IProcedure
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { getApiResponseResources } from 'utils/apiHelpers'

export const fetchPatientsCount = async (): Promise<number | undefined> => {
  const response = await api.get<FHIR_API_Response<IPatient>>('Patient?_summary=count')

  if (response?.data?.resourceType === 'OperationOutcome') return undefined

  return response.data.total
}

export const fillNDAAndServiceProviderDocs = async (deidentifiedBoolean?: boolean, docs?: CohortComposition[]) => {
  if (!docs) {
    return undefined
  }

  const listeEncounterIds: string[] = docs
    .map((e) => e.encounter?.display?.substring(10))
    .filter((s): s is string => undefined !== s)
  const noDuplicatesList: string[] = []
  for (const element of listeEncounterIds) {
    if (!noDuplicatesList.includes(element)) {
      noDuplicatesList.push(element)
    }
  }

  if (noDuplicatesList.length === 0) {
    return docs
  }

  const encounters = await api.get<FHIR_API_Response<IEncounter>>(`/Encounter?_id=${noDuplicatesList.join()}`)
  if (encounters.data.resourceType !== 'Bundle' || !encounters.data.entry) {
    return []
  }

  const listeEncounters = encounters.data.entry.map((e: any) => e.resource)

  for (const doc of docs) {
    for (const encounter of listeEncounters) {
      if (doc.encounter?.display?.substring(10) === encounter.id) {
        doc.encounterStatus = encounter.status ?? 'Statut inconnu'

        doc.serviceProvider = encounter.serviceProvider.display ?? 'Non renseigné'

        if (deidentifiedBoolean) {
          doc.NDA = encounter.id
        } else if (encounter.identifier) {
          const nda = encounter.identifier.filter((identifier: IIdentifier) => {
            return identifier.type?.coding?.[0].code === 'NDA'
          })
          doc.NDA = nda[0].value
        } else {
          doc.NDA = 'Inconnu'
        }
      }
    }
  }

  return docs
}

export async function fillNDAAndServiceProvider<T extends IProcedure | ICondition | IClaim>(
  deidentifiedBoolean?: boolean,
  pmsi?: T[]
): Promise<PMSIEntry<T>[] | undefined> {
  if (!pmsi) {
    return undefined
  }

  const pmsiEntries: PMSIEntry<T>[] = pmsi
  const listeEncounterIds = pmsiEntries
    .map((e) =>
      e.resourceType === 'Claim'
        ? //@ts-ignore
          e.item?.[0].encounter?.[0].reference?.substring(10)
        : //@ts-ignore
          e.encounter?.reference?.substring(10)
    )
    .filter((s): s is string => undefined !== s)

  const noDuplicatesList: string[] = []
  for (const element of listeEncounterIds) {
    if (!noDuplicatesList.includes(element)) {
      noDuplicatesList.push(element)
    }
  }

  if (noDuplicatesList.length === 0) {
    return pmsiEntries
  }

  const encounters = await api.get<FHIR_API_Response<IEncounter>>(`/Encounter?_id=${noDuplicatesList}`)

  if (encounters.data.resourceType !== 'Bundle' || !encounters.data.entry) {
    return []
  }

  const listeEncounters = encounters.data.entry.map((e: any) => e.resource)

  for (const entry of pmsiEntries) {
    for (const encounter of listeEncounters) {
      const pmsiEncounterId =
        entry.resourceType === 'Claim'
          ? // @ts-ignore
            (entry as PMSIEntry<IClaim>).item?.[0].encounter?.[0].reference?.substring(10)
          : (entry as IProcedure | ICondition).encounter?.reference?.substring(10)

      if (pmsiEncounterId === encounter.id) {
        entry.serviceProvider = encounter.serviceProvider.display ?? 'Non renseigné'

        if (deidentifiedBoolean) {
          entry.NDA = encounter.id
        } else if (encounter.identifier) {
          const nda = encounter.identifier.filter((identifier: IIdentifier) => {
            return identifier.type?.coding?.[0].code === 'NDA'
          })
          entry.NDA = nda[0].value
        } else {
          entry.NDA = 'Inconnu'
        }
      }
    }
  }

  return pmsiEntries
}

const _ArkhnGetServiceProviderFromPMSIData = async <T extends IClaim | IProcedure | ICondition>(
  data: T
): Promise<PMSIEntry<T>> => {
  let serviceProvider: string | undefined
  let NDA: string | undefined
  switch (data.resourceType) {
    case 'Condition':
    case 'Procedure': {
      // @ts-ignore
      const encounterIdentifier = data.encounter?.identifier?.value
      if (encounterIdentifier) {
        const encounter = getApiResponseResources(
          await api.get<FHIR_API_Response<IEncounter>>(
            `/Encounter?identifier=${encounterIdentifier}${API_RESOURCE_TAG}`
          )
        )?.[0]
        if (encounter) {
          serviceProvider = encounter.serviceProvider?.display
          NDA = encounter.identifier?.[0].value
        }
      }
      break
    }
    case 'Claim':
      break

    default:
      break
  }
  return { ...data, serviceProvider, NDA }
}

export const fetchPMSI = async (
  deidentified: boolean,
  page: number,
  patientId: string,
  selectedTab: 'CIM10' | 'CCAM' | 'GHM',
  searchInput: string,
  nda: string,
  code: string,
  startDate?: string,
  endDate?: string
): Promise<{
  pmsiData?: PMSIEntry<IClaim | ICondition | IProcedure>[]
  pmsiTotal?: number
}> => {
  if (CONTEXT === 'arkhn') {
    let resource = ''
    let search = ''
    // let dateName = ''
    // let ndaFilter = ''
    let codeName = ''
    let codeFilter = ''
    let searchParam = ''

    switch (selectedTab) {
      case 'CCAM':
        resource = '/Procedure'
        // dateName = '-date'
        searchParam = 'subject'
        codeName = 'code'
        break
      case 'GHM':
        resource = '/Claim'
        // dateName = '-created'
        searchParam = 'patient'
        codeName = 'diagnosis'
        break
      case 'CIM10':
      default:
        resource = '/Condition'
        // dateName = '-recorded-date'
        searchParam = 'subject'
        codeName = 'code'
    }
    if (searchInput) {
      search = `&_text=${searchInput}`
    }

    if (code !== '') {
      codeFilter = `&${codeName}=${code}`
    }
    // if (nda !== '') {
    //   ndaFilter = `&encounter.identifier=${nda}`
    // }

    const pmsiDataResp = getApiResponseResources(
      await api.get<FHIR_API_Response<IClaim | IProcedure>>(
        `${resource}?${searchParam}=${patientId}${search}${codeFilter}${API_RESOURCE_TAG}` // ${ndaFilter}
      )
    )
    const pmsiData =
      pmsiDataResp && (await Promise.all(pmsiDataResp.map((data) => _ArkhnGetServiceProviderFromPMSIData(data))))
    return {
      pmsiData,
      pmsiTotal: pmsiData?.length ?? 0
    }
  }
  if (CONTEXT === 'aphp') {
    let resource = ''
    let search = ''
    let dateName = ''
    let ndaFilter = ''
    let codeName = ''
    let codeFilter = ''
    let dateFilter = ''

    switch (selectedTab) {
      case 'CIM10':
        resource = '/Condition'
        dateName = 'recorded-date'
        codeName = 'code'
        break
      case 'CCAM':
        resource = '/Procedure'
        dateName = 'date'
        codeName = 'code'
        break
      case 'GHM':
        resource = '/Claim'
        dateName = 'created'
        codeName = 'diagnosis'
        break
      default:
        resource = '/Condition'
        dateName = 'recorded-date'
        codeName = 'code'
    }

    if (searchInput) {
      search = `&_text=${searchInput}`
    }

    if (nda !== '') {
      ndaFilter = `&encounter.identifier=${nda}`
    }

    if (code !== '') {
      codeFilter = `&${codeName}=${code}`
    }

    if (startDate || endDate) {
      if (startDate && endDate) {
        dateFilter = `&${dateName}=ge${startDate},le${endDate}`
      } else if (startDate) {
        dateFilter = `&${dateName}=ge${startDate}`
      } else if (endDate) {
        dateFilter = `&${dateName}=le${endDate}`
      }
    }

    const pmsiResp = await api.get<FHIR_API_Response<IClaim | IProcedure | ICondition>>(
      `${resource}?patient=${patientId}&_sort=-${dateName}&size=20&offset=${
        (page - 1) * 20
      }${search}${ndaFilter}${codeFilter}${dateFilter}`
    )

    const pmsiData =
      pmsiResp.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProvider(deidentified, getApiResponseResources(pmsiResp))
        : undefined

    const pmsiTotal = pmsiResp.data.resourceType === 'Bundle' ? pmsiResp.data.total : 0

    return {
      pmsiData,
      pmsiTotal
    }
  }

  return {}
}

export const fetchDocuments = async (
  deidentified: boolean,
  page: number,
  patientId: string,
  searchInput: string,
  selectedDocTypes: string[],
  nda: string,
  startDate?: string,
  endDate?: string
) => {
  if (CONTEXT === 'aphp') {
    let search = ''
    let docTypesFilter = ''
    let ndaFilter = ''
    let dateFilter = ''

    if (searchInput) {
      search = `&_text=${searchInput}`
    }

    if (!selectedDocTypes.includes('all')) {
      docTypesFilter = `&type=${selectedDocTypes.join()}`
    }

    if (nda) {
      ndaFilter = `&encounter.identifier=${nda}`
    }

    if (startDate || endDate) {
      if (startDate && endDate) {
        dateFilter = `&date=ge${startDate},le${endDate}`
      } else if (startDate) {
        dateFilter = `&date=ge${startDate}`
      } else if (endDate) {
        dateFilter = `&date=le${endDate}`
      }
    }

    const docsList = await api.get(
      `/Composition?patient=${patientId}&_sort=-date&size=20&offset=${
        page ? (page - 1) * 20 : 0
      }${search}${docTypesFilter}${ndaFilter}${dateFilter}`
    )

    if (!docsList.data.total) {
      return null
    } else {
      return {
        docsTotal: docsList.data.total,
        docsList: await fillNDAAndServiceProviderDocs(deidentified, getApiResponseResources(docsList))
      }
    }
  }

  if (CONTEXT === 'arkhn') {
    //TODO when using pagination for fetching
    // (all patient docs have already been fetched)
    let search = ''
    let docTypesFilter = ''
    let ndaFilter = ''

    if (searchInput) {
      //TODO: API crashes when using _text search param
      search = `&_content=${searchInput}`
    }

    if (!selectedDocTypes.includes('all')) {
      docTypesFilter = `&type=${selectedDocTypes.join(',')}`
    }

    if (nda) {
      ndaFilter = `&encounter:identifier=${nda}`
    }

    const docsList = await api.get<FHIR_API_Response<IDocumentReference>>(
      `/DocumentReference?patient=${patientId}${search}${docTypesFilter}${ndaFilter}${API_RESOURCE_TAG}`
    )

    if (docsList.data.resourceType === 'OperationOutcome' || !docsList.data.total) {
      return null
    } else {
      return {
        docsTotal: docsList.data.total,
        docsList: getApiResponseResources(docsList) ?? []
      }
    }
  }
}

export const getPatientsFromPerimeter = async (providers: ScopeTreeRow[]): Promise<IPatient[]> => {
  const patientResponses = await Promise.all(
    providers
      .filter((provider) => provider.resourceType === 'HealthcareService')
      .map((provider) =>
        api.get<FHIR_API_Response<IPatient>>(
          `/Patient?_has:Encounter:subject:serviceProvider.reference=HealthcareService/${provider.id}&_count=10000`
        )
      )
  )

  const patients = patientResponses.reduce((acc: IPatient[], response) => {
    const responsePatients = getApiResponseResources(response)
    return responsePatients ? [...acc, ...responsePatients] : acc
  }, [])

  return patients
}

export const getPatientsFromCohortId = async (cohortId: string): Promise<IPatient[] | undefined> => {
  const cohort = getApiResponseResources(await api.get<FHIR_API_Response<IGroup>>(`/Group/${cohortId}`))?.[0]
  const patientReferences = cohort?.member?.map((groupMember) => groupMember.entity?.reference?.replace('Patient/', ''))

  const patients = getApiResponseResources(
    await api.get<FHIR_API_Response<IPatient>>(`/Patient?id=${patientReferences?.join(',')}&_count=10000`)
  )

  return patients
}

export const getEncounterOrProcedureDocs = async (
  data: IEncounter | IProcedure
): Promise<(CohortComposition | IDocumentReference)[]> => {
  if (CONTEXT === 'arkhn') {
    let documents: (CohortComposition | IDocumentReference)[] = []
    let encounterId: string | undefined = undefined
    switch (data.resourceType) {
      case 'Procedure':
        encounterId = data.encounter?.reference?.split('/')[1]
        break
      case 'Encounter':
        encounterId = data.id
        break
      default:
        return []
    }

    if (encounterId) {
      const [docRefsResponse, compositionsResponse] = await Promise.all([
        api.get<FHIR_API_Response<IDocumentReference>>(`/DocumentReference?encounter=${encounterId}`),
        api.get<FHIR_API_Response<IComposition>>(`/Composition?encounter=${encounterId}`)
      ])
      const docRefs = getApiResponseResources(docRefsResponse)
      const compositions = getApiResponseResources(compositionsResponse)
      if (docRefs) documents = [...documents, ...docRefs]
      if (compositions) documents = [...documents, ...compositions]
      return documents
    }
  }

  return []
}

export const fetchPatient = async (patientId: string): Promise<PatientData | undefined> => {
  if (CONTEXT === 'arkhn') {
    const [
      patientResponse,
      encounterResponse,
      procedureResponse,
      docRefResponse,
      conditionResponse,
      claimResponse,
      labObservationResponse,
      groupResponse
    ] = await Promise.all([
      api.get<FHIR_API_Response<IPatient>>(`/Patient?_id=${patientId}${API_RESOURCE_TAG}`),
      api.get<FHIR_API_Response<IEncounter>>(`/Encounter?subject=${patientId}?_sort=date${API_RESOURCE_TAG}`),
      api.get<FHIR_API_Response<IProcedure>>(`/Procedure?subject=${patientId}${API_RESOURCE_TAG}`),
      api.get<FHIR_API_Response<IDocumentReference>>(`/DocumentReference?subject=${patientId}${API_RESOURCE_TAG}`),
      api.get<FHIR_API_Response<ICondition>>(`/Condition?subject=${patientId}${API_RESOURCE_TAG}`),
      api.get<FHIR_API_Response<IClaim>>(`/Claim?patient=${patientId}${API_RESOURCE_TAG}`),
      api.get<FHIR_API_Response<IObservation>>(
        `/Observation?subject=${patientId}&category=laboratory${API_RESOURCE_TAG}`
      ),
      api.get<FHIR_API_Response<IGroup>>(`/Group?member=${patientId}&_summary=count${API_RESOURCE_TAG}`)
    ])

    const consult = getApiResponseResources(procedureResponse)
    const documents = getApiResponseResources(docRefResponse)
    const hospit = getApiResponseResources(encounterResponse)
    const ghm = getApiResponseResources(claimResponse)
    const diagnostic = getApiResponseResources(conditionResponse)
    const patient = getApiResponseResources(patientResponse)?.[0]
    const labResults = getApiResponseResources(labObservationResponse)
    const cohortPatient: CohortPatient | undefined = patient
      ? {
          ...patient,
          lastEncounter: hospit?.[0],
          lastProcedure: consult?.[0],
          mainDiagnosis: diagnostic,
          labResults,
          inclusion: groupResponse.data.resourceType === 'Bundle' ? (groupResponse.data.total || 0) > 0 : false
        }
      : undefined

    return {
      patient: cohortPatient,
      consult: consult && (await Promise.all(consult.map((c) => _ArkhnGetServiceProviderFromPMSIData(c)))),
      consultTotal: consult?.length,
      diagnostic: diagnostic && (await Promise.all(diagnostic.map((c) => _ArkhnGetServiceProviderFromPMSIData(c)))),
      diagnosticTotal: diagnostic?.length,
      documents,
      documentsTotal: documents?.length,
      ghm: ghm && (await Promise.all(ghm.map((c) => _ArkhnGetServiceProviderFromPMSIData(c)))),
      ghmTotal: ghm?.length,
      hospit
    }
  } else if (CONTEXT === 'aphp') {
    const [
      patientResponse,
      procedureResponse,
      encounterResponse,
      diagnosticResponse,
      ghmResponse,
      documentsResponse
    ] = await Promise.all([
      api.get<IPatient>(`/Patient/${patientId}`),
      api.get<FHIR_API_Response<IProcedure>>(`/Procedure?patient=${patientId}&_sort=-date&size=20`),
      api.get<FHIR_API_Response<IEncounter>>(
        `/Encounter?patient=${patientId}&type=VISIT&status=arrived,triaged,in-progress,onleave,finished,unknown&_sort=-start-date`
      ),
      api.get<FHIR_API_Response<ICondition>>(`/Condition?patient=${patientId}&_sort=-recorded-date&size=20`),
      api.get<FHIR_API_Response<IClaim>>(`/Claim?patient=${patientId}&_sort=-created&size=20`),
      api.get<FHIR_API_Response<IComposition>>(`/Composition?patient=${patientId}&size=20&_sort=-date`)
    ])

    const deidentifiedBoolean = patientResponse.data
      ? patientResponse.data.extension?.find((extension) => extension.url === 'deidentified')?.valueBoolean
      : true

    const hospit = getApiResponseResources(encounterResponse)

    const documents =
      documentsResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProviderDocs(deidentifiedBoolean, getApiResponseResources(documentsResponse))
        : undefined

    const documentsTotal = documentsResponse.data.resourceType === 'Bundle' ? documentsResponse.data.total : 0

    const consult =
      procedureResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProvider(deidentifiedBoolean, getApiResponseResources(procedureResponse))
        : undefined

    const consultTotal = procedureResponse.data.resourceType === 'Bundle' ? procedureResponse.data.total : 0

    const diagnostic =
      diagnosticResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProvider(deidentifiedBoolean, getApiResponseResources(diagnosticResponse))
        : undefined

    const diagnosticTotal = diagnosticResponse.data.resourceType === 'Bundle' ? diagnosticResponse.data.total : 0

    const ghm =
      ghmResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProvider(deidentifiedBoolean, getApiResponseResources(ghmResponse))
        : undefined

    const ghmTotal = ghmResponse.data.resourceType === 'Bundle' ? ghmResponse.data.total : 0

    const patient = patientResponse.data
      ? ({
          ...patientResponse.data,
          lastEncounter: hospit?.[0],
          lastProcedure: consult?.[0],
          lastGhm: ghm?.[0],
          mainDiagnosis: diagnostic?.filter((diagnostic: any) => {
            return diagnostic.extension?.[0].valueString === 'dp'
          })
        } as CohortPatient)
      : undefined

    return {
      hospit,
      documents,
      documentsTotal,
      consult,
      consultTotal,
      diagnostic,
      diagnosticTotal,
      ghm,
      ghmTotal,
      patient
    }
  }
}
