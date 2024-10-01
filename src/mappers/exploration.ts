import { ImagingStudySeries, MedicationAdministration, MedicationRequest, Patient } from 'fhir/r4'
import { CellType, Column, Row, Table } from 'types/table'
import { PMSIResourceTypes, ResourceType } from 'types/requestCriterias'
import { PatientTableLabels } from 'types/patient'
import { DocumentStatuses, FormNames, Order } from 'types/searchCriterias'
import { getPmsiCodes, getPmsiDate } from './pmsi'
import { getFormDetails, getFormLabel } from 'utils/formUtils'
import {
  CohortImaging,
  CohortObservation,
  CohortPMSI,
  CohortQuestionnaireResponse,
  CohortMedication,
  CohortComposition
} from 'types'
import { mapToDate, mapToDateHours } from './dates'
import { getExtension } from 'utils/fhir'
import { getConfig } from 'config'
import { getCodes, getMedicationDate } from './medication'
import { Status } from 'components/ui/StatusChip'
import { getDocumentStatus } from 'utils/documentsFormatter'
import CheckIcon from 'assets/icones/check.svg?react'
import CancelIcon from 'assets/icones/times.svg?react'
import docTypes from 'assets/docTypes.json'
import {
  getPatientInfos,
  isBiology,
  isDocuments,
  isImaging,
  isMedication,
  isOtherResourcesResponse,
  isPatientsResponse,
  isPmsi,
  isQuestionnaire
} from 'utils/exploration'
import { formatValueRange } from './biology'
import { Paragraph } from 'components/ui/Paragraphs'
import { Buffer } from 'buffer'
import { Card } from 'types/card'
import { Data } from 'types/exploration'

const mapPatientsToColumns = (deidentified: boolean): Column[] => {
  return [
    {
      label: `${PatientTableLabels.IPP}${!deidentified ? '' : ' chiffré'}`,
      code: !deidentified ? Order.IPP : undefined
    },
    { label: PatientTableLabels.GENDER, code: `${Order.GENDER},${Order.ID}` },
    { label: PatientTableLabels.NAME, code: !deidentified ? Order.NAME : undefined },
    { label: PatientTableLabels.LASTNAME, code: !deidentified ? Order.FAMILY : undefined },
    {
      label: !deidentified ? PatientTableLabels.BIRTHDATE : PatientTableLabels.AGE,
      code: `${!deidentified ? Order.BIRTHDATE : Order.AGE_MONTH},${Order.ID}`
    },
    { label: PatientTableLabels.LAST_ENCOUNTER },
    { label: PatientTableLabels.VITAL_STATUS }
  ]
}

const mapPmsiToColumns = (type: ResourceType, deidentified: boolean, isPatient: boolean): Column[] => {
  return [
    !isPatient && { label: `IPP${deidentified ? ' chiffré' : ''}` },
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Codage le', code: Order.DATE },
    { label: 'source' },
    { label: 'Code', code: Order.CODE },
    { label: 'Libellé' },
    type === ResourceType.CONDITION && { label: 'Type' },
    { label: 'Unité exécutrice' }
  ].filter((elem) => elem) as Column[]
}

const mapQuestionnaireToColumns = (): Column[] => {
  return [
    { label: 'Type de formulaire' },
    { label: "Date d'écriture", code: Order.AUTHORED },
    { label: `IPP` },
    { label: 'Unité exécutrice' },
    { label: 'Aperçu', align: 'center' }
  ].filter((elem) => elem) as Column[]
}

const mapImagingToColumns = (deidentified: boolean, isPatient: boolean): Column[] => {
  return [
    { label: `` },
    !isPatient && { label: `IPP${deidentified ? ' chiffré' : ''}` },
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Date', code: `${Order.STUDY_DATE},id` },
    { label: 'Modalité', align: 'center' },
    { label: 'Description', align: 'center' },
    { label: 'Code Procédure', align: 'center' },
    { label: 'Nombre de séries', align: 'center' },
    !deidentified && { label: 'Access number', align: 'center' },
    { label: 'Unité exécutrice', align: 'center' },
    { label: 'Comptes rendus', align: 'center' }
  ].filter((elem) => elem) as Column[]
}

const mapBiologyToColumns = (deidentified: boolean, isPatient: boolean): Column[] => {
  return [
    !isPatient && { label: `IPP${deidentified ? ' chiffré' : ''}` },
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Date de prélèvement', code: Order.DATE },
    { label: 'ANABIO', code: Order.ANABIO },
    { label: 'LOINC', code: Order.LOINC },
    { label: 'Résultat', align: 'center' },
    { label: 'Valeurs de référence', align: 'center' },
    { label: 'Unité exécutrice', align: 'center' }
  ].filter((elem) => elem) as Column[]
}

const mapMedicationToColumns = (type: ResourceType, deidentified: boolean, isPatient: boolean): Column[] => {
  return [
    !isPatient && { label: `IPP${deidentified ? ' chiffré' : ''}` },
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Date', code: Order.PERIOD_START },
    { label: 'Code ATC', code: Order.MEDICATION_ATC, align: 'center' },
    { label: 'Code UCD', code: Order.MEDICATION_UCD, align: 'center' },
    type === ResourceType.MEDICATION_REQUEST && {
      label: 'Type de prescription',
      code: Order.PRESCRIPTION_TYPES
    },
    { label: "Voie d'administration", code: Order.ADMINISTRATION_MODE },
    type === ResourceType.MEDICATION_ADMINISTRATION && { label: 'Quantité', align: 'center' },
    { label: 'Unité exécutrice' },
    type === ResourceType.MEDICATION_ADMINISTRATION && !deidentified && { label: 'Commentaire' }
  ].filter((elem) => elem) as Column[]
}

const mapDocumentsToColumns = (deidentified: boolean, isPatient: boolean): Column[] => {
  return [
    { label: 'Statut' },
    { label: 'Nom / Date', code: Order.DATE },
    !isPatient && { label: `IPP${deidentified ? ' chiffré' : ''}`, code: Order.SUBJECT_IDENTIFIER },
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Unité exécutrice' },
    { label: 'Type de document', code: Order.TYPE },
    { label: 'Aperçu' }
  ].filter((elem) => elem) as Column[]
}

const mapPatientsToInfo = (patients: Patient[], deidentified: boolean, groupId: string[]) => {
  const infos: Card[] = []
  patients.forEach((patient) => {
    const { vitalStatus, surname, lastname, ipp, age, gender } = getPatientInfos(patient, deidentified, groupId)
    const info: Card = {
      url: ipp.url,
      sections: []
    }
    info.sections.push({
      id: 'firstSection',
      size: 1,
      lines: [
        {
          id: `${patient.id}-gender`,
          value: gender,
          type: CellType.GENDER_ICON
        }
      ]
    })
    info.sections.push({
      id: 'secondSection',
      size: 7,
      lines: [
        {
          id: `${patient.id}-name`,
          value: [{ text: `${surname} ${lastname}` }],
          type: CellType.PARAGRAPHS
        },
        {
          id: `${patient.id}-infos`,
          value: [{ text: `${age.age} - ${ipp.label}`, sx: { color: 'grey' } }],
          type: CellType.PARAGRAPHS
        }
      ]
    })
    info.sections.push({
      id: 'thirdSection',
      size: 3,
      lines: [
        {
          id: `${patient.id}-vitalStatus`,
          value: vitalStatus,
          type: CellType.STATUS_CHIP
        }
      ]
    })

    infos.push(info)
  })
  return infos
}

const mapPatientsToRows = (patients: Patient[], deidentified: boolean, groupId: string[]) => {
  const rows: Row[] = []
  patients.forEach((patient) => {
    const { vitalStatus, lastEncounter, surname, lastname, ipp, age, gender } = getPatientInfos(
      patient,
      deidentified,
      groupId
    )
    const row: Row = [
      {
        id: `${patient.id}-ipp`,
        value: ipp,
        type: CellType.LINK
      },
      {
        id: `${patient.id}-gender`,
        value: gender,
        type: CellType.GENDER_ICON
      },
      {
        id: `${patient.id}-name`,
        value: surname,
        type: CellType.TEXT
      },
      {
        id: `${patient.id}-lastname`,
        value: lastname,
        type: CellType.TEXT
      },
      {
        id: `${patient.id}-birthdate`,
        value: `${age.birthdate} (${age.age})`,
        type: CellType.TEXT
      },
      {
        id: `${patient.id}-lastEncounter`,
        value: lastEncounter,
        type: CellType.TEXT
      },
      {
        id: `${patient.id}-vitalStatus`,
        value: vitalStatus,
        type: CellType.STATUS_CHIP
      }
    ]
    rows.push(row)
  })
  return rows
}

const mapPmsiToRows = (list: CohortPMSI[], type: PMSIResourceTypes, isPatient: boolean, groupId: string[]) => {
  const rows: Row[] = []
  list.forEach((elem) => {
    const hasDiagnosticType = type === ResourceType.CONDITION
    const date = getPmsiDate(type, elem)
    const codes = getPmsiCodes(type, elem)
    const row: Row = [
      !isPatient && {
        id: `${elem.id}-ipp`,
        value: elem.IPP
          ? {
              label: elem.IPP,
              url: `/patients/${elem.idPatient}${groupId ? `?groupId=${groupId}` : ''}`
            }
          : 'Non renseigné',
        type: elem.IPP ? CellType.LINK : CellType.TEXT
      },
      {
        id: `${elem.id}-nda`,
        value: elem.NDA ?? 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-codage`,
        value: date ? mapToDate(date) : 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-source`,
        value: elem.meta?.source ?? 'Non renseigné',
        type: CellType.TEXT,
        sx: { fontWeight: 900 }
      },
      {
        id: `${elem.id}-code`,
        value: codes.code || 'Non renseigné',
        type: CellType.TEXT,
        sx: { fontWeight: 900 }
      },
      {
        id: `${elem.id}-display`,
        value: codes.display || 'Non renseigné',
        type: CellType.TEXT,
        sx: { fontWeight: 900 }
      },
      hasDiagnosticType && {
        id: `${elem.id}-type`,
        value:
          getExtension(
            elem,
            getConfig().features.condition.extensions.orbisStatus
          )?.valueCodeableConcept?.coding?.[0]?.code?.toUpperCase() ?? '-',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-executiveUnits`,
        value: elem.serviceProvider ?? '-',
        type: CellType.TEXT
      }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return rows
}

const mapQuestionnaireToRows = (list: CohortQuestionnaireResponse[], groupId: string[]) => {
  const rows: Row[] = []
  list.forEach((elem) => {
    const formName = elem.formName as FormNames
    const date = elem.authored
    const row: Row = [
      {
        id: `${elem.id}-formName`,
        value: formName ? getFormLabel(formName) : 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-date`,
        value: date ? mapToDate(date) : 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-ipp`,
        value: elem.IPP
          ? {
              label: elem.IPP,
              url: `/patients/${elem.idPatient}${groupId ? `?groupId=${groupId}` : ''}`
            }
          : 'Non renseigné',
        type: elem.IPP ? CellType.LINK : CellType.TEXT
      },
      {
        id: `${elem.id}-executiveUnits`,
        value: elem.serviceProvider ?? '-',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-details`,
        value: getFormDetails(elem, formName),
        type: CellType.LINES,
        align: 'center'
      }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return rows
}

const mapImagingSeries = (series: ImagingStudySeries[]): Table => {
  const sorted = series.slice()?.sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
  const rows: Row[] = []
  sorted.forEach((elem) => {
    const date = elem.started
    const protocol = getExtension(elem, getConfig().features.imaging.extensions.seriesProtocolUrl)?.valueString
    const row: Row = [
      {
        id: `${elem.uid}-number`,
        value: elem.number ?? 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.uid}-date`,
        value: date ? mapToDate(date) : 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.uid}-modality`,
        value: elem.modality?.code ?? '-',
        type: CellType.TEXT,
        align: 'center'
      },
      {
        id: `${elem.uid}-description`,
        value: elem.description ?? '-',
        type: CellType.TEXT,
        align: 'center'
      },
      {
        id: `${elem.uid}-protocol`,
        value: protocol ?? '-',
        type: CellType.TEXT,
        align: 'center'
      },
      {
        id: `${elem.uid}-nbInstances`,
        value: elem.numberOfInstances ?? '-',
        type: CellType.TEXT,
        align: 'center'
      },
      {
        id: `${elem.uid}-bodySite`,
        value: elem.bodySite?.display ?? '-',
        type: CellType.TEXT,
        align: 'center'
      }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return {
    columns: [
      { label: 'N°' },
      { label: 'Date' },
      { label: 'Modalité', align: 'center' },
      { label: 'Description', align: 'center' },
      { label: 'Protocole', align: 'center' },
      { label: "Nombre d'instances", align: 'center' },
      { label: 'Partie du corps', align: 'center' }
    ],
    rows
  }
}

const mapImagingToRows = (list: CohortImaging[], deidentified: boolean, isPatient: boolean, groupId: string[]) => {
  const rows: Row[] = []
  list.forEach((elem) => {
    const date = elem.started
    const modality = elem.modality?.map((modality) => modality.code).join(' / ') ?? '-'
    const description = elem.description ?? '-'
    const procedure = elem.procedureCode?.[0]?.coding?.[0]?.code ?? '-'
    const nbSeries = elem.numberOfSeries ?? '-'
    const accessNumber =
      elem.identifier?.find((identifier) => identifier.system?.includes('accessNumber'))?.value ?? '-'
    // TODO remove the fetch by extension when fhir drop it (expected in 2.21.0 or 2.22.0)
    const documentId = elem.diagnosticReport
      ? elem.diagnosticReport.presentedForm
          ?.find((el) => el.contentType === 'application/pdf')
          ?.url?.split('/')
          .pop()
      : getExtension(elem, 'docId')?.valueString
    const row: Row = [
      {
        id: `${elem.id}-subArray`,
        value: mapImagingSeries(elem.series ?? []),
        type: CellType.SUBARRAY
      },
      !isPatient && {
        id: `${elem.id}-ipp`,
        value: elem.IPP
          ? {
              label: elem.IPP,
              url: `/patients/${elem.idPatient}${groupId ? `?groupId=${groupId}` : ''}`
            }
          : 'Non renseigné',
        type: elem.IPP ? CellType.LINK : CellType.TEXT
      },
      {
        id: `${elem.id}-nda`,
        value: elem.NDA ?? 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-date`,
        value: date ? mapToDate(date) : 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-modality`,
        value: modality,
        type: CellType.TEXT,
        align: 'center'
      },
      {
        id: `${elem.id}-description`,
        value: description,
        type: CellType.TEXT,
        align: 'center',
        sx: { fontWeight: 900 }
      },
      {
        id: `${elem.id}-procedure`,
        value: procedure,
        type: CellType.TEXT,
        align: 'center',
        sx: { fontWeight: 900 }
      },
      {
        id: `${elem.id}-nbSeries`,
        value: nbSeries,
        type: CellType.TEXT,
        align: 'center'
      },
      !deidentified && {
        id: `${elem.id}-accessNumber`,
        value: accessNumber,
        type: CellType.TEXT,
        align: 'center'
      },
      {
        id: `${elem.id}-executiveUnits`,
        value: elem.serviceProvider ?? '-',
        type: CellType.TEXT,
        align: 'center'
      },
      {
        id: `${elem.id}-viewDoc`,
        value: { id: documentId, deidentified },
        type: CellType.DOCUMENT_VIEWER,
        align: 'center'
      }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return rows
}

const mapBiologyToRows = (list: CohortObservation[], isPatient: boolean, groupId: string[]) => {
  const rows: Row[] = []
  list.forEach((elem) => {
    const anabio = elem.code?.coding?.find(
      (code) =>
        code.system === getConfig().features.observation.valueSets.biologyHierarchyAnabio.url && code.userSelected
    )?.display
    const codeLOINC = elem.code?.coding?.find(
      (code) =>
        code.system === getConfig().features.observation.valueSets.biologyHierarchyLoinc.url && code.userSelected
    )?.code
    const libelleLOINC = elem.code?.coding?.find(
      (code) =>
        code.system === getConfig().features.observation.valueSets.biologyHierarchyLoinc.url && code.userSelected
    )?.display
    const result =
      elem.valueQuantity && elem.valueQuantity?.value !== null
        ? `${elem.valueQuantity?.value} ${elem.valueQuantity?.unit ?? ''}`
        : '-'
    const valueUnit = elem.valueQuantity?.unit ?? ''
    const referenceRangeArray = elem.referenceRange?.[0]
    const referenceRange = referenceRangeArray
      ? `${formatValueRange(referenceRangeArray?.low?.value, valueUnit)} - ${formatValueRange(
          referenceRangeArray?.high?.value,
          valueUnit
        )}`
      : '-'
    const row: Row = [
      !isPatient && {
        id: `${elem.id}-ipp`,
        value: elem.IPP
          ? {
              label: elem.IPP,
              url: `/patients/${elem.idPatient}${groupId ? `?groupId=${groupId}` : ''}`
            }
          : 'Non renseigné',
        type: elem.IPP ? CellType.LINK : CellType.TEXT
      },
      {
        id: `${elem.id}-nda`,
        value: elem.NDA ?? 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-effectiveDatetime`,
        value: elem.effectiveDateTime ? mapToDate(elem.effectiveDateTime) : 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-anabio`,
        value: anabio === 'No matching concept' ? '-' : anabio ?? '-',
        type: CellType.TEXT,
        sx: { fontWeight: 900 }
      },
      {
        id: `${elem.id}-loinc`,
        value: `${codeLOINC === 'No matching concept' || codeLOINC === 'Non Renseigné' ? '' : codeLOINC ?? ''} - ${
          libelleLOINC === 'No matching concept' ? '-' : libelleLOINC ?? '-'
        }`,
        type: CellType.TEXT,
        sx: { fontWeight: 900 }
      },
      {
        id: `${elem.id}-result`,
        value: result,
        type: CellType.TEXT,
        align: 'center'
      },
      {
        id: `${elem.id}-valueUnit`,
        value: referenceRange,
        type: CellType.TEXT,
        align: 'center'
      },
      {
        id: `${elem.id}-executiveUnits`,
        value: elem.serviceProvider ?? '-',
        type: CellType.TEXT,
        align: 'center'
      }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return rows
}

const mapDocumentsToRows = (
  list: CohortComposition[],
  deidentified: boolean,
  isPatient: boolean,
  groupId: string[],
  hasSearch?: boolean
) => {
  const rows: Row[] = []
  list.forEach((elem) => {
    const docType = docTypes.docTypes.find(
      ({ code }) => code.toLowerCase() === (elem?.type?.coding?.[0] ? elem.type.coding[0].code : '-')?.toLowerCase()
    )
    const status = {
      label: getDocumentStatus(elem.docStatus),
      status: elem.docStatus === DocumentStatuses.FINAL ? Status.VALID : Status.CANCELLED,
      icon: elem.docStatus === DocumentStatuses.FINAL ? CheckIcon : CancelIcon
    }
    const findContent = elem?.content?.find((content) => content.attachment?.contentType === 'text/plain')
    const documentContent = findContent?.attachment?.data
      ? Buffer.from(findContent?.attachment.data, 'base64').toString('utf-8')
      : ''
    const row: Row = [
      {
        id: `${elem.id}-status`,
        value: status,
        type: CellType.STATUS_CHIP
      },
      {
        id: `${elem.id}-description`,
        value: [
          { text: `${elem.description ?? 'Document sans titre'}`, sx: { fontWeight: 900 } },
          { text: `${elem.date ? mapToDateHours(elem.date) : 'Date inconnue'}` }
        ],
        type: CellType.PARAGRAPHS
      },
      !isPatient && {
        id: `${elem.id}-ipp`,
        value: elem.IPP
          ? {
              label: elem.IPP,
              url: `/patients/${elem.idPatient}${groupId ? `?groupId=${groupId}` : ''}`
            }
          : 'Non renseigné',
        type: elem.IPP ? CellType.LINK : CellType.TEXT
      },
      {
        id: `${elem.id}-nda`,
        value: elem.NDA ?? 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-executiveUnits`,
        value: elem.serviceProvider ?? '-',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-docType`,
        value: docType?.label ?? '-',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-viewDoc`,
        value: { id: elem.id, deidentified },
        type: CellType.DOCUMENT_VIEWER,
        align: 'center'
      },
      hasSearch && {
        id: `${elem.id}-docContent`,
        value: documentContent,
        type: CellType.DOCUMENT_CONTENT,
        isHidden: true
      }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return rows
}

export const mapMedicationToRows = (
  list: CohortMedication<MedicationRequest | MedicationAdministration>[],
  type: ResourceType.MEDICATION_REQUEST | ResourceType.MEDICATION_ADMINISTRATION,
  deidentified: boolean,
  isPatient: boolean,
  groupId: string[]
) => {
  const rows: Row[] = []
  list.forEach((elem) => {
    const date = getMedicationDate(type, elem)
    const [codeATC, displayATC, , codeATCSystem] = getCodes(
      elem,
      getConfig().features.medication.valueSets.medicationAtc.url,
      getConfig().features.medication.valueSets.medicationAtcOrbis.url
    )
    const atcDisplay: Paragraph[] = [
      { text: `${codeATC === 'No matching concept' || codeATC === 'Non Renseigné' ? '' : codeATC ?? ''}` },
      { text: `${displayATC === 'No matching concept' ? '-' : displayATC ?? '-'}`, sx: { fontWeight: 900 } },
      { text: `${codeATCSystem ?? 'Non renseigné'}` }
    ]
    const [codeUCD, displayUCD, , codeUCDSystem] = getCodes(
      elem,
      getConfig().features.medication.valueSets.medicationUcd.url,
      '.*-ucd'
    )
    const ucdDisplay: Paragraph[] = [
      { text: `${codeUCD === 'No matching concept' || codeUCD === 'Non Renseigné' ? '' : codeUCD ?? ''}` },
      { text: `${displayUCD === 'No matching concept' ? '-' : displayUCD ?? '-'}`, sx: { fontWeight: 900 } },
      { text: `${codeUCDSystem ?? 'Non renseigné'}` }
    ]
    const prescriptionType = (elem as MedicationRequest).category?.[0].coding?.[0].display ?? '-'
    const administrationRoute =
      (elem as MedicationRequest).dosageInstruction?.[0]?.route?.coding?.[0]?.display ??
      (elem as MedicationAdministration).dosage?.route?.coding?.[0]?.display
    const quantity = ` ${(elem as MedicationAdministration)?.dosage?.dose?.value ?? '-'} ${
      (elem as MedicationAdministration).dosage?.dose?.unit ?? '-'
    }`
    const comment = (elem as MedicationAdministration).dosage?.text ?? 'Non renseigné'
    const row: Row = [
      !isPatient && {
        id: `${elem}-ipp`,
        value: elem.IPP
          ? {
              label: elem.IPP,
              url: `/patients/${elem.idPatient}${groupId ? `?groupId=${groupId}` : ''}`
            }
          : 'Non renseigné',
        type: elem.IPP ? CellType.LINK : CellType.TEXT
      },
      {
        id: `${elem.id}-nda`,
        value: elem.NDA ?? 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-date`,
        value: date ? mapToDate(date) : 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-atc`,
        value: atcDisplay,
        type: CellType.PARAGRAPHS,
        align: 'center'
      },
      {
        id: `${elem.id}-ucd`,
        value: ucdDisplay,
        type: CellType.PARAGRAPHS,
        align: 'center'
      },
      type === ResourceType.MEDICATION_REQUEST && {
        id: `${elem.id}-prescription`,
        value: prescriptionType,
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-administration`,
        value: administrationRoute === 'No matching concept' ? '-' : administrationRoute ?? '-',
        type: CellType.TEXT,
        align: 'center'
      },
      type === ResourceType.MEDICATION_ADMINISTRATION && {
        id: `${elem.id}-unit`,
        value: quantity,
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-executiveUnits`,
        value: elem.serviceProvider ?? '-',
        type: CellType.TEXT
      },
      type === ResourceType.MEDICATION_ADMINISTRATION &&
        !deidentified && {
          id: `${elem.id}-comment`,
          value: comment.split('\n').map((elem) => ({ text: elem })),
          type: CellType.MODAL,
          align: 'center'
        }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return rows
}

export const mapToCards = (data: Data, deidentified: boolean, groupId: string[]) => {
  const infos: Card[] = []
  if (isPatientsResponse(data) && data.originalPatients)
    infos.push(...mapPatientsToInfo(data.originalPatients, deidentified, groupId))
  return infos
}

export const mapToTable = (
  data: Data,
  type: ResourceType,
  deidentified: boolean,
  isPatient: boolean,
  groupId: string[],
  hasSearch?: boolean
) => {
  const table: Table = { rows: [], columns: [] }
  if (isPatientsResponse(data) && data.originalPatients) {
    table.columns = mapPatientsToColumns(deidentified)
    table.rows = mapPatientsToRows(data.originalPatients, deidentified, groupId)
  }
  if (isOtherResourcesResponse(data)) {
    if (data.list.length) {
      if (isPmsi(data)) {
        const _type = type as PMSIResourceTypes
        table.columns = mapPmsiToColumns(type, deidentified, isPatient)
        table.rows = mapPmsiToRows(data.list, _type, isPatient, groupId)
      }
      if (!isPatient && isQuestionnaire(data)) {
        table.columns = mapQuestionnaireToColumns()
        table.rows = mapQuestionnaireToRows(data.list, groupId)
      }
      if (isImaging(data)) {
        table.columns = mapImagingToColumns(deidentified, isPatient)
        table.rows = mapImagingToRows(data.list, deidentified, isPatient, groupId)
      }
      if (isBiology(data)) {
        table.columns = mapBiologyToColumns(deidentified, isPatient)
        table.rows = mapBiologyToRows(data.list, isPatient, groupId)
      }
      if (isMedication(data)) {
        const _type = type as ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST
        table.columns = mapMedicationToColumns(_type, deidentified, isPatient)
        table.rows = mapMedicationToRows(data.list, _type, deidentified, isPatient, groupId)
      }
      if (isDocuments(data)) {
        table.columns = mapDocumentsToColumns(deidentified, isPatient)
        table.rows = mapDocumentsToRows(data.list, deidentified, isPatient, groupId, hasSearch)
      }
    }
  }
  return table
}
