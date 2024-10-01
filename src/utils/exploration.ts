import { ResourceType, VitalStatusLabel } from 'types/requestCriterias'
import { Filters, SearchCriterias } from 'types/searchCriterias'
import { removeKeys } from './map'
import {
  MedicationRequest,
  MedicationAdministration,
  QuestionnaireResponse,
  ImagingStudy,
  Observation,
  DocumentReference,
  Patient
} from 'fhir/r4'
import { ExplorationResults, CohortPMSI, CohortMedication } from 'types'
import { PatientsResponse } from 'types/patient'
import { Status } from 'components/ui/StatusChip'
import { capitalizeFirstLetter } from './capitalize'
import { getAge } from './age'
import moment from 'moment'
import { Data, DataType } from 'types/exploration'

export const narrowSearchCriterias = (
  deidentified: boolean,
  searchCriterias: SearchCriterias<Filters>,
  type: ResourceType,
  isPatient: boolean
): SearchCriterias<Filters> => {
  const baseFiltersToRemove = [...(deidentified ? ['ipp', 'nda'] : []), ...(isPatient ? ['ipp'] : [])]
  const keysToRemove: Partial<Record<ResourceType, string[]>> = {
    [ResourceType.PROCEDURE]: ['diagnosticTypes'],
    [ResourceType.CLAIM]: ['source', 'diagnosticTypes'],
    [ResourceType.MEDICATION_ADMINISTRATION]: ['prescriptionTypes'],
    [ResourceType.MEDICATION_REQUEST]: ['administrationRoutes'],
    ...(deidentified ? { [ResourceType.DOCUMENTS]: ['onlyPdfAvailable'] } : {})
  }
  const shouldKeepSearchInput =
    type !== ResourceType.QUESTIONNAIRE_RESPONSE && !(deidentified && type === ResourceType.PATIENT)
  const shouldKeepSearchBy = type === ResourceType.DOCUMENTS || (type === ResourceType.PATIENT && !deidentified)

  const mapFilters = <T extends Filters>(criterias: SearchCriterias<T>): SearchCriterias<T> => {
    let filters = removeKeys(criterias.filters, baseFiltersToRemove as (keyof T)[])
    if (keysToRemove[type]) filters = removeKeys(filters, keysToRemove[type] as (keyof T)[])
    let narrowedCriterias = removeKeys(criterias, ['searchBy', 'searchInput'] as (keyof SearchCriterias<T>)[])
    if (shouldKeepSearchInput) narrowedCriterias = { ...narrowedCriterias, searchInput: criterias.searchInput }
    if (shouldKeepSearchBy) narrowedCriterias = { ...narrowedCriterias, searchBy: criterias.searchBy }
    return { ...narrowedCriterias, filters }
  }

  return mapFilters(searchCriterias)
}

export const isPatientsResponse = (data: Data): data is PatientsResponse => {
  return 'originalPatients' in data
}

export const isOtherResourcesResponse = (data: Data): data is ExplorationResults<DataType> => {
  return 'list' in data
}

export const isPmsi = (data: ExplorationResults<DataType>): data is ExplorationResults<CohortPMSI> => {
  const type = data.list[0].resourceType
  return type === ResourceType.CONDITION || type === ResourceType.PROCEDURE || type === ResourceType.CLAIM
}

export const isQuestionnaire = (
  data: ExplorationResults<DataType>
): data is ExplorationResults<QuestionnaireResponse> => {
  const type = data.list[0].resourceType
  return type === ResourceType.QUESTIONNAIRE_RESPONSE
}

export const isImaging = (data: ExplorationResults<DataType>): data is ExplorationResults<ImagingStudy> => {
  const type = data.list[0].resourceType
  return type === ResourceType.IMAGING
}

export const isBiology = (data: ExplorationResults<DataType>): data is ExplorationResults<Observation> => {
  const type = data.list[0].resourceType
  return type === ResourceType.OBSERVATION
}

export const isMedication = (
  data: ExplorationResults<DataType>
): data is ExplorationResults<CohortMedication<MedicationRequest | MedicationAdministration>> => {
  const type = data.list[0].resourceType
  return type === ResourceType.MEDICATION_ADMINISTRATION || type === ResourceType.MEDICATION_REQUEST
}

export const isDocuments = (data: ExplorationResults<DataType>): data is ExplorationResults<DocumentReference> => {
  const type = data.list[0].resourceType
  return type === ResourceType.DOCUMENTS
}

export const getPatientInfos = (patient: Patient, deidentified: boolean, groupId: string[]) => {
  const vitalStatus = {
    label: patient.deceasedBoolean || patient.deceasedDateTime ? VitalStatusLabel.DECEASED : VitalStatusLabel.ALIVE,
    status: patient.deceasedBoolean || patient.deceasedDateTime ? Status.CANCELLED : Status.VALID
  }
  const lastEncounter = patient.extension?.[3]?.valueReference?.display ?? ''
  const surname = deidentified
    ? 'Prénom'
    : patient.name?.[0].given?.[0]
    ? capitalizeFirstLetter(patient.name?.[0].given?.[0])
    : 'Non renseigné'
  const lastname = deidentified
    ? 'Nom'
    : patient.name
        ?.map((e) => {
          if (e.use === 'official') {
            return e.family ?? 'Non renseigné'
          }
          if (e.use === 'maiden') {
            return `(${patient.gender === 'female' ? 'née' : 'né'} : ${e.family})`
          }
        })
        .join(' ') ?? 'Non renseigné'
  const ipp = {
    label: deidentified
      ? patient.id
      : patient.identifier?.find((identifier) => identifier.type?.coding?.[0].code === 'IPP')?.value ??
        patient.identifier?.[0].value ??
        'IPP inconnnu',
    url: `/patients/${patient.id}${groupId ? `?groupId=${groupId}` : ''}` /*${_search}*/
  }
  const age = {
    age: getAge(patient) ?? 'Non renseigné',
    birthdate: deidentified ? 'Non renseigné' : moment(patient.birthDate).format('DD/MM/YYYY') ?? 'Non renseigné'
  }
  const gender = patient.gender?.toLocaleUpperCase() ?? ''
  return { vitalStatus, lastEncounter, surname, lastname, ipp, age, gender }
}
