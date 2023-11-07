import React from 'react'
import moment from 'moment'
import { CriteriaItemType, ScopeTreeRow } from 'types'
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
import { CriteriaState } from 'state/criteria'
import { Tooltip } from '@mui/material'

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

const getLabelFromCriteriaObject = (
  criteriaState: CriteriaState,
  values: LabelCriteriaObject[],
  name: string,
  resourceType: RessourceType
) => {
  const findCriterionById = (criteriaArray: CriteriaState, id: RessourceType): null | CriteriaItemType => {
    for (const criterion of criteriaArray) {
      if (criterion.id === id) {
        return criterion
      }
      if (criterion.subItems) {
        const foundInSubItem = findCriterionById(criterion.subItems, id)
        if (foundInSubItem) {
          return foundInSubItem
        }
      }
    }
    return null
  }

  const criterionData = findCriterionById(criteriaState, resourceType)?.data
  if (criterionData === null) return ''

  const criterion = criterionData[name]
  if (criterion !== 'loading') {
    const labels = criterion
      .filter((obj: any) => values.map((value) => value.id).includes(obj.id))
      .map((obj: LabelCriteriaObject) => `${displaySystem(obj.system)} ${obj.label}`)

    const tooltipTitle = labels.join(' - ')
    return <Tooltip title={tooltipTitle}>{tooltipTitle}</Tooltip>
  }
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

export const criteriasAsArray = (criterias: any, type: RessourceType, criteriaState: CriteriaState): string[] => {
  const labels: (string | any)[] = []
  switch (type) {
    case RessourceType.IPP_LIST:
      labels.push(getIppListLabel(criterias.search))
      break

    case RessourceType.PATIENT:
      if (criterias.genders?.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.genders, 'gender' as string, type))
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
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.priseEnChargeType, 'priseEnChargeType', type))
      if (criterias.typeDeSejour.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.typeDeSejour, 'typeDeSejour', type))
      if (criterias.fileStatus.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.fileStatus, 'fileStatus', type))
      if (criterias.admissionMode.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.admissionMode, 'admissionModes', type))
      if (criterias.admission.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.admission, 'admission', type))
      if (criterias.entryMode.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.entryMode, 'entryModes', type))
      if (criterias.exitMode.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.exitMode, 'exitModes', type))
      if (criterias.reason.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.reason, 'reason', type))
      if (criterias.destination.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.destination, 'destination', type))
      if (criterias.provenance.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.provenance, 'provenance', type))
      break

    case RessourceType.DOCUMENTS:
      labels.push(getSearchDocumentLabel(criterias.search, criterias.searchBy))
      if (criterias.docType.length > 0) labels.push(getDocumentTypesLabel(criterias.docType))
      break

    case RessourceType.CONDITION:
      if (criterias.code.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.code, 'cim10Diagnostic', criterias.type))
      if (criterias.diagnosticType.length > 0)
        labels.push(
          getLabelFromCriteriaObject(criteriaState, criterias.diagnosticType, 'diagnosticTypes', criterias.type)
        )
      break

    case RessourceType.PROCEDURE:
      if (criterias.code.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.code, 'ccamData', criterias.type))
      break

    case RessourceType.CLAIM:
      if (criterias.code.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.code, 'ghmData', criterias.type))
      break

    case RessourceType.MEDICATION_REQUEST:
    case RessourceType.MEDICATION_ADMINISTRATION:
      labels.push(getMedicationTypeLabel(criterias.type))
      if (criterias.code.length > 0)
        labels.push(
          getLabelFromCriteriaObject(criteriaState, criterias.code, 'medicationData', RessourceType.MEDICATION)
        )
      if (criterias.prescriptionType.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            criterias.prescriptionType,
            'prescriptionTypes',
            RessourceType.MEDICATION
          )
        )
      if (criterias.administration.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            criterias.administration,
            'administrations',
            RessourceType.MEDICATION
          )
        )
      break

    case RessourceType.OBSERVATION:
      if (criterias.valueComparator && (!isNaN(criterias.valueMin) || !isNaN(criterias.valueMax)))
        getBiologyValuesLabel(criterias.valueComparator, criterias.valueMin, criterias.valueMax)
      if (criterias.code.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, criterias.code, 'biologyData', type))
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
