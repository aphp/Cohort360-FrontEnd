import api from '../apiFhir'
import { CONTEXT, API_RESOURCE_TAG } from '../../constants'
import {
  CohortPatient,
  CohortComposition,
  PMSIEntry,
  FHIR_API_Response,
  ScopeTreeRow,
  PatientData,
  CohortEncounter
} from 'types'
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
import fakePatients from 'data/fakeData/patients'
import fakeEncounters from 'data/fakeData/encounters'
import fakeConditions from 'data/fakeData/conditions'
import fakeProcedures from 'data/fakeData/procedures'
import fakeClaims from 'data/fakeData/claims'
import fakeDocuments from 'data/fakeData/documents'
import { getApiResponseResources } from 'utils/apiHelpers'

export const fetchPatientsCount = async (): Promise<number | undefined> => {
  if (CONTEXT === 'fakedata') {
    return 12
  } else if (CONTEXT === 'arkhn') {
    return undefined
  } else {
    const response = await api.get<FHIR_API_Response<IPatient>>('Patient?size=0')

    if (response?.data?.resourceType === 'OperationOutcome') return undefined

    return response.data.total
  }
}

export const fillNDAAndServiceProviderDocs = async (
  deidentifiedBoolean?: boolean,
  docs?: CohortComposition[],
  groupId?: string
) => {
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

  const groupFilter = groupId ? `&_list=${groupId}` : ''

  const encounters = await api.get<FHIR_API_Response<IEncounter>>(
    `/Encounter?_id=${noDuplicatesList.join()}&type=VISIT&_elements=status,serviceProvider,identifier${groupFilter}`
  )
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
  pmsi?: T[],
  groupId?: string
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

  const groupFilter = groupId ? `&_list=${groupId}` : ''

  const encounters = await api.get<FHIR_API_Response<IEncounter>>(
    `/Encounter?_id=${noDuplicatesList}&type=VISIT&_elements=serviceProvider,identifier${groupFilter}`
  )

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
  diagnosticTypes: string[],
  sortBy: string,
  sortDirection: string,
  groupId?: string,
  startDate?: string | null,
  endDate?: string | null
): Promise<{
  pmsiData?: PMSIEntry<IClaim | ICondition | IProcedure>[]
  pmsiTotal?: number
}> => {
  if (CONTEXT === 'fakedata') {
    let pmsiData = []

    switch (selectedTab) {
      case 'CIM10':
        pmsiData = fakeConditions as PMSIEntry<ICondition>[]
        break
      case 'CCAM':
        pmsiData = fakeProcedures as PMSIEntry<IProcedure>[]
        break
      case 'GHM':
        pmsiData = fakeClaims as PMSIEntry<IClaim>[]
        break
      default:
        pmsiData = fakeConditions
    }

    const pmsiTotal = pmsiData.length

    return {
      // @ts-ignore
      pmsiData,
      pmsiTotal
    }
  }
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
    let diagnosticTypesFilter = ''
    let _sortBy = sortBy
    const _sortDirection = sortDirection === 'desc' ? '-' : ''
    let dateFilter = ''
    const groupFilter = groupId ? `&_list=${groupId}` : ''

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

    if (sortBy === 'date') {
      _sortBy = dateName
    } else if (sortBy === 'code') {
      _sortBy = codeName
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

    if (selectedTab === 'CIM10' && diagnosticTypes.length > 0) {
      diagnosticTypesFilter = `&type=${diagnosticTypes.join()}`
    }

    if (startDate || endDate) {
      if (startDate && endDate) {
        dateFilter = `&${dateName}=ge${startDate}&${dateName}=le${endDate}`
      } else if (startDate) {
        dateFilter = `&${dateName}=ge${startDate}`
      } else if (endDate) {
        dateFilter = `&${dateName}=le${endDate}`
      }
    }

    const pmsiResp = await api.get<FHIR_API_Response<IClaim | IProcedure | ICondition>>(
      `${resource}?patient=${patientId}&_sort=${_sortDirection}${_sortBy}&size=20&offset=${
        (page - 1) * 20
      }${search}${ndaFilter}${codeFilter}${diagnosticTypesFilter}${dateFilter}${groupFilter}`
    )

    const pmsiData =
      pmsiResp.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProvider(deidentified, getApiResponseResources(pmsiResp), groupId)
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
  sortBy: string,
  sortDirection: string,
  page: number,
  patientId: string,
  searchInput: string,
  selectedDocTypes: string[],
  nda: string,
  startDate?: string | null,
  endDate?: string | null,
  groupId?: string
) => {
  if (CONTEXT === 'fakedata') {
    const docsList = fakeDocuments as CohortComposition[]

    return {
      docsTotal: docsList.length,
      docsList: docsList
    }
  }
  if (CONTEXT === 'aphp') {
    const _sortDirection = sortDirection === 'desc' ? '-' : ''
    const docTypesFilter = selectedDocTypes.length > 0 ? `&type=${selectedDocTypes.join()}` : []
    const search = searchInput ? `&_text=${searchInput}` : ''
    const ndaFilter = nda ? `&encounter.identifier=${nda}` : ''
    const groupFilter = groupId ? `&_list=${groupId}` : ''
    let dateFilter = ''
    let elements = ''

    if (startDate || endDate) {
      if (startDate && endDate) {
        dateFilter = `&date=ge${startDate}&date=le${endDate}`
      } else if (startDate) {
        dateFilter = `&date=ge${startDate}`
      } else if (endDate) {
        dateFilter = `&date=le${endDate}`
      }
    }

    if (!search) {
      elements = '&_elements=status,type,encounter,date,title'
    }

    const docsList = await api.get<any>(
      `/Composition?type:not=doc-impor&patient=${patientId}&_sort=${_sortDirection}${sortBy}&size=20&offset=${
        page ? (page - 1) * 20 : 0
      }&status=final${elements}${search}${docTypesFilter}${ndaFilter}${dateFilter}${groupFilter}`
    )

    if (!docsList.data.total) {
      return null
    } else {
      return {
        docsTotal: docsList.data.total,
        docsList: await fillNDAAndServiceProviderDocs(deidentified, getApiResponseResources(docsList), groupId)
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
  data: CohortEncounter | PMSIEntry<IProcedure>
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
        api.get<FHIR_API_Response<IComposition>>(`/Composition?type:not=doc-impor&encounter=${encounterId}`)
      ])
      const docRefs = getApiResponseResources(docRefsResponse)
      const compositions = getApiResponseResources(compositionsResponse)
      if (docRefs) documents = [...documents, ...docRefs]
      if (compositions) documents = [...documents, ...compositions]
      return documents
    }
  }

  if (CONTEXT === 'aphp') {
    return data.documents ?? []
  }
  return []
}

const getEncounterDocuments = async (
  encounters?: CohortEncounter[],
  deidentifiedBoolean?: boolean,
  groupId?: string
) => {
  if (!encounters) return undefined
  if (encounters.length === 0) return encounters

  const _encounters = encounters

  const encountersList: any[] = []

  _encounters.forEach((encounter) => {
    encounter.documents = []
    encountersList.push(encounter.id)
  })

  const documentsResp = await api.get<FHIR_API_Response<IComposition>>(
    `/Composition?type:not=doc-impor&encounter=${encountersList}&_elements=status,type,subject,encounter,date,title`
  )

  const documents =
    documentsResp.data.resourceType === 'Bundle'
      ? await fillNDAAndServiceProviderDocs(deidentifiedBoolean, getApiResponseResources(documentsResp), groupId)
      : undefined

  if (!documents) return _encounters

  documents.forEach((document) => {
    const encounterIndex = _encounters.findIndex((encounter) => encounter.id === document.encounter?.display?.slice(10))

    if (!encounterIndex) return

    _encounters[encounterIndex].documents?.push(document)
  })

  return _encounters
}

const getProcedureDocuments = async (
  procedures?: PMSIEntry<IProcedure>[],
  deidentifiedBoolean?: boolean,
  groupId?: string
) => {
  if (!procedures) return undefined
  if (procedures.length === 0) return procedures
  const _procedures = procedures

  let encountersList: any[] = []

  _procedures.forEach((procedure) => {
    procedure.documents = []
    encountersList.push(procedure.encounter?.reference?.slice(10))
  })

  encountersList = encountersList.filter((item, index, array) => array.indexOf(item) === index)

  const documentsResp = await api.get<FHIR_API_Response<IComposition>>(
    `/Composition?type:not=doc-impor&encounter=${encountersList}&_elements=status,type,subject,encounter,date,title`
  )

  const documents =
    documentsResp.data.resourceType === 'Bundle'
      ? await fillNDAAndServiceProviderDocs(deidentifiedBoolean, getApiResponseResources(documentsResp), groupId)
      : undefined

  if (!documents) return _procedures

  documents.forEach((document) => {
    const procedureIndex = _procedures.findIndex(
      (procedure) => procedure.encounter?.reference === document.encounter?.display
    )

    if (!procedureIndex) return

    _procedures[procedureIndex].documents?.push(document)
  })

  return _procedures
}

export const fetchPatient = async (patientId: string, groupId?: string): Promise<PatientData | undefined> => {
  if (CONTEXT === 'fakedata') {
    const patientData = fakePatients[0]
    const hospit = fakeEncounters as IEncounter[]
    const documents = fakeDocuments as CohortComposition[]
    const documentsTotal = fakeDocuments.length
    const consult = fakeProcedures as PMSIEntry<IProcedure>[]
    const consultTotal = fakeProcedures.length
    const diagnostic = fakeConditions as PMSIEntry<ICondition>[]
    const diagnosticTotal = fakeConditions.length
    const ghm = fakeClaims as PMSIEntry<IClaim>[]
    const ghmTotal = fakeClaims.length

    const patient = {
      ...patientData,
      lastEncounter: hospit[0],
      lastProcedure: consult[0],
      lastGhm: ghm[0],
      mainDiagnosis: diagnostic?.filter((diagnostic: any) => {
        return diagnostic.extension?.[0].valueString === 'dp'
      })
    } as CohortPatient

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
    const groupFilter = groupId ? `&_list=${groupId}` : ''

    const [patientResponse, procedureResponse, encounterResponse, diagnosticResponse, ghmResponse, documentsResponse] =
      await Promise.all([
        api.get<FHIR_API_Response<IPatient>>(`/Patient?_id=${patientId}${groupFilter}`),
        api.get<FHIR_API_Response<IProcedure>>(
          `/Procedure?patient=${patientId}&_sort=-date&status=completed&size=20${groupFilter}`
        ),
        api.get<FHIR_API_Response<IEncounter>>(
          `/Encounter?patient=${patientId}&type=VISIT&status=arrived,triaged,in-progress,onleave,finished,unknown&_sort=-start-date${groupFilter}`
        ),
        api.get<FHIR_API_Response<ICondition>>(
          `/Condition?patient=${patientId}&_sort=-recorded-date&size=20${groupFilter}`
        ),
        api.get<FHIR_API_Response<IClaim>>(`/Claim?patient=${patientId}&_sort=-created&size=20${groupFilter}`),
        api.get<FHIR_API_Response<IComposition>>(
          `/Composition?type:not=doc-impor&patient=${patientId}&size=20&_sort=-date&status=final&_elements=status,type,encounter,date,title${groupFilter}`
        )
      ])

    const patientData = getApiResponseResources(patientResponse)

    const deidentifiedBoolean =
      patientData && patientData[0]
        ? patientData[0].extension?.find((extension) => extension.url === 'deidentified')?.valueBoolean
        : true

    const hospit = await getEncounterDocuments(getApiResponseResources(encounterResponse), deidentifiedBoolean, groupId)

    const documents =
      documentsResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProviderDocs(deidentifiedBoolean, getApiResponseResources(documentsResponse), groupId)
        : undefined

    const documentsTotal = documentsResponse.data.resourceType === 'Bundle' ? documentsResponse.data.total : 0

    const consult =
      procedureResponse.data.resourceType === 'Bundle'
        ? await getProcedureDocuments(
            await fillNDAAndServiceProvider(deidentifiedBoolean, getApiResponseResources(procedureResponse), groupId),
            deidentifiedBoolean,
            groupId
          )
        : undefined

    const consultTotal = procedureResponse.data.resourceType === 'Bundle' ? procedureResponse.data.total : 0

    const diagnostic =
      diagnosticResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProvider(deidentifiedBoolean, getApiResponseResources(diagnosticResponse), groupId)
        : undefined

    const diagnosticTotal = diagnosticResponse.data.resourceType === 'Bundle' ? diagnosticResponse.data.total : 0

    const ghm =
      ghmResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProvider(deidentifiedBoolean, getApiResponseResources(ghmResponse), groupId)
        : undefined

    const ghmTotal = ghmResponse.data.resourceType === 'Bundle' ? ghmResponse.data.total : 0

    const patient = patientResponse.data
      ? ({
          ...patientData?.[0],
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
