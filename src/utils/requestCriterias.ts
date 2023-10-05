import moment from 'moment'
import { Comparators, DocType, ScopeTreeRow } from 'types'
import { MedicationType, MedicationTypeLabel, VitalStatusLabel } from 'types/requestCriterias'
import { DurationRangeType, SearchByTypes, VitalStatus } from 'types/searchCriterias'
import allDocTypes from 'assets/docTypes.json'

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

export const getLabelFromObject = (values: { id: string; label: string }[]) => {
  const labels = values.map((value) => value.label)
  const concatenatedLabels = labels.join(' - ')
  return concatenatedLabels
}

export const getBirthdates = (values: DurationRangeType) => {
  if (values[0] && values[1]) {
    return `Naissance entre le ${moment(values[0]).format('DD/MM/YYYY')} et le ${moment(values[1]).format(
      'DD/MM/YYYY'
    )}`
  }
  if (values[0] && !values[1]) {
    return `Naissance à partir du ${moment(values[0]).format('DD/MM/YYYY')}`
  }
  if (!values[0] && values[1]) {
    return `Naissance jusqu'au ${moment(values[1]).format('DD/MM/YYYY')}`
  }
}

export const getDeathDates = (values: DurationRangeType) => {
  if (values[0] && values[1]) {
    return `Décès entre le ${moment(values[0]).format('DD/MM/YYYY')} et le ${moment(values[1]).format('DD/MM/YYYY')}`
  }
  if (values[0] && !values[1]) {
    return `Décès à partir du ${moment(values[0]).format('DD/MM/YYYY')}`
  }
  if (!values[0] && values[1]) {
    return `Décès jusqu'au ${moment(values[1]).format('DD/MM/YYYY')}`
  }
}
export const getEncounterDatesLabel = (values: DurationRangeType) => {
  if (values[0] && values[1]) {
    return `Prise en charge entre le ${moment(values[0]).format('DD/MM/YYYY')} et le ${moment(values[1]).format(
      'DD/MM/YYYY'
    )}`
  }
  if (values[0] && !values[1]) {
    return `Prise en charge à partir du ${moment(values[0]).format('DD/MM/YYYY')}`
  }
  if (!values[0] && values[1]) {
    return `Prise en charge jusqu'au ${moment(values[1]).format('DD/MM/YYYY')}`
  }
}

export const getOccurenceDatesLabel = (values: DurationRangeType) => {
  if (values[0] && values[1]) {
    return `Entre le ${moment(values[0]).format('DD/MM/YYYY')} et le ${moment(values[1]).format('DD/MM/YYYY')}`
  }
  if (values[0] && !values[1]) {
    return `À partir du ${moment(values[0]).format('DD/MM/YYYY')}`
  }
  if (!values[0] && values[1]) {
    return `Jusqu'au ${moment(values[1]).format('DD/MM/YYYY')}`
  }
}

export const getSearchDocumentLabel = (value: string, searchBy: SearchByTypes) => {
  const loc = searchBy === SearchByTypes.TEXT ? 'document' : 'titre du document'
  return `Contient "${value}" dans le ${loc}`
}

export const getExecutiveUnitsLabel = (values: ScopeTreeRow[]) => {
  const labels = values.map((value) => value.name)
  const concatenatedLabels = labels.join(' - ')
  return concatenatedLabels
}

export const getDiagnosticType = (values: ScopeTreeRow[]) => {
  const labels = values.map((value) => value.name)
  const concatenatedLabels = labels.join(' - ')
  return concatenatedLabels
}

export const getDocumentTypesLabel = (values: DocType[]) => {
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

  const currentDocTypes = displayingSelectedDocTypes.map(({ label }) => label)

  return currentDocTypes.join(' - ')
}

export const getNbOccurencesLabel = (value: number, comparator: string) => {
  return `Nombre d'occurrences ${comparator} ${+value}`
}

export const getMedicationTypeLabel = (type: MedicationType) => {
  switch (type) {
    case MedicationType.Request:
      return MedicationTypeLabel.Request
    case MedicationType.Administration:
      return MedicationTypeLabel.Administration
    default:
      return '?'
  }
}

export const getBiologyValuesLabel = (comparator: string, valueMin: number, valueMax: number) => {
  return comparator === Comparators.BETWEEN
    ? `Valeur comprise entre ${valueMin} et ${isNaN(valueMax) ? '?' : valueMax}`
    : `Valeur ${comparator} ${valueMin}`
}

export const getIppListLabel = (values: string) => {
  const labels = values.split(',').join(' - ')
  return `Contient les patients : ${labels}`
}
