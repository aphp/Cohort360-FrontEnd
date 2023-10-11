import moment from 'moment'
import { Comparators, DocType, ScopeTreeRow } from 'types'
import { MedicationType, MedicationTypeLabel, RequestCriteriasKeys, VitalStatusLabel } from 'types/requestCriterias'
import { DurationRangeType, SearchByTypes, VitalStatus } from 'types/searchCriterias'
import allDocTypes from 'assets/docTypes.json'
import { getDurationRangeLabel } from './age'

export const getVitalStatusLabel = (value: VitalStatus) => {
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

export const getLabelFromObject = (values: { id: string; label: string }[]) => {
  const labels = values.map((value) => value.label).join(' - ')
  return labels
}

export const getLabelFromName = (values: ScopeTreeRow[]) => {
  const labels = values.map((value) => value.name).join(' - ')
  return labels
}

export const getDatesLabel = (values: DurationRangeType, word?: string) => {
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

export const criteriasAsArray = (criterias: any, type: RequestCriteriasKeys): string[] => {
  const labels: string[] = []

  switch (type) {
    case RequestCriteriasKeys.CONDITION:
    case RequestCriteriasKeys.PROCEDURE:
    case RequestCriteriasKeys.CLAIM:
    case RequestCriteriasKeys.MEDICATION_REQUEST:
    case RequestCriteriasKeys.MEDICATION_ADMINISTRATION:
    case RequestCriteriasKeys.OBSERVATION:
      if (criterias.code.length > 0) labels.push(getLabelFromObject(criterias.code))
      break
  }
  switch (type) {
    case RequestCriteriasKeys.IPP_LIST:
      labels.push(getIppListLabel(criterias.search))
      break

    case RequestCriteriasKeys.PATIENT:
      if (criterias.genders.length > 0) labels.push(getLabelFromObject(criterias.genders))
      labels.push(getVitalStatusLabel(criterias.vitalStatus))
      labels.push(getDurationRangeLabel(criterias.age, 'Âge'))
      if (criterias.birthdates[0] || criterias.birthdates[1])
        labels.push(getDatesLabel(criterias.birthdates, 'Naissance'))
      if (criterias.deathDates[0] || criterias.deathDates[1]) labels.push(getDatesLabel(criterias.deathDates, 'Décès'))
      break
    /* ajouter durée de prise en charge + age de prise en charge */
    case RequestCriteriasKeys.ENCOUNTER:
      if (criterias.priseEnChargeType.length > 0) labels.push(getLabelFromObject(criterias.priseEnChargeType))
      if (criterias.typeDeSejour.length > 0) labels.push(getLabelFromObject(criterias.typeDeSejour))
      if (criterias.fileStatus.length > 0) labels.push(getLabelFromObject(criterias.fileStatus))
      if (criterias.admissionMode.length > 0) labels.push(getLabelFromObject(criterias.admissionMode))
      if (criterias.admission.length > 0) labels.push(getLabelFromObject(criterias.admission))
      if (criterias.entryMode.length > 0) labels.push(getLabelFromObject(criterias.entryMode))
      if (criterias.exitMode.length > 0) labels.push(getLabelFromObject(criterias.exitMode))
      if (criterias.reason.length > 0) labels.push(getLabelFromObject(criterias.reason))
      if (criterias.destination.length > 0) labels.push(getLabelFromObject(criterias.destination))
      if (criterias.provenance.length > 0) labels.push(getLabelFromObject(criterias.provenance))
      break

    case RequestCriteriasKeys.DOCUMENTS:
      labels.push(getSearchDocumentLabel(criterias.search, criterias.searchBy))
      if (criterias.docType.length > 0) labels.push(getDocumentTypesLabel(criterias.docType))
      break

    case RequestCriteriasKeys.CONDITION:
      if (criterias.diagnosticType.length > 0) labels.push(getLabelFromObject(criterias.diagnosticType))
      break

    case RequestCriteriasKeys.MEDICATION_REQUEST:
    case RequestCriteriasKeys.MEDICATION_ADMINISTRATION:
      labels.push(getMedicationTypeLabel(criterias.type))
      if (criterias.prescriptionType.length > 0) labels.push(getLabelFromObject(criterias.prescriptionType))
      if (criterias.administration.length > 0) labels.push(getLabelFromObject(criterias.administration))
      break

    case RequestCriteriasKeys.OBSERVATION:
      if (criterias.valueComparator && (!isNaN(criterias.valueMin) || !isNaN(criterias.valueMax)))
        getBiologyValuesLabel(criterias.valueComparator, criterias.valueMin, criterias.valueMax)
  }
  switch (type) {
    case RequestCriteriasKeys.DOCUMENTS:
    case RequestCriteriasKeys.CONDITION:
    case RequestCriteriasKeys.PROCEDURE:
    case RequestCriteriasKeys.MEDICATION_REQUEST:
    case RequestCriteriasKeys.MEDICATION_ADMINISTRATION:
    case RequestCriteriasKeys.OBSERVATION:
      if (criterias.encounterStartDate || criterias.encounterEndDate)
        labels.push(getDatesLabel([criterias.encounterStartDate, criterias.encounterEndDate], 'Prise en charge'))
      if (criterias.occurrence && criterias.occurrenceComparator)
        labels.push(getNbOccurencesLabel(criterias.occurrence, criterias.occurrenceComparator))
      if (criterias.encounterStartDate || criterias.encounterEndDate)
        labels.push(getDatesLabel([criterias.startOccurrence, criterias.endOccurrence], 'Occurence'))
      if (criterias.encounterService?.length > 0) labels.push(getLabelFromName(criterias.encounterService))
  }

  return labels
}
