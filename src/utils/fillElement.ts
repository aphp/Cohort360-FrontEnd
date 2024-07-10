import { AxiosResponse } from 'axios'
import { Bundle, DocumentReference, Encounter, Identifier, ImagingStudy, Patient } from 'fhir/r4'
import { fetchPatient, fetchEncounter } from 'services/aphp/callApi'
import { CohortComposition, CohortImaging, FHIR_API_Response } from 'types'
import { ResourceType } from 'types/requestCriterias'
import { getApiResponseResources } from './apiHelpers'

const retrieveEncounterIds = (elementEntries: (DocumentReference | ImagingStudy)[]) => {
  return elementEntries
    .map((e) =>
      e.resourceType === ResourceType.DOCUMENTS
        ? e.context?.encounter?.[0]?.reference?.replace(/^Encounter\//, '')
        : e.encounter?.reference?.replace(/^Encounter\//, '')
    )
    .filter((item, index, array) => array.indexOf(item) === index)
    .join()
}

const retrievePatientIds = (elementEntries: (DocumentReference | ImagingStudy)[]) => {
  return elementEntries
    .map((e) => e.subject?.reference?.replace(/^Patient\//, ''))
    .filter((item, index, array) => array.indexOf(item) === index)
    .join()
}

const getLinkedPatient = (patients: Patient[], entry: DocumentReference | ImagingStudy) => {
  const patientId = entry.subject?.reference?.replace(/^Patient\//, '')
  return patients.find((patient) => patient.id === patientId)
}

const getLinkedEncounter = (encounters: Encounter[], entry: DocumentReference | ImagingStudy) => {
  const encounterLocation =
    entry.resourceType === ResourceType.DOCUMENTS ? entry.context?.encounter?.[0] : entry.encounter
  const encounterId = encounterLocation?.reference?.replace(/^Encounter\//, '')
  return encounters.find((encounter) => encounter.id === encounterId)
}

export const getResourceInfos = async <
  T extends DocumentReference | ImagingStudy,
  U extends CohortComposition | CohortImaging
>(
  elementEntries: T[],
  deidentifiedBoolean: boolean,
  groupId?: string,
  signal?: AbortSignal
): Promise<U[]> => {
  const listePatientsIds = retrievePatientIds(elementEntries)
  const listeEncounterIds = retrieveEncounterIds(elementEntries)

  let patients: AxiosResponse<FHIR_API_Response<Bundle<Patient>>> = {} as AxiosResponse
  let encounters: AxiosResponse<FHIR_API_Response<Bundle<Encounter>>> = {} as AxiosResponse

  if (!deidentifiedBoolean) {
    patients = await fetchPatient({
      _id: listePatientsIds,
      _list: groupId ? [groupId] : [],
      _elements: ['extension', 'id', 'identifier'],
      signal: signal
    })
  }

  encounters = await fetchEncounter({
    _id: listeEncounterIds,
    _list: groupId ? [groupId] : [],
    _elements: ['status', 'serviceProvider', 'identifier', 'partOf'],
    signal: signal,
    visit: true
  })
  if (encounters.data.resourceType !== 'Bundle' || !encounters.data.entry) {
    return []
  }
  const _patients = getApiResponseResources(patients) ?? []
  const _encounters = getApiResponseResources(encounters)?.filter((encounter) => !encounter.partOf) ?? []

  const filledEntries: U[] = elementEntries.map((entry) => {
    const linkedPatient = !deidentifiedBoolean ? getLinkedPatient(_patients, entry) : undefined
    const linkedEncounter = getLinkedEncounter(_encounters, entry)

    const idPatient = retrievePatientIds([entry])
    const IPP = !deidentifiedBoolean
      ? linkedPatient?.identifier?.find((object: Identifier) => object?.type?.coding?.[0].code === 'IPP')?.value ??
        'Inconnu'
      : retrievePatientIds([entry]) !== ''
      ? retrievePatientIds([entry])
      : 'Inconnu'

    const NDA = !deidentifiedBoolean
      ? linkedEncounter?.identifier?.find((object: Identifier) => object?.type?.coding?.[0].code === 'NDA')?.value ??
        'Inconnu'
      : retrieveEncounterIds([entry]) !== ''
      ? retrieveEncounterIds([entry])
      : 'Inconnu'

    const serviceProvider = linkedEncounter?.serviceProvider?.display ?? 'Non renseigné'

    return {
      ...entry,
      idPatient,
      IPP,
      NDA,
      serviceProvider
    } as unknown as U
  })

  return filledEntries
}
