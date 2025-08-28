import {
  Procedure,
  Condition,
  Claim,
  DocumentReference,
  MedicationRequest,
  MedicationAdministration,
  Observation,
  ImagingStudy,
  QuestionnaireResponse,
  Period,
  Identifier
} from 'fhir/r4'
import { CohortEncounter, CohortComposition } from 'types'
import { ResourceType } from 'types/requestCriterias'

export function linkElementWithEncounter<
  T extends
    | Procedure
    | Condition
    | Claim
    | DocumentReference
    | MedicationRequest
    | MedicationAdministration
    | Observation
    | ImagingStudy
    | QuestionnaireResponse
>(elementEntries: T[], encounterList: CohortEncounter[], deidentifiedBoolean: boolean) {
  let elementList: (T & {
    serviceProvider?: string
    NDA?: string
    documents?: CohortComposition[]
    hospitDates?: string[]
  })[] = []

  for (const entry of elementEntries) {
    let newElement = entry as T & {
      serviceProvider?: string
      NDA?: string
      documents?: CohortComposition[]
      hospitDates?: string[]
    }

    let encounterId = ''
    switch (entry.resourceType) {
      case ResourceType.CLAIM:
        encounterId = entry.item?.[0].encounter?.[0].reference?.replace(/^Encounter\//, '') ?? ''
        break
      case ResourceType.PROCEDURE:
      case ResourceType.CONDITION:
      case ResourceType.MEDICATION_REQUEST:
      case ResourceType.OBSERVATION:
      case ResourceType.IMAGING:
      case ResourceType.QUESTIONNAIRE_RESPONSE:
        encounterId = entry.encounter?.reference?.replace(/^Encounter\//, '') ?? ''
        break
      case ResourceType.DOCUMENTS:
        encounterId = entry.context?.encounter?.[0].reference?.replace(/^Encounter\//, '') ?? ''
        break
      case ResourceType.MEDICATION_ADMINISTRATION:
        encounterId = entry.context?.reference?.replace(/^Encounter\//, '') ?? ''
        break
    }

    const foundEncounter = encounterList.find(({ id }) => id === encounterId) ?? null
    const foundEncounterWithDetails =
      encounterList.find(({ details }) => details?.find(({ id }) => id === encounterId)) ?? null

    newElement = fillElementInformation(
      deidentifiedBoolean,
      newElement,
      foundEncounterWithDetails ?? foundEncounter,
      encounterId,
      newElement.resourceType
    )

    elementList = [...elementList, newElement]
  }

  return elementList
}

function fillElementInformation<
  T extends
    | Procedure
    | Condition
    | Claim
    | DocumentReference
    | MedicationRequest
    | MedicationAdministration
    | Observation
    | ImagingStudy
    | QuestionnaireResponse
>(
  deidentifiedBoolean: boolean,
  element: T,
  encounter: CohortEncounter | null,
  encounterId: string,
  resourceType: string
) {
  const newElement = element as T & {
    serviceProvider?: string
    NDA?: string
    documents?: CohortComposition[]
    hospitDates?: Period
  }

  const encounterIsDetailed = encounter?.id !== encounterId

  if (!encounterIsDetailed) {
    newElement.serviceProvider = encounter?.serviceProvider?.display ?? 'Non renseigné'
  } else {
    const foundEncounterDetail =
      // @ts-ignore
      encounter?.details?.find(({ id }) => id === encounterId) ?? encounter
    newElement.serviceProvider = foundEncounterDetail?.serviceProvider?.display ?? 'Non renseigné'
  }

  newElement.NDA = encounter?.id ?? 'Inconnu'

  if (!deidentifiedBoolean && encounter?.identifier) {
    const nda = encounter.identifier.find((identifier: Identifier) => identifier.type?.coding?.[0].code === 'NDA')
    if (nda) {
      newElement.NDA = nda?.value ?? 'Inconnu'
    }
  }

  if (resourceType !== ResourceType.DOCUMENTS && encounter?.documents && encounter.documents.length > 0) {
    newElement.documents = encounter.documents
  }

  if (resourceType === ResourceType.QUESTIONNAIRE_RESPONSE) {
    newElement.hospitDates = encounter?.period
  }

  return newElement
}
