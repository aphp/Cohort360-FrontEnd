import moment from 'moment'
import { ScopeTreeRow } from 'types'
import {
  Comparators,
  DocType,
  LabelCriteriaObject,
  MedicationType,
  MedicationTypeLabel,
  RessourceType,
  VitalStatusLabel
} from 'types/requestCriterias'
import { DurationRangeType, SearchByTypes, VitalStatus } from 'types/searchCriterias'
import allDocTypes from 'assets/docTypes.json'
import { getDurationRangeLabel } from './age'
import { displaySystem } from './displayValueSetSystem'
import { useAppSelector } from 'state'

const getVitalStatusLabel = (value: VitalStatus) => {
  switch (value) {
    case VitalStatus.ALIVE:
      return VitalStatusLabel.ALIVE
    case VitalStatus.DECEASED:
      return VitalStatusLabel.DECEASED
    default:
      return VitalStatusLabel.ALL
  }
}

const getMedicationTypeLabel = (type: MedicationType) => {
  switch (type) {
    case MedicationType.Request:
      return MedicationTypeLabel.Request
    case MedicationType.Administration:
      return MedicationTypeLabel.Administration
  }
}

const getLabelFromCriteriaObject = (values: LabelCriteriaObject[], resourceType?: RessourceType) => {
  const { criteria } = useAppSelector((state) => state.cohortCreation)
  console.log('test criteria', criteria)
  console.log('test values', values)
  const labels = values
    .map((value) => {
      console.log('test value', value)
      console.log('test resourceType', resourceType)
      criteria.map((criterion) => {
        console.log('test criterion', criterion)
        if (
          resourceType === RessourceType.MEDICATION_REQUEST ||
          resourceType === RessourceType.MEDICATION_ADMINISTRATION
        ) {
          if (criterion.data.id === value.id) {
            return `${displaySystem(criterion.data.system)} ${criterion.data.label}`
          }
        }
        if (criterion.id === resourceType) {
          if (resourceType === RessourceType.ENCOUNTER) {
            console.log('test je suis dans le encounter')
          }
          if (criterion.data.id === value.id) {
            return `${displaySystem(criterion.data.system)} ${criterion.data.label}`
          }
        }
      })
    })
    .join(' - ')
  return labels
}

const getLabelFromName = (values: ScopeTreeRow[]) => {
  const labels = values.map((value) => value.name).join(' - ')
  return labels
}

const getDatesLabel = (values: DurationRangeType, word?: string) => {
  if (values[0] && values[1]) {
    return `${word ? word + ' entre' : 'Entre'} le ${moment(values[0]).format('DD/MM/YYYY')} et le ${moment(
      values[1]
    ).format('DD/MM/YYYY')}`
  }
  if (values[0] && !values[1]) {
    return `${word ? word + ' à' : 'À'} partir du ${moment(values[0]).format('DD/MM/YYYY')}`
  }
  if (!values[0] && values[1]) {
    return `${word ? word + " jusqu'au" : "jusqu'au"}  ${moment(values[1]).format('DD/MM/YYYY')}`
  }
  return ''
}

const getSearchDocumentLabel = (value: string, searchBy: SearchByTypes) => {
  const loc = searchBy === SearchByTypes.TEXT ? 'document' : 'titre du document'
  return `Contient "${value}" dans le ${loc}`
}

const getDocumentTypesLabel = (values: DocType[]) => {
  const allTypes = new Set(allDocTypes.docTypes.map((docType: DocType) => docType.type))

  const displayingSelectedDocTypes = values.reduce((acc, selectedDocType) => {
    const numberOfElementFromGroup = allTypes.has(selectedDocType.type) ? allTypes.size : 0
    const numberOfElementSelected = values.filter((doc) => doc.type === selectedDocType.type).length

    if (numberOfElementFromGroup === numberOfElementSelected) {
      return acc
    } else {
      return [...acc, selectedDocType]
    }
  }, [] as DocType[])

  const currentDocTypes = displayingSelectedDocTypes.map(({ label }) => label).join(' - ')

  return currentDocTypes
}

const getNbOccurencesLabel = (value: number, comparator: string) => {
  return `Nombre d'occurrences ${comparator} ${+value}`
}

const getBiologyValuesLabel = (comparator: string, valueMin: number, valueMax: number) => {
  if (isNaN(valueMin) && isNaN(valueMax)) return null
  return comparator === Comparators.BETWEEN
    ? `Valeur comprise entre ${valueMin} et ${isNaN(valueMax) ? '?' : valueMax}`
    : `Valeur ${comparator} ${valueMin}`
}

const getIppListLabel = (values: string) => {
  const labels = values.split(',').join(' - ')
  return `Contient les patients : ${labels}`
}

export const criteriasAsArray = (criterias: any, type: RessourceType): string[] => {
  const labels: string[] = []
  console.log('test criterias', criterias)
  switch (type) {
    case RessourceType.CONDITION:
    case RessourceType.PROCEDURE:
    case RessourceType.CLAIM:
    case RessourceType.MEDICATION_REQUEST:
    case RessourceType.MEDICATION_ADMINISTRATION:
    case RessourceType.OBSERVATION:
      if (criterias.code.length > 0) labels.push(getLabelFromCriteriaObject(criterias.code, criterias.type))
      break
  }
  switch (type) {
    case RessourceType.IPP_LIST:
      labels.push(getIppListLabel(criterias.search))
      break

    case RessourceType.PATIENT:
      if (criterias.genders?.length > 0) labels.push(getLabelFromCriteriaObject(criterias.genders))
      labels.push(getVitalStatusLabel(criterias.vitalStatus))
      labels.push(getDurationRangeLabel(criterias.age, 'Âge'))
      if (criterias.birthdates[0] || criterias.birthdates[1])
        labels.push(getDatesLabel(criterias.birthdates, 'Naissance'))
      if (criterias.deathDates[0] || criterias.deathDates[1]) labels.push(getDatesLabel(criterias.deathDates, 'Décès'))
      break
    case RessourceType.ENCOUNTER:
      if (criterias.age[0] || criterias.age[1]) labels.push(getDurationRangeLabel(criterias.age, 'Âge : '))
      if (criterias.duration[0] || criterias.duration[1])
        labels.push(getDurationRangeLabel(criterias.duration, 'Prise en charge : '))
      if (criterias.priseEnChargeType.length > 0)
        labels.push(getLabelFromCriteriaObject(criterias.priseEnChargeType, criterias.type))
      if (criterias.typeDeSejour.length > 0)
        labels.push(getLabelFromCriteriaObject(criterias.typeDeSejour, criterias.type))
      if (criterias.fileStatus.length > 0) labels.push(getLabelFromCriteriaObject(criterias.fileStatus, criterias.type))
      if (criterias.admissionMode.length > 0)
        labels.push(getLabelFromCriteriaObject(criterias.admissionMode, criterias.type))
      if (criterias.admission.length > 0) labels.push(getLabelFromCriteriaObject(criterias.admission, criterias.type))
      if (criterias.entryMode.length > 0) labels.push(getLabelFromCriteriaObject(criterias.entryMode, criterias.type))
      if (criterias.exitMode.length > 0) labels.push(getLabelFromCriteriaObject(criterias.exitMode, criterias.type))
      if (criterias.reason.length > 0) labels.push(getLabelFromCriteriaObject(criterias.reason, criterias.type))
      if (criterias.destination.length > 0)
        labels.push(getLabelFromCriteriaObject(criterias.destination, criterias.type))
      if (criterias.provenance.length > 0) labels.push(getLabelFromCriteriaObject(criterias.provenance, criterias.type))
      break

    case RessourceType.DOCUMENTS:
      labels.push(getSearchDocumentLabel(criterias.search, criterias.searchBy))
      if (criterias.docType.length > 0) labels.push(getDocumentTypesLabel(criterias.docType))
      break

    case RessourceType.CONDITION:
      if (criterias.diagnosticType.length > 0) labels.push(getLabelFromCriteriaObject(criterias.diagnosticType))
      break

    case RessourceType.MEDICATION_REQUEST:
    case RessourceType.MEDICATION_ADMINISTRATION:
      labels.push(getMedicationTypeLabel(criterias.type))
      if (criterias.prescriptionType.length > 0) labels.push(getLabelFromCriteriaObject(criterias.prescriptionType))
      if (criterias.administration.length > 0) labels.push(getLabelFromCriteriaObject(criterias.administration))
      break

    case RessourceType.OBSERVATION:
      if (criterias.valueComparator && (!isNaN(criterias.valueMin) || !isNaN(criterias.valueMax)))
        getBiologyValuesLabel(criterias.valueComparator, criterias.valueMin, criterias.valueMax)
  }
  switch (type) {
    case RessourceType.DOCUMENTS:
    case RessourceType.CONDITION:
    case RessourceType.PROCEDURE:
    case RessourceType.MEDICATION_REQUEST:
    case RessourceType.MEDICATION_ADMINISTRATION:
    case RessourceType.OBSERVATION:
    case RessourceType.ENCOUNTER:
      if (criterias.encounterStartDate || criterias.encounterEndDate)
        labels.push(getDatesLabel([criterias.encounterStartDate, criterias.encounterEndDate], 'Prise en charge'))
      if (!isNaN(criterias.occurrence) && criterias.occurrenceComparator)
        labels.push(getNbOccurencesLabel(criterias.occurrence, criterias.occurrenceComparator))
      if (criterias.startOccurrence || criterias.endOccurrence)
        labels.push(getDatesLabel([criterias.startOccurrence, criterias.endOccurrence], 'Occurence'))
      if (criterias.encounterService?.length > 0) labels.push(getLabelFromName(criterias.encounterService))
  }

  return labels
}
