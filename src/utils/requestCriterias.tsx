import React, { ReactNode } from 'react'
import moment from 'moment'
import { ScopeTreeRow } from 'types'
import {
  Comparators,
  CriteriaDataKey,
  DocType,
  MedicationTypeLabel,
  RessourceType,
  SelectedCriteriaType
} from 'types/requestCriterias'
import {
  DocumentAttachmentMethod,
  DocumentAttachmentMethodLabel,
  DurationRangeType,
  LabelObject,
  SearchByTypes
} from 'types/searchCriterias'
import allDocTypes from 'assets/docTypes.json'
import { getDurationRangeLabel } from './age'
import { displaySystem } from './displayValueSetSystem'
import { CriteriaState } from 'state/criteria'
import { Tooltip, Typography } from '@mui/material'

const getMedicationTypeLabel = (type: RessourceType) => {
  switch (type) {
    case RessourceType.MEDICATION_REQUEST:
      return MedicationTypeLabel.Request
    case RessourceType.MEDICATION_ADMINISTRATION:
      return MedicationTypeLabel.Administration
  }
}

const getLabelFromCriteriaObject = (
  criteriaState: CriteriaState,
  values: LabelObject[] | null,
  name: CriteriaDataKey,
  resourceType: RessourceType,
  label?: string
) => {
  const criterionData = criteriaState.cache.find((criteriaCache) => criteriaCache.criteriaType === resourceType)?.data
  if (criterionData === null || values === null) return ''

  const criterion = criterionData?.[name] || []
  if (criterion !== 'loading') {
    const removeDuplicates = (array: any[], key: string) => {
      return array.filter((obj, index, self) => index === self.findIndex((el) => el[key] === obj[key]))
    }
    const labels = removeDuplicates(criterion, 'id')
      .filter((obj) => values.map((value) => value.id).includes(obj.id))
      .map((obj: LabelObject) => `${displaySystem(obj.system)} ${obj.label}`)

    const tooltipTitle = labels.join(' - ')
    return (
      <Tooltip title={tooltipTitle}>
        <Typography style={{ textOverflow: 'ellipsis', overflow: 'hidden', fontSize: 12 }}>
          {label} {tooltipTitle}
        </Typography>
      </Tooltip>
    )
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

const getNbOccurencesLabel = (value: number, comparator: string, name?: string) => {
  return `Nombre ${name ? name : "d'occurrences"} ${comparator} ${+value}`
}

const getBiologyValuesLabel = (comparator: string, values: [number | null, number | null]) => {
  if (values[0] === null && values[1] === null) return null
  return comparator === Comparators.BETWEEN
    ? `Valeur comprise entre ${values[0]} et ${values[1] === null ? '?' : values[1]}`
    : `Valeur ${comparator} ${values[0]}`
}

const getIdsListLabels = (values: string, name: string) => {
  const labels = values.split(',').join(' - ')
  return `Contient les ${name} : ${labels}`
}

export const getAttachmentMethod = (value: DocumentAttachmentMethod, daysOfDelay: string | null) => {
  if (value === DocumentAttachmentMethod.INFERENCE_TEMPOREL) {
    return `Rattachement aux documents par ${DocumentAttachmentMethodLabel.INFERENCE_TEMPOREL.toLocaleLowerCase()}${
      daysOfDelay !== '' && daysOfDelay !== null ? ` de ${daysOfDelay} jour(s)` : ''
    }`
  } else if (value === DocumentAttachmentMethod.ACCESS_NUMBER) {
    return `Rattachement aux documents par ${DocumentAttachmentMethodLabel.ACCESS_NUMBER.toLocaleLowerCase()}`
  } else {
    return ''
  }
}

export const criteriasAsArray = (selectedCriteria: SelectedCriteriaType, criteriaState: CriteriaState): ReactNode[] => {
  const type = selectedCriteria.type
  const labels: ReactNode[] = []
  switch (selectedCriteria.type) {
    case RessourceType.IPP_LIST:
      labels.push(getIdsListLabels(selectedCriteria.search, 'patients'))
      break

    case RessourceType.PATIENT:
      if (selectedCriteria.genders && selectedCriteria.genders.length > 0) {
        labels.push(getLabelFromCriteriaObject(criteriaState, selectedCriteria.genders, CriteriaDataKey.GENDER, type))
      }

      if (selectedCriteria.vitalStatus && selectedCriteria.vitalStatus.length > 0)
        labels.push(
          getLabelFromCriteriaObject(criteriaState, selectedCriteria.vitalStatus, CriteriaDataKey.VITALSTATUS, type)
        )
      if (selectedCriteria.birthdates[0] === null && selectedCriteria.birthdates[1] === null)
        labels.push(getDurationRangeLabel(selectedCriteria.age, 'Âge'))
      if (selectedCriteria.birthdates[0] || selectedCriteria.birthdates[1])
        labels.push(getDatesLabel(selectedCriteria.birthdates, 'Naissance'))
      if (selectedCriteria.deathDates[0] || selectedCriteria.deathDates[1])
        labels.push(getDatesLabel(selectedCriteria.deathDates, 'Décès'))
      break

    case RessourceType.ENCOUNTER:
      if (selectedCriteria.age[0] || selectedCriteria.age[1])
        labels.push(getDurationRangeLabel(selectedCriteria.age, 'Âge : '))
      if (selectedCriteria.duration[0] || selectedCriteria.duration[1])
        labels.push(getDurationRangeLabel(selectedCriteria.duration, 'Prise en charge : '))
      if (selectedCriteria.priseEnChargeType?.length || 0 > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.priseEnChargeType,
            CriteriaDataKey.PRISE_EN_CHARGE_TYPE,
            type
          )
        )
      if (selectedCriteria.typeDeSejour && selectedCriteria.typeDeSejour.length > 0)
        labels.push(
          getLabelFromCriteriaObject(criteriaState, selectedCriteria.typeDeSejour, CriteriaDataKey.TYPE_DE_SEJOUR, type)
        )
      if (selectedCriteria.fileStatus && selectedCriteria.fileStatus.length > 0)
        labels.push(
          getLabelFromCriteriaObject(criteriaState, selectedCriteria.fileStatus, CriteriaDataKey.FILE_STATUS, type)
        )
      if (selectedCriteria.admissionMode && selectedCriteria.admissionMode.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.admissionMode,
            CriteriaDataKey.ADMISSION_MODE,
            type
          )
        )
      if (selectedCriteria.admission && selectedCriteria.admission.length > 0)
        labels.push(
          getLabelFromCriteriaObject(criteriaState, selectedCriteria.admission, CriteriaDataKey.ADMISSION, type)
        )
      if (selectedCriteria.entryMode && selectedCriteria.entryMode.length > 0)
        labels.push(
          getLabelFromCriteriaObject(criteriaState, selectedCriteria.entryMode, CriteriaDataKey.ENTRY_MODES, type)
        )
      if (selectedCriteria.exitMode && selectedCriteria.exitMode.length > 0)
        labels.push(
          getLabelFromCriteriaObject(criteriaState, selectedCriteria.exitMode, CriteriaDataKey.EXIT_MODES, type)
        )
      if (selectedCriteria.reason && selectedCriteria.reason.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, selectedCriteria.reason, CriteriaDataKey.REASON, type))
      if (selectedCriteria.destination && selectedCriteria.destination.length > 0)
        labels.push(
          getLabelFromCriteriaObject(criteriaState, selectedCriteria.destination, CriteriaDataKey.DESTINATION, type)
        )
      if (selectedCriteria.provenance && selectedCriteria.provenance.length > 0)
        labels.push(
          getLabelFromCriteriaObject(criteriaState, selectedCriteria.provenance, CriteriaDataKey.PROVENANCE, type)
        )
      break

    case RessourceType.DOCUMENTS:
      if (selectedCriteria.search)
        labels.push(getSearchDocumentLabel(selectedCriteria.search, selectedCriteria.searchBy))
      if (selectedCriteria.docType && selectedCriteria.docType.length > 0)
        labels.push(getDocumentTypesLabel(selectedCriteria.docType))
      break

    case RessourceType.CONDITION:
      if (selectedCriteria.code && selectedCriteria.code.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.code,
            CriteriaDataKey.CIM_10_DIAGNOSTIC,
            selectedCriteria.type
          )
        )
      if (selectedCriteria.diagnosticType && selectedCriteria.diagnosticType.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.diagnosticType,
            CriteriaDataKey.DIAGNOSTIC_TYPES,
            selectedCriteria.type
          )
        )
      break

    case RessourceType.PROCEDURE:
      if (selectedCriteria.code && selectedCriteria.code.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.code,
            CriteriaDataKey.CCAM_DATA,
            selectedCriteria.type
          )
        )
      if (selectedCriteria.source) labels.push(`Source: ${selectedCriteria.source}`)
      break

    case RessourceType.CLAIM:
      if (selectedCriteria.code && selectedCriteria.code.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.code,
            CriteriaDataKey.GHM_DATA,
            selectedCriteria.type
          )
        )
      break

    case RessourceType.MEDICATION_REQUEST:
    case RessourceType.MEDICATION_ADMINISTRATION:
      labels.push(getMedicationTypeLabel(selectedCriteria.type))
      if (selectedCriteria.code && selectedCriteria.code.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.code,
            CriteriaDataKey.MEDICATION_DATA,
            RessourceType.MEDICATION
          )
        )
      if (
        selectedCriteria.type === RessourceType.MEDICATION_REQUEST &&
        selectedCriteria.prescriptionType &&
        selectedCriteria.prescriptionType.length > 0
      )
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.prescriptionType,
            CriteriaDataKey.PRESCRIPTION_TYPES,
            RessourceType.MEDICATION
          )
        )
      if (selectedCriteria.administration && selectedCriteria.administration.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.administration,
            CriteriaDataKey.ADMINISTRATIONS,
            RessourceType.MEDICATION
          )
        )
      break

    case RessourceType.OBSERVATION:
      if (selectedCriteria.code && selectedCriteria.code.length > 0)
        labels.push(
          getLabelFromCriteriaObject(criteriaState, selectedCriteria.code, CriteriaDataKey.BIOLOGY_DATA, type)
        )
      if (selectedCriteria.valueComparator && selectedCriteria.searchByValue[0] !== null)
        labels.push(getBiologyValuesLabel(selectedCriteria.valueComparator, selectedCriteria.searchByValue))
      break

    case RessourceType.IMAGING:
      if (selectedCriteria.studyStartDate || selectedCriteria.studyEndDate)
        labels.push(
          getDatesLabel([selectedCriteria.studyStartDate, selectedCriteria.studyEndDate], "Date de l'étude : ")
        )
      if (selectedCriteria.studyModalities && selectedCriteria.studyModalities.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.studyModalities,
            CriteriaDataKey.MODALITIES,
            type,
            "Modalités d'étude :"
          )
        )
      if (selectedCriteria.studyDescription)
        labels.push(`Description de l'étude : ${selectedCriteria.studyDescription}`)
      if (selectedCriteria.studyProcedure) labels.push(`Code procédure de l'étude : ${selectedCriteria.studyProcedure}`)
      if (selectedCriteria.withDocument !== DocumentAttachmentMethod.NONE)
        labels.push(getAttachmentMethod(selectedCriteria.withDocument, selectedCriteria.daysOfDelay))
      if (selectedCriteria.studyUid) labels.push(getIdsListLabels(selectedCriteria.studyUid, "uuid d'étude"))
      if (selectedCriteria.seriesStartDate || selectedCriteria.seriesEndDate)
        labels.push(
          getDatesLabel([selectedCriteria.seriesStartDate, selectedCriteria.seriesEndDate], 'Date de la série : ')
        )
      if (selectedCriteria.seriesModalities && selectedCriteria.seriesModalities?.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.seriesModalities,
            CriteriaDataKey.MODALITIES,
            type,
            'Modalités de séries :'
          )
        )
      if (selectedCriteria.seriesDescription)
        labels.push(`Description de la série : ${selectedCriteria.seriesDescription}`)
      if (selectedCriteria.seriesProtocol) labels.push(`Protocole de la série : ${selectedCriteria.seriesProtocol}`)
      if (selectedCriteria.seriesUid) labels.push(getIdsListLabels(selectedCriteria.seriesUid, 'uuid de série'))
      if (!isNaN(selectedCriteria.numberOfSeries) && selectedCriteria.seriesComparator)
        labels.push(
          getNbOccurencesLabel(selectedCriteria.numberOfSeries, selectedCriteria.seriesComparator, 'de séries')
        )
      if (!isNaN(selectedCriteria.numberOfIns) && selectedCriteria.instancesComparator)
        labels.push(
          getNbOccurencesLabel(selectedCriteria.numberOfIns, selectedCriteria.instancesComparator, "d'instances")
        )
      break
  }
  switch (type) {
    case RessourceType.DOCUMENTS:
    case RessourceType.CONDITION:
    case RessourceType.CLAIM:
    case RessourceType.PROCEDURE:
    case RessourceType.MEDICATION_REQUEST:
    case RessourceType.MEDICATION_ADMINISTRATION:
    case RessourceType.OBSERVATION:
    case RessourceType.ENCOUNTER:
    case RessourceType.IMAGING:
      if (selectedCriteria.encounterStartDate || selectedCriteria.encounterEndDate)
        labels.push(
          getDatesLabel([selectedCriteria.encounterStartDate, selectedCriteria.encounterEndDate], 'Prise en charge')
        )
      if (!isNaN(selectedCriteria.occurrence) && selectedCriteria.occurrenceComparator)
        labels.push(getNbOccurencesLabel(selectedCriteria.occurrence, selectedCriteria.occurrenceComparator))
      if (selectedCriteria.startOccurrence || selectedCriteria.endOccurrence)
        labels.push(getDatesLabel([selectedCriteria.startOccurrence, selectedCriteria.endOccurrence], 'Occurence'))
      if (selectedCriteria.encounterService && selectedCriteria.encounterService.length > 0)
        labels.push(getLabelFromName(selectedCriteria.encounterService))
  }

  return labels
}
