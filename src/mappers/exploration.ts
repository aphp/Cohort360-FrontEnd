import { Patient } from 'fhir/r4'
import moment from 'moment'
import { CellType, Column, ColumnKey, Row, Table } from 'types/table'
import { getAge } from 'utils/age'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { PMSIResourceTypes, ResourceType, VitalStatusLabel } from 'types/requestCriterias'
import { PatientTableLabels, PatientsResponse } from 'types/patient'
import { Order } from 'types/searchCriterias'
import { CohortObservation, CohortPMSI, CohortResults } from 'types'
import { getPmsiDate } from './pmsi'
import { getExtension } from 'utils/fhir'
import { getConfig } from 'config'
import { Data } from 'components/ExplorationBoard/useData'
import { mapToDate } from './dates'

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

export const mapBiologyToColumns = (deidentified: boolean): Column[] => {
  return [
    { label: `IPP${deidentified ? ' chiffré' : ''}` },
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Date de prélèvement', code: Order.DATE },
    { label: 'ANABIO', code: Order.ANABIO },
    { label: 'LOINC', code: Order.LOINC },
    { label: 'Résultat', align: 'center' },
    { label: 'Valeurs de référence', align: 'center' },
    { label: 'Unité exécutrice', align: 'center' }
  ].filter((elem) => elem) as Column[]
}

const mapPatientsToRows = (patients: Patient[], deidentified: boolean, groupId?: string) => {
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
        type: CellType.LINK,
        key: ColumnKey.IPP
      },
      {
        id: `${patient.id}-gender`,
        value: patient.gender?.toLocaleUpperCase() ?? '',
        type: CellType.ICON,
        key: ColumnKey.GENDER
      },
      {
        id: `${patient.id}-name`,
        value: deidentified
          ? 'Prénom'
          : patient.name?.[0].given?.[0]
          ? capitalizeFirstLetter(patient.name?.[0].given?.[0])
          : 'Non renseigné',
        type: CellType.TEXT,
        key: ColumnKey.NAME
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
        type: CellType.TEXT,
        key: ColumnKey.LASTNAME
      },
      {
        id: `${patient.id}-birthdate`,
        value: deidentified
          ? getAge(patient)
          : `${moment(patient.birthDate).format('DD/MM/YYYY') ?? 'Non renseigné'} (${getAge(patient)})`,
        type: CellType.TEXT,
        key: ColumnKey.BIRTHDATE
      },
      {
        id: `${patient.id}-lastEncounter`,
        value: patient.extension?.[5]?.valueReference?.display ?? '',
        type: CellType.TEXT,
        key: ColumnKey.LAST_ENCOUNTER
      },
      {
        id: `${patient.id}-vitalStatus`,
        value: patient.deceasedBoolean || patient.deceasedDateTime ? VitalStatusLabel.DECEASED : VitalStatusLabel.ALIVE,
        type: CellType.CHIP,
        key: ColumnKey.VITAL_STATUS
      }
    ]
    rows.push(row)
  })
  return rows
}

const mapPmsiToRows = (list: CohortPMSI[], type: ResourceType, groupId?: string) => {
  const rows: Row[] = []
  console.log('test data', list)
  list.forEach((elem) => {
    const hasDiagnosticType = type === ResourceType.CONDITION
    const codes =
      type === ResourceType.CLAIM
        ? elem?.diagnosis?.[0].diagnosisCodeableConcept.coding?.find((code) => code.userSelected === true) || {
            display: '',
            code: ''
          }
        : elem?.code?.coding?.find((code) => code.userSelected === true) || { display: '', code: '' }
    const date = getPmsiDate(type as PMSIResourceTypes, elem)
    const row: Row = [
      {
        id: `${elem.id}-ipp`,
        value: elem.IPP
          ? {
              label: elem.IPP,
              url: `/patients/${elem.idPatient}${groupId ? `?groupId=${groupId}` : ''}`
            }
          : 'Non renseigné',
        type: elem.IPP ? CellType.LINK : CellType.TEXT,
        key: ColumnKey.IPP
      },
      {
        id: `${elem.id}-nda`,
        value: elem.NDA ?? 'Non renseigné',
        type: CellType.TEXT,
        key: ColumnKey.NDA
      },
      {
        id: `${elem.id}-codage`,
        value: date ? mapToDate(date) : 'Non renseignée',
        type: CellType.TEXT,
        key: ColumnKey.DATE
      },
      {
        id: `${elem.id}-source`,
        value: elem.meta?.source ?? 'Non renseigné',
        type: CellType.TEXT,
        key: ColumnKey.TEXT
      },
      {
        id: `${elem.id}-code`,
        value: codes.code ?? 'Non renseigné',
        type: CellType.TEXT,
        key: ColumnKey.TEXT
      },
      {
        id: `${elem.id}-display`,
        value: codes.display ?? 'Non renseigné',
        type: CellType.TEXT,
        key: ColumnKey.TEXT
      },
      hasDiagnosticType && {
        id: `${elem.id}-type`,
        value:
          getExtension(
            elem,
            getConfig().features.condition.extensions.orbisStatus
          )?.valueCodeableConcept?.coding?.[0]?.code?.toUpperCase() ?? '-',
        type: CellType.TEXT,
        key: ColumnKey.TEXT
      },
      {
        id: `${elem.id}-executiveUnits`,
        value: elem.serviceProvider ?? '-',
        type: CellType.TEXT,
        key: ColumnKey.TEXT
      }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return rows
}

const mapBiologyToRows = (list: CohortObservation[], groupId?: string) => {
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
    const row: Row = [
      {
        id: `${elem.id}-ipp`,
        value: elem.IPP
          ? {
              label: elem.IPP,
              url: `/patients/${elem.idPatient}${groupId ? `?groupId=${groupId}` : ''}`
            }
          : 'Non renseigné',
        type: elem.IPP ? CellType.LINK : CellType.TEXT,
        key: ColumnKey.IPP
      },
      {
        id: `${elem.id}-nda`,
        value: elem.NDA ?? 'Non renseigné',
        type: CellType.TEXT,
        key: ColumnKey.NDA
      },
      {
        id: `${elem.id}-effectiveDatetime`,
        value: elem.effectiveDateTime ? mapToDate(elem.effectiveDateTime) : 'Non renseigné',
        type: CellType.TEXT,
        key: ColumnKey.TEXT
      },
      {
        id: `${elem.id}-anabio`,
        value: anabio === 'No matching concept' ? '-' : anabio ?? '-',
        type: CellType.TEXT,
        key: ColumnKey.TEXT
      },
      {
        id: `${elem.id}-loinc`,
        value: `${codeLOINC === 'No matching concept' || codeLOINC === 'Non Renseigné' ? '' : codeLOINC ?? ''} - ${
          libelleLOINC === 'No matching concept' ? '-' : libelleLOINC ?? '-'
        }`,
        type: CellType.TEXT,
        key: ColumnKey.TEXT
      },
      {
        id: `${elem.id}-result`,
        value: result,
        type: CellType.TEXT,
        key: ColumnKey.TEXT,
        align: 'center'
      },
      {
        id: `${elem.id}-valueUnit`,
        value: valueUnit,
        type: CellType.TEXT,
        key: ColumnKey.TEXT,
        align: 'center'
      },
      {
        id: `${elem.id}-executiveUnits`,
        value: elem.serviceProvider ?? '-',
        type: CellType.TEXT,
        key: ColumnKey.TEXT,
        align: 'center'
      }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return rows
}

export const map = (data: Data, type: ResourceType, deidentified: boolean, groupId?: string) => {
  const table: Table = { rows: [], columns: [] }
  switch (type) {
    case ResourceType.PATIENT: {
      table.rows = mapPatientsToRows((data as PatientsResponse).originalPatients!, deidentified)
      table.columns = mapPatientsToColumns(deidentified)
      break
    }
    case ResourceType.CONDITION:
    case ResourceType.PROCEDURE:
    case ResourceType.CLAIM: {
      table.rows = mapPmsiToRows(
        (data as CohortResults<ResourceType.CONDITION | ResourceType.PROCEDURE | ResourceType.CLAIM>).list,
        type,
        groupId
      )
      table.columns = mapPmsiToColumns(type, deidentified)
      break
    }
    case ResourceType.OBSERVATION: {
      table.columns = mapBiologyToColumns(deidentified)
      table.rows = mapBiologyToRows((data as CohortResults<CohortObservation>).list, groupId)
      break
    }
  }
  return table
}
