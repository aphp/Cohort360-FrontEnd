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
  QuestionnaireResponse
} from 'fhir/r4'
import { fetchPatient, fetchEncounter } from 'services/aphp/callApi'
import {
  CohortComposition,
  CohortImaging,
  CohortMedication,
  CohortObservation,
  CohortPMSI,
  CohortQuestionnaireResponse,
  FHIR_API_Response
} from 'types'
import { ResourceType } from 'types/requestCriterias'
import { getApiResponseResources } from './apiHelpers'

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

export const getLinkedPatient = (patients: Patient[], entry: ResourceToFill) => {
  const patientId = getPatientIdPath(entry)
  return patients.find((patient) => patient.id === patientId)
}

export const getLinkedEncounter = (encounters: Encounter[], entry: ResourceToFill) => {
  const encounterId = getEncounterIdPath(entry)
  return encounters.find((encounter) => encounter.id === encounterId)
}

export const getResourceInfos = async <
  T extends ResourceToFill,
  U extends
    | CohortComposition
    | CohortImaging
    | CohortPMSI
    | CohortMedication<MedicationRequest | MedicationAdministration>
    | CohortObservation
    | CohortQuestionnaireResponse
>(
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

  const filledEntries: U[] = elementEntries.map((entry) => {
    const idPatient = retrievePatientIds([entry])
    const IPP = deidentifiedBoolean
      ? idPatient
      : getLinkedPatient(_patients, entry)?.identifier?.find(
          (object: Identifier) => object?.type?.coding?.[0].code === 'IPP'
        )?.value

    const linkedEncounter = getLinkedEncounter(_encounters, entry)
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

  return filledEntries
}
