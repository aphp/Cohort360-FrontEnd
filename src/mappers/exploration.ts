import { ImagingStudySeries, Patient } from 'fhir/r4'
import moment from 'moment'
import { CellType, Column, Row, Table } from 'types/table'
import { getAge } from 'utils/age'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { ResourceType, VitalStatusLabel } from 'types/requestCriterias'
import { PatientTableLabels, PatientsResponse } from 'types/patient'
import { Order } from 'types/searchCriterias'
import { CohortImaging, CohortPMSI, CohortResults } from 'types'
import { mapToDate } from './dates'
import { getExtension } from 'utils/fhir'
import { getConfig } from 'config'
import { Data } from 'components/ExplorationBoard/useData'
import { getPmsiCodes, getPmsiDate } from './pmsi'

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

export const mapImagingToColumns = (deidentified: boolean): Column[] => {
  return [
    { label: `` },
    { label: `IPP${deidentified ? ' chiffré' : ''}` },
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
        type: CellType.TEXT,
      },
      {
        id: `${elem.uid}-date`,
        value: date ? mapToDate(date) : 'Non renseigné',
        type: CellType.TEXT,
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
        value: elem.bodySite?._display ?? '-',
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

export const mapImagingToRows = (list: CohortImaging[], deidentified: boolean, groupId?: string) => {
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
        align: 'center'
      },
      {
        id: `${elem.id}-procedure`,
        value: procedure,
        type: CellType.TEXT,
        align: 'center'
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

const isImagingCohort = (data: CohortResults<any>): data is CohortResults<CohortImaging> => {
  const type = data.list[0].resourceType
  return type === ResourceType.IMAGING
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
        table.columns = mapPmsiToColumns(type, deidentified)
        table.rows = mapPmsiToRows(data.list, type, groupId)
      }
      if (isImagingCohort(data)) {
        table.columns = mapImagingToColumns(deidentified)
        table.rows = mapImagingToRows(data.list, deidentified, groupId)
      }
    }
  }
  return table
}
