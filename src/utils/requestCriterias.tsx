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

const getNbOccurencesLabel = (value: number, comparator: string, name: string) => {
  return `${name} ${comparator} ${+value}`
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
          getNbOccurencesLabel(selectedCriteria.numberOfSeries, selectedCriteria.seriesComparator, 'Nombre de séries')
        )
      if (!isNaN(selectedCriteria.numberOfIns) && selectedCriteria.instancesComparator)
        labels.push(
          getNbOccurencesLabel(selectedCriteria.numberOfIns, selectedCriteria.instancesComparator, "Nombre d'instances")
        )
      break
    case RessourceType.PREGNANCY:
      if (selectedCriteria.pregnancyStartDate || selectedCriteria.pregnancyEndDate)
        labels.push(
          getDatesLabel(
            [selectedCriteria.pregnancyStartDate, selectedCriteria.pregnancyEndDate],
            'Date de début de grossesse :'
          )
        )
      if (selectedCriteria.pregnancyMode && selectedCriteria.pregnancyMode.length > 0) {
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.pregnancyMode,
            CriteriaDataKey.PREGNANCY_MODE,
            type,
            'Mode de grossesse :'
          )
        )
      }
      if (!isNaN(selectedCriteria.foetus) && selectedCriteria.foetusComparator)
        labels.push(
          getNbOccurencesLabel(selectedCriteria.foetus, selectedCriteria.foetusComparator, 'Nombre de foetus')
        )
      if (!isNaN(selectedCriteria.parity) && selectedCriteria.parityComparator)
        labels.push(getNbOccurencesLabel(selectedCriteria.parity, selectedCriteria.parityComparator, 'Parité'))
      if (selectedCriteria.maternalRisks && selectedCriteria.maternalRisks.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.maternalRisks,
            CriteriaDataKey.MATERNAL_RISKS,
            type,
            'Risques maternels :'
          )
        )
      if (selectedCriteria.maternalRisksPrecision)
        labels.push(`Précision sur les risques maternels : ${selectedCriteria.maternalRisksPrecision}`)
      if (selectedCriteria.risksRelatedToObstetricHistory && selectedCriteria.risksRelatedToObstetricHistory.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.risksRelatedToObstetricHistory,
            CriteriaDataKey.RISKS_RELATED_TO_OBSTETRIC_HISTORY,
            type,
            'Risques liés aux antécédents obstétricaux :'
          )
        )
      if (selectedCriteria.risksRelatedToObstetricHistoryPrecision)
        labels.push(
          `Précision sur les risques liés aux antécédents obstétricaux : ${selectedCriteria.risksRelatedToObstetricHistoryPrecision}`
        )
      if (
        selectedCriteria.risksOrComplicationsOfPregnancy &&
        selectedCriteria.risksOrComplicationsOfPregnancy.length > 0
      )
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.risksOrComplicationsOfPregnancy,
            CriteriaDataKey.RISKS_OR_COMPLICATIONS_OF_PREGNANCY,
            type,
            'Risques ou complications de la grossesse :'
          )
        )
      if (selectedCriteria.risksOrComplicationsOfPregnancyPrecision)
        labels.push(
          `Précision sur les risques ou complications de la grossesse : ${selectedCriteria.risksOrComplicationsOfPregnancyPrecision}`
        )
      if (selectedCriteria.corticotherapie && selectedCriteria.corticotherapie.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.corticotherapie,
            CriteriaDataKey.CORTICOTHERAPIE,
            type,
            'Corticothérapie :'
          )
        )
      if (selectedCriteria.prenatalDiagnosis && selectedCriteria.prenatalDiagnosis.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.prenatalDiagnosis,
            CriteriaDataKey.PRENATAL_DIAGNOSIS,
            type,
            'Diagnostic prénatal :'
          )
        )
      if (selectedCriteria.ultrasoundMonitoring && selectedCriteria.ultrasoundMonitoring.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.ultrasoundMonitoring,
            CriteriaDataKey.ULTRASOUND_MONITORING,
            type,
            'Suivi échographique :'
          )
        )
      break
    case RessourceType.HOSPIT:
      if (selectedCriteria.hospitReason) labels.push(`Motif(s) d'hospitalisation : ${selectedCriteria.hospitReason}`)
      if (selectedCriteria.inUteroTransfer && selectedCriteria.inUteroTransfer.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.inUteroTransfer,
            CriteriaDataKey.IN_UTERO_TRANSFER,
            type,
            'Transfert in utero :'
          )
        )
      if (selectedCriteria.pregnancyMonitoring && selectedCriteria.pregnancyMonitoring.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.pregnancyMonitoring,
            CriteriaDataKey.PREGNANCY_MONITORING,
            type,
            'Grossesse peu ou pas suivie :'
          )
        )
      if (selectedCriteria.vme && selectedCriteria.vme.length > 0)
        labels.push(getLabelFromCriteriaObject(criteriaState, selectedCriteria.vme, CriteriaDataKey.VME, type, 'VME :'))
      if (selectedCriteria.maturationCorticotherapie && selectedCriteria.maturationCorticotherapie.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.maturationCorticotherapie,
            CriteriaDataKey.MATURATION_CORTICOTHERAPIE,
            type,
            'Corticothérapie pour maturation foetal faite :'
          )
        )
      if (selectedCriteria.chirurgicalGesture && selectedCriteria.chirurgicalGesture.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.chirurgicalGesture,
            CriteriaDataKey.CHIRURGICAL_GESTURE,
            type,
            'Type de geste ou de chirurgie :'
          )
        )
      if (selectedCriteria.childbirth && selectedCriteria.childbirth.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.childbirth,
            CriteriaDataKey.CHILDBIRTH,
            type,
            'Accouchement :'
          )
        )
      if (selectedCriteria.hospitalChildBirthPlace && selectedCriteria.hospitalChildBirthPlace.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.hospitalChildBirthPlace,
            CriteriaDataKey.HOSPITALCHILDBIRTHPLACE,
            type,
            "Accouchement à la maternité de l'hospitalisation :"
          )
        )
      if (selectedCriteria.otherHospitalChildBirthPlace && selectedCriteria.otherHospitalChildBirthPlace.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.otherHospitalChildBirthPlace,
            CriteriaDataKey.OTHERHOSPITALCHILDBIRTHPLACE,
            type,
            'Accouchement dans un autre hôpital :'
          )
        )
      if (selectedCriteria.homeChildBirthPlace && selectedCriteria.homeChildBirthPlace.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.homeChildBirthPlace,
            CriteriaDataKey.HOMECHILDBIRTHPLACE,
            type,
            'Accouchement à domicile :'
          )
        )
      if (selectedCriteria.childbirthMode && selectedCriteria.childbirthMode.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.childbirthMode,
            CriteriaDataKey.CHILDBIRTH_MODE,
            type,
            'Mode de mise en travail :'
          )
        )
      if (selectedCriteria.maturationReason && selectedCriteria.maturationReason.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.maturationReason,
            CriteriaDataKey.MATURATION_REASON,
            type,
            'Motif(s) de maturation / déclenchement :'
          )
        )
      if (selectedCriteria.maturationModality && selectedCriteria.maturationModality.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.maturationModality,
            CriteriaDataKey.MATURATION_MODALITY,
            type,
            'Modalités de maturation cervicale initiale :'
          )
        )
      if (selectedCriteria.imgIndication && selectedCriteria.imgIndication.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.imgIndication,
            CriteriaDataKey.IMG_INDICATION,
            type,
            "Indication de l'IMG :"
          )
        )
      if (selectedCriteria.laborOrCesareanEntry && selectedCriteria.laborOrCesareanEntry.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.laborOrCesareanEntry,
            CriteriaDataKey.LABOR_OR_CESAREAN_ENTRY,
            type,
            "Présentation à l'entrée en travail ou en début de césarienne :"
          )
        )
      if (selectedCriteria.pathologyDuringLabor && selectedCriteria.pathologyDuringLabor.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.pathologyDuringLabor,
            CriteriaDataKey.PATHOLOGY_DURING_LABOR,
            type,
            'Pathologie pendant le travail :'
          )
        )
      if (selectedCriteria.obstetricalGestureDuringLabor && selectedCriteria.obstetricalGestureDuringLabor.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.obstetricalGestureDuringLabor,
            CriteriaDataKey.OBSTETRICAL_GESTURE_DURING_LABOR,
            type,
            'Geste ou manoeuvre obstétricale pendant le travail :'
          )
        )
      if (selectedCriteria.analgesieType && selectedCriteria.analgesieType.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.analgesieType,
            CriteriaDataKey.ANALGESIE_TYPE,
            type,
            'ANALGESIE / ANESTHESIE - type :'
          )
        )
      if (selectedCriteria.birthDeliveryStartDate || selectedCriteria.birthDeliveryEndDate)
        labels.push(
          getDatesLabel(
            [selectedCriteria.birthDeliveryStartDate, selectedCriteria.birthDeliveryEndDate],
            "Date/heure de l'accouchement :"
          )
        )
      if (
        !isNaN(selectedCriteria.birthDeliveryWeeks) &&
        selectedCriteria.birthDeliveryWeeksComparator &&
        selectedCriteria.birthDeliveryWeeks !== 0
      )
        labels.push(
          getNbOccurencesLabel(
            selectedCriteria.birthDeliveryWeeks,
            selectedCriteria.birthDeliveryWeeksComparator,
            'Nombre de semaines (Accouchement - Terme)'
          )
        )
      if (
        !isNaN(selectedCriteria.birthDeliveryDays) &&
        selectedCriteria.birthDeliveryDaysComparator &&
        selectedCriteria.birthDeliveryDays !== 0
      )
        labels.push(
          getNbOccurencesLabel(
            selectedCriteria.birthDeliveryDays,
            selectedCriteria.birthDeliveryDaysComparator,
            'Nombre de jours (Accouchement - Terme)'
          )
        )
      if (selectedCriteria.birthDeliveryWay && selectedCriteria.birthDeliveryWay.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.birthDeliveryWay,
            CriteriaDataKey.BIRTH_DELIVERY_WAY,
            type,
            "Voie d'accouchement :"
          )
        )
      if (selectedCriteria.instrumentType && selectedCriteria.instrumentType.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.instrumentType,
            CriteriaDataKey.INSTRUMENT_TYPE,
            type,
            "Type d'instrument :"
          )
        )
      if (selectedCriteria.cSectionModality && selectedCriteria.cSectionModality.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.cSectionModality,
            CriteriaDataKey.C_SECTION_MODALITY,
            type,
            'Modalités de la césarienne :'
          )
        )
      if (selectedCriteria.presentationAtDelivery && selectedCriteria.presentationAtDelivery.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.presentationAtDelivery,
            CriteriaDataKey.PRESENTATION_AT_DELIVERY,
            type,
            "Présentation à l'accouchement :"
          )
        )
      if (
        !isNaN(selectedCriteria.birthMensurationsGrams) &&
        selectedCriteria.birthMensurationsGramsComparator &&
        selectedCriteria.birthMensurationsGrams !== 0
      )
        labels.push(
          getNbOccurencesLabel(
            selectedCriteria.birthMensurationsGrams,
            selectedCriteria.birthMensurationsGramsComparator,
            'Mensurations naissance - Poids (g) :'
          )
        )
      if (
        !isNaN(selectedCriteria.birthMensurationsPercentil) &&
        selectedCriteria.birthMensurationsPercentilComparator &&
        selectedCriteria.birthMensurationsPercentil !== 0
      )
        labels.push(
          getNbOccurencesLabel(
            selectedCriteria.birthMensurationsPercentil,
            selectedCriteria.birthMensurationsPercentilComparator,
            'Mensurations naissance - Poids (percentile) :'
          )
        )
      if (!isNaN(selectedCriteria.apgar1) && selectedCriteria.apgar1Comparator && selectedCriteria.apgar1 !== 0)
        labels.push(
          getNbOccurencesLabel(selectedCriteria.apgar1, selectedCriteria.apgar1Comparator, 'Score Apgar - 1 min :')
        )
      if (!isNaN(selectedCriteria.apgar3) && selectedCriteria.apgar3Comparator && selectedCriteria.apgar3 !== 0)
        labels.push(
          getNbOccurencesLabel(selectedCriteria.apgar3, selectedCriteria.apgar3Comparator, 'Score Apgar - 3 min :')
        )
      if (!isNaN(selectedCriteria.apgar5) && selectedCriteria.apgar5Comparator && selectedCriteria.apgar5 !== 0)
        labels.push(
          getNbOccurencesLabel(selectedCriteria.apgar5, selectedCriteria.apgar5Comparator, 'Score Apgar - 5 min :')
        )
      if (!isNaN(selectedCriteria.apgar10) && selectedCriteria.apgar10Comparator && selectedCriteria.apgar10 !== 0)
        labels.push(
          getNbOccurencesLabel(selectedCriteria.apgar10, selectedCriteria.apgar10Comparator, 'Score Apgar - 10 min :')
        )
      if (
        !isNaN(selectedCriteria.arterialPhCord) &&
        selectedCriteria.arterialPhCordComparator &&
        selectedCriteria.arterialPhCord !== 0
      )
        labels.push(
          getNbOccurencesLabel(
            selectedCriteria.arterialPhCord,
            selectedCriteria.arterialPhCordComparator,
            'pH artériel au cordon :'
          )
        )
      if (
        !isNaN(selectedCriteria.arterialCordLactates) &&
        selectedCriteria.arterialCordLactatesComparator &&
        selectedCriteria.arterialCordLactates !== 0
      )
        labels.push(
          getNbOccurencesLabel(
            selectedCriteria.arterialCordLactates,
            selectedCriteria.arterialCordLactatesComparator,
            'Lactate artériel au cordon (mmol/L) :'
          )
        )
      if (selectedCriteria.birthStatus && selectedCriteria.birthStatus.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.birthStatus,
            CriteriaDataKey.BIRTHSTATUS,
            type,
            'Statut vital à la naissance :'
          )
        )
      if (selectedCriteria.postpartumHemorrhage && selectedCriteria.postpartumHemorrhage.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.postpartumHemorrhage,
            CriteriaDataKey.POSTPARTUM_HEMORRHAGE,
            type,
            'Hémorragie du post-partum :'
          )
        )
      if (selectedCriteria.conditionPerineum && selectedCriteria.conditionPerineum.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.conditionPerineum,
            CriteriaDataKey.CONDITION_PERINEUM,
            type,
            'État du Périnée :'
          )
        )
      if (selectedCriteria.exitPlaceType && selectedCriteria.exitPlaceType.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.exitPlaceType,
            CriteriaDataKey.EXIT_PLACE_TYPE,
            type,
            'Type de lieu de sortie :'
          )
        )
      if (selectedCriteria.feedingType && selectedCriteria.feedingType.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.feedingType,
            CriteriaDataKey.FEEDING_TYPE,
            type,
            "Type d'allaitement :"
          )
        )
      if (selectedCriteria.complication && selectedCriteria.complication.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.complication,
            CriteriaDataKey.COMPLICATION,
            type,
            'Aucune complication :'
          )
        )
      if (selectedCriteria.exitFeedingMode && selectedCriteria.exitFeedingMode.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.exitFeedingMode,
            CriteriaDataKey.EXIT_FEEDING_MODE,
            type,
            "Mode d'allaitement à la sortie :"
          )
        )
      if (selectedCriteria.exitDiagnostic && selectedCriteria.exitDiagnostic.length > 0)
        labels.push(
          getLabelFromCriteriaObject(
            criteriaState,
            selectedCriteria.exitDiagnostic,
            CriteriaDataKey.EXIT_DIAGNOSTIC,
            type,
            'Diagnostic de sortie :'
          )
        )
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
    case RessourceType.PREGNANCY:
    case RessourceType.HOSPIT:
      if (selectedCriteria.encounterStartDate || selectedCriteria.encounterEndDate)
        labels.push(
          getDatesLabel([selectedCriteria.encounterStartDate, selectedCriteria.encounterEndDate], 'Prise en charge')
        )
      if (!isNaN(selectedCriteria.occurrence) && selectedCriteria.occurrenceComparator)
        labels.push(
          getNbOccurencesLabel(
            selectedCriteria.occurrence,
            selectedCriteria.occurrenceComparator,
            "Nombre d'occurences"
          )
        )
      if (selectedCriteria.startOccurrence || selectedCriteria.endOccurrence)
        labels.push(getDatesLabel([selectedCriteria.startOccurrence, selectedCriteria.endOccurrence], 'Occurence'))
      if (selectedCriteria.encounterService && selectedCriteria.encounterService.length > 0)
        labels.push(getLabelFromName(selectedCriteria.encounterService))
  }

  return labels
}
