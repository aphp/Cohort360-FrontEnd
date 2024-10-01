import { MedicationAdministration, MedicationRequest, Patient } from 'fhir/r4'
import moment from 'moment'
import { CellType, Column, Row, Table } from 'types/table'
import { getAge } from 'utils/age'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { ResourceType, VitalStatusLabel } from 'types/requestCriterias'
import { PatientTableLabels, PatientsResponse } from 'types/patient'
import { Order } from 'types/searchCriterias'
import { CohortMedication, CohortPMSI, CohortResults } from 'types'
import { getPmsiCodes, getPmsiDate } from './pmsi'
import { getExtension } from 'utils/fhir'
import { getConfig } from 'config'
import { Data } from 'components/ExplorationBoard/useData'
import { mapToDate } from './dates'
import { getCodes, getMedicationDate } from './medication'

export const mapPatientsToColumns = (deidentified: boolean): Column[] => {
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

export const mapPmsiToColumns = (type: ResourceType, deidentified: boolean): Column[] => {
  return [
    { label: `IPP${deidentified ? ' chiffré' : ''}` },
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Codage le', code: Order.DATE },
    { label: 'source' },
    { label: 'Code', code: Order.CODE },
    { label: 'Libellé' },
    type === ResourceType.CONDITION && { label: 'Type' },
    { label: 'Unité exécutrice' }
  ].filter((elem) => elem) as Column[]
}

const mapMedicationToColumns = (type: ResourceType, deidentified: boolean): Column[] => {
  return [
    { label: `IPP${deidentified ? ' chiffré' : ''}` },
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Date', code: Order.PERIOD_START },
    { label: 'Code ATC', code: Order.MEDICATION_ATC },
    { label: 'Code UCD', code: Order.MEDICATION_UCD },
    type === ResourceType.MEDICATION_REQUEST && { label: 'Type de prescription', code: Order.PRESCRIPTION_TYPES },
    { label: "Voie d'administration", code: Order.ADMINISTRATION_MODE },
    type === ResourceType.MEDICATION_ADMINISTRATION && { label: 'Quantité', align: 'center' },
    { label: 'Unité exécutrice' },
    type === ResourceType.MEDICATION_ADMINISTRATION && !deidentified && { label: 'Commentaire' }
  ].filter((elem) => elem) as Column[]
}

export const mapPatientsToRows = (patients: Patient[], deidentified: boolean, groupId?: string) => {
  const rows: Row[] = []
  patients.forEach((patient) => {
    const row: Row = [
      {
        id: `${patient.id}-ipp`,
        value: {
          label: deidentified
            ? patient.id
            : patient.identifier?.find((identifier) => identifier.type?.coding?.[0].code === 'IPP')?.value ??
              patient.identifier?.[0].value ??
              'IPP inconnnu',
          url: `/patients/${patient.id}${groupId ?? ''}` /*${_search}*/
        },
        type: CellType.LINK
      },
      {
        id: `${patient.id}-gender`,
        value: patient.gender?.toLocaleUpperCase() ?? '',
        type: CellType.GENDER_ICON
      },
      {
        id: `${patient.id}-name`,
        value: deidentified
          ? 'Prénom'
          : patient.name?.[0].given?.[0]
          ? capitalizeFirstLetter(patient.name?.[0].given?.[0])
          : 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${patient.id}-lastname`,
        value: deidentified
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
              .join(' ') ?? 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${patient.id}-birthdate`,
        value: deidentified
          ? getAge(patient)
          : `${moment(patient.birthDate).format('DD/MM/YYYY') ?? 'Non renseigné'} (${getAge(patient)})`,
        type: CellType.TEXT
      },
      {
        id: `${patient.id}-lastEncounter`,
        value: patient.extension?.[5]?.valueReference?.display ?? '',
        type: CellType.TEXT
      },
      {
        id: `${patient.id}-vitalStatus`,
        value: patient.deceasedBoolean || patient.deceasedDateTime ? VitalStatusLabel.DECEASED : VitalStatusLabel.ALIVE,
        type: CellType.VITALSTATUS_CHIP
      }
    ]
    rows.push(row)
  })
  return rows
}

export const mapPmsiToRows = (
  list: CohortPMSI[],
  type: ResourceType.CLAIM | ResourceType.CONDITION | ResourceType.PROCEDURE,
  groupId?: string
) => {
  const rows: Row[] = []
  console.log('test data', list)
  list.forEach((elem) => {
    const hasDiagnosticType = type === ResourceType.CONDITION
    const date = getPmsiDate(type, elem)
    const codes = getPmsiCodes(type, elem)
    const row: Row = [
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
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-code`,
        value: codes.code ?? 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-display`,
        value: codes.display ?? 'Non renseigné',
        type: CellType.TEXT
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

export const mapMedicationToRows = (
  list: CohortMedication<MedicationRequest | MedicationAdministration>[],
  type: ResourceType.MEDICATION_REQUEST | ResourceType.MEDICATION_ADMINISTRATION,
  groupId?: string
) => {
  const rows: Row[] = []
  console.log('test data', list)
  list.forEach((elem) => {
    const date = getMedicationDate(type, elem)
    const [codeATC, displayATC, , codeATCSystem] = getCodes(
      elem,
      getConfig().features.medication.valueSets.medicationAtc.url,
      getConfig().features.medication.valueSets.medicationAtcOrbis.url
    )
    const atcDisplay = `[${codeATCSystem ?? 'Non renseigné'}]  [${
      codeATC === 'No matching concept' || codeATC === 'Non Renseigné' ? '' : codeATC ?? ''
    }] [${displayATC === 'No matching concept' ? '-' : displayATC ?? '-'}]`
    const [codeUCD, displayUCD, , codeUCDSystem] = getCodes(
      elem,
      getConfig().features.medication.valueSets.medicationUcd.url,
      '.*-ucd'
    )
    const ucdDisplay = `[${codeUCDSystem ?? 'Non renseigné'}]  [${
      codeUCD === 'No matching concept' || codeUCD === 'Non Renseigné' ? '' : codeUCD ?? ''
    }] [${displayUCD === 'No matching concept' ? '-' : displayUCD ?? '-'}]`
    const prescriptionType = type === ResourceType.MEDICATION_REQUEST && (elem.category?.[0].coding?.[0].display ?? '-')
    const administrationRoute =
      type === ResourceType.MEDICATION_REQUEST
        ? elem.dosageInstruction?.[0]?.route?.coding?.[0]?.display
        : elem.dosage?.route?.coding?.[0]?.display
    const quantity =
      type === ResourceType.MEDICATION_ADMINISTRATION &&
      `${elem?.dosage?.dose?.value ?? '-'} ${elem.dosage?.dose?.unit ?? '-'}`
    const comment = type === ResourceType.MEDICATION_ADMINISTRATION && (elem.dosage?.text ?? "Non renseigné")
    const row: Row = [
      {
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
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-ucd`,
        value: ucdDisplay,
        type: CellType.TEXT
      },
      prescriptionType && {
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
      quantity && {
        id: `${elem.id}-unit`,
        value: quantity,
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-executiveUnits`,
        value: elem.serviceProvider ?? '-',
        type: CellType.TEXT
      },
      comment && {
        id: `${elem.id}-comment`,
        value: comment.split('\n'),
        type: CellType.MODAL
      }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return rows
}

export const isPatientsResponse = (data: Data): data is PatientsResponse => {
  return 'originalPatients' in data
}

const isOtherResourcesResponse = (data: Data): data is CohortResults<any> => {
  return 'list' in data
}

const isPmsiCohort = (data: CohortResults<any>): data is CohortResults<CohortPMSI> => {
  const type = data.list[0].resourceType
  return type === ResourceType.CONDITION || type === ResourceType.PROCEDURE || type === ResourceType.CLAIM
}

const isMedicationCohort = (
  data: CohortResults<any>
): data is CohortResults<CohortMedication<MedicationRequest | MedicationAdministration>> => {
  const type = data.list[0].resourceType
  return type === ResourceType.MEDICATION_ADMINISTRATION || type === ResourceType.MEDICATION_REQUEST
}

export const map = (data: Data, type: ResourceType, deidentified: boolean, groupId?: string) => {
  const table: Table = { rows: [], columns: [] }
  if (isPatientsResponse(data) && data.originalPatients) {
    table.columns = mapPatientsToColumns(deidentified)
    table.rows = mapPatientsToRows(data.originalPatients, deidentified)
  }
  if (isOtherResourcesResponse(data)) {
    if (data.list.length) {
      if (isPmsiCohort(data)) {
        const _type = type as ResourceType.CONDITION | ResourceType.CLAIM | ResourceType.PROCEDURE
        table.columns = mapPmsiToColumns(type, deidentified)
        table.rows = mapPmsiToRows(data.list, _type, groupId)
      }
      if (isMedicationCohort(data)) {
        const _type = type as ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST
        table.columns = mapMedicationToColumns(_type, deidentified)
        table.rows = mapMedicationToRows(data.list, _type, groupId)
      }
    }
  }
  return table
}
