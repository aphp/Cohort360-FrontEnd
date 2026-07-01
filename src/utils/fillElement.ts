import { AxiosResponse } from 'axios'
import {
  Bundle,
  Claim,
  Condition,
  DocumentReference,
  Encounter,
  Identifier,
  ImagingStudy,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  Patient,
  Procedure,
  QuestionnaireResponse,
  Resource
} from 'fhir/r4'
import { fetchPatient, fetchEncounter, fetchOrganization } from 'services/aphp/callApi'
import {
  CohortComposition,
  CohortImaging,
  CohortMedication,
  CohortObservation,
  CohortPMSI,
  CohortQuestionnaireResponse,
  FHIR_API_Response,
  FHIR_Bundle_Response
} from 'types'
import { ResourceType } from 'types/requestCriterias'
import { getApiResponseResources } from './apiHelpers'
import { getConfig } from 'config'

type ResourceToFill =
  | DocumentReference
  | ImagingStudy
  | Condition
  | Procedure
  | Claim
  | MedicationRequest
  | MedicationAdministration
  | Observation
  | QuestionnaireResponse

type CohortResourceType =
  | CohortComposition
  | CohortImaging
  | CohortPMSI
  | CohortMedication<MedicationRequest | MedicationAdministration>
  | CohortObservation
  | CohortQuestionnaireResponse

export const getPatientIdPath = (element: ResourceToFill) => {
  const patientIdPath = {
    [ResourceType.DOCUMENTS]: (element as DocumentReference).subject?.reference?.replace(/^Patient\//, ''),
    [ResourceType.IMAGING]: (element as ImagingStudy).subject?.reference?.replace(/^Patient\//, ''),
    [ResourceType.CONDITION]: (element as Condition).subject?.reference?.replace(/^Patient\//, ''),
    [ResourceType.PROCEDURE]: (element as Procedure).subject?.reference?.replace(/^Patient\//, ''),
    [ResourceType.CLAIM]: (element as Claim).patient?.reference?.replace(/^Patient\//, ''),
    [ResourceType.MEDICATION_REQUEST]: (element as MedicationRequest).subject?.reference?.replace(/^Patient\//, ''),
    [ResourceType.MEDICATION_ADMINISTRATION]: (element as MedicationAdministration).subject?.reference?.replace(
      /^Patient\//,
      ''
    ),
    [ResourceType.OBSERVATION]: (element as Observation).subject?.reference?.replace(/^Patient\//, ''),
    [ResourceType.QUESTIONNAIRE_RESPONSE]: (element as QuestionnaireResponse).subject?.reference?.replace(
      /^Patient\//,
      ''
    )
  }

  return patientIdPath[element.resourceType]
}

export const getEncounterIdPath = (element: ResourceToFill) => {
  const encounterIdPath = {
    [ResourceType.DOCUMENTS]: (element as DocumentReference).context?.encounter?.[0]?.reference?.replace(
      /^Encounter\//,
      ''
    ),
    [ResourceType.IMAGING]: (element as ImagingStudy).encounter?.reference?.replace(/^Encounter\//, ''),
    [ResourceType.CONDITION]: (element as Condition).encounter?.reference?.replace(/^Encounter\//, ''),
    [ResourceType.PROCEDURE]: (element as Procedure).encounter?.reference?.replace(/^Encounter\//, ''),
    [ResourceType.CLAIM]: (element as Claim).item?.[0].encounter?.[0]?.reference?.replace(/^Encounter\//, ''),
    [ResourceType.MEDICATION_REQUEST]: (element as MedicationRequest).encounter?.reference?.replace(/^Encounter\//, ''),
    [ResourceType.MEDICATION_ADMINISTRATION]: (element as MedicationAdministration).context?.reference?.replace(
      /^Encounter\//,
      ''
    ),
    [ResourceType.OBSERVATION]: (element as Observation).encounter?.reference?.replace(/^Encounter\//, ''),
    [ResourceType.QUESTIONNAIRE_RESPONSE]: (element as QuestionnaireResponse).encounter?.reference?.replace(
      /^Encounter\//,
      ''
    )
  }

  return encounterIdPath[element.resourceType]
}

export const retrieveEncounterIds = (elementEntries: ResourceToFill[]) => {
  return elementEntries
    .map((e) => getEncounterIdPath(e))
    .filter((item, index, array) => array.indexOf(item) === index)
    .join()
}

export const retrievePatientIds = (elementEntries: ResourceToFill[]) => {
  return elementEntries
    .map((e) => getPatientIdPath(e))
    .filter((item, index, array) => array.indexOf(item) === index)
    .join()
}

const retrieveOrganizationIds = (elementEntries: DocumentReference[]) => {
  const ids = elementEntries.flatMap(
    (entry) => entry.author?.map((a) => a.reference?.replace(/^Organization\//, '')).filter((id) => !!id) ?? []
  )

  return [...new Set(ids)]
}

export const getLinkedPatient = (patients: Patient[], entry: ResourceToFill) => {
  const patientId = getPatientIdPath(entry)
  return patients.find((patient) => patient.id === patientId)
}

export const getLinkedEncounter = (encounters: Encounter[], entry: ResourceToFill) => {
  const encounterId = getEncounterIdPath(entry)
  return encounters.find((encounter) => encounter.id === encounterId)
}

export const fillServiceProviderWithOrganization = async (entries: DocumentReference[]) => {
  const organizationIds = retrieveOrganizationIds(entries).join()
  const organizations = await fetchOrganization(organizationIds)
  const _organizations = getApiResponseResources(organizations) ?? []

  const UF_CODE = 'Unité Fonctionnelle (UF)'

  const ufs = _organizations.filter(
    (org) => org.type?.some((typeEntry) => typeEntry.coding?.some((coding) => coding.code === UF_CODE)) ?? false
  )

  return entries.map((entry) => {
    const organizationReferences = entry.author?.map((a) => a.reference) ?? []
    const matchingUf = ufs.find((uf) => organizationReferences.includes(`Organization/${uf.id}`))

    if (matchingUf) {
      return {
        ...entry,
        serviceProvider: matchingUf.name
      }
    }

    return entry
  })
}

const fillEntriesWithLinkedResources = <T extends ResourceToFill, U extends CohortResourceType>(
  elementEntries: T[],
  deidentifiedBoolean: boolean,
  patients: Patient[],
  encounters: Encounter[]
): U[] => {
  const appConfig = getConfig()

  return elementEntries.map((entry) => {
    const idPatient = retrievePatientIds([entry])
    const IPP = deidentifiedBoolean
      ? idPatient
      : getLinkedPatient(patients, entry)?.identifier?.find(
          (object: Identifier) =>
            object?.type?.coding?.[0].code === appConfig.features.patient.patientIdentifierExtensionCode?.code &&
            object?.type?.coding?.[0].system === appConfig.features.patient.patientIdentifierExtensionCode?.system
        )?.value

    const linkedEncounter = getLinkedEncounter(encounters, entry)
    const NDA = deidentifiedBoolean
      ? retrieveEncounterIds([entry])
      : linkedEncounter?.identifier?.find((object: Identifier) => object?.type?.coding?.[0].code === 'NDA')?.value

    const serviceProvider = linkedEncounter?.serviceProvider?.display ?? 'Non renseigné'

    return {
      ...entry,
      idPatient,
      IPP: IPP ?? 'Inconnu',
      NDA: NDA ?? 'Inconnu',
      serviceProvider
    } as unknown as U
  })
}

const withDocumentOrganizations = async <U extends CohortResourceType>(filledEntries: U[]): Promise<U[]> => {
  if (filledEntries.length > 0 && filledEntries[0].resourceType === ResourceType.DOCUMENTS) {
    return (await fillServiceProviderWithOrganization(filledEntries as DocumentReference[])) as U[]
  }

  return filledEntries
}

export const isEncounterResource = (resource: Resource | undefined): resource is Encounter => {
  return resource?.resourceType === 'Encounter'
}

export const isPatientResource = (resource: Resource | undefined): resource is Patient => {
  return resource?.resourceType === 'Patient'
}

export const getBundleResources = <T>(response: { data: FHIR_Bundle_Response<T> }): Resource[] => {
  if (response.data.resourceType !== 'Bundle') return []

  return (
    response.data.entry
      ?.map((entry) => entry.resource as unknown as Resource | undefined)
      .filter((resource): resource is Resource => !!resource) ?? []
  )
}

export const getResourceInfosFromBundle = async <T extends ResourceToFill, U extends CohortResourceType>(
  elementEntries: T[],
  deidentifiedBoolean: boolean,
  patients: Patient[],
  encounters: Encounter[]
): Promise<U[]> => {
  const filledEntries = fillEntriesWithLinkedResources<T, U>(elementEntries, deidentifiedBoolean, patients, encounters)

  return await withDocumentOrganizations(filledEntries)
}

export const getResourceInfos = async <T extends ResourceToFill, U extends CohortResourceType>(
  elementEntries: T[],
  deidentifiedBoolean: boolean,
  groupId?: string,
  signal?: AbortSignal
): Promise<U[]> => {
  const listePatientsIds = retrievePatientIds(elementEntries)
  const listeEncounterIds = retrieveEncounterIds(elementEntries)

  let patients: AxiosResponse<FHIR_API_Response<Bundle<Patient>>> = {} as AxiosResponse

  if (!deidentifiedBoolean) {
    patients = await fetchPatient({
      _id: listePatientsIds,
      _list: groupId ? [groupId] : [],
      _elements: ['extension', 'id', 'identifier'],
      signal: signal
    })
  }

  const encounters = await fetchEncounter({
    _id: listeEncounterIds,
    _list: groupId ? [groupId] : [],
    _elements: ['status', 'serviceProvider', 'identifier', 'partOf'],
    signal: signal
  })
  const _patients = getApiResponseResources(patients) ?? []
  const _encounters = getApiResponseResources(encounters) ?? []
  const filledEntries = fillEntriesWithLinkedResources<T, U>(
    elementEntries,
    deidentifiedBoolean,
    _patients,
    _encounters
  )

  return await withDocumentOrganizations(filledEntries)
}
