import { Patient } from 'fhir/r4'
import moment from 'moment'
import { CellType, Column, Row, Table } from 'types/table'
import { getAge } from 'utils/age'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { ResourceType, VitalStatusLabel } from 'types/requestCriterias'
import { PatientTableLabels, PatientsResponse } from 'types/patient'
import { FormNames, Order } from 'types/searchCriterias'
import { CohortPMSI, CohortQuestionnaireResponse, CohortResults } from 'types'
import { getPmsiCodes, getPmsiDate } from './pmsi'
import { getExtension } from 'utils/fhir'
import { getConfig } from 'config'
import { Data } from 'components/ExplorationBoard/useData'
import { mapToDate } from './dates'
import { getFormDetails, getFormLabel, getFormName } from 'utils/formUtils'

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

const mapPmsiToColumns = (type: ResourceType, deidentified: boolean): Column[] => {
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

const mapQuestionnaireToColumns = (): Column[] => {
  return [
    { label: 'Type de formulaire', align: 'left' },
    { label: "Date d'écriture", code: Order.AUTHORED },
    { label: `IPP` },
    { label: 'Unité exécutrice' },
    { label: 'Aperçu' }
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

const mapPmsiToRows = (
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

const mapQuestionnaireToRows = (list: CohortQuestionnaireResponse[], groupId?: string) => {
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
        type: CellType.LINES
      }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return rows
}

const isPatientsResponse = (data: Data): data is PatientsResponse => {
  return 'originalPatients' in data
}

const isOtherResourcesResponse = (data: Data): data is CohortResults<any> => {
  return 'list' in data
}

const isPmsiCohort = (data: CohortResults<any>): data is CohortResults<CohortPMSI> => {
  const type = data.list[0].resourceType
  return type === ResourceType.CONDITION || type === ResourceType.PROCEDURE || type === ResourceType.CLAIM
}

const isQuestionnaireCohort = (data: CohortResults<any>): data is CohortResults<CohortQuestionnaireResponse> => {
  const type = data.list[0].resourceType
  return type === ResourceType.QUESTIONNAIRE_RESPONSE
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
      if (isQuestionnaireCohort(data)) {
        table.columns = mapQuestionnaireToColumns()
        table.rows = mapQuestionnaireToRows(data.list, groupId)
      }
    }
  }
  return table
}
