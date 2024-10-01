import { ChipStatus } from 'components/ui/StatusChip'
import { Meta, Patient } from 'fhir/r4'
import moment from 'moment'
import { fetchPatient } from 'services/aphp/callApi'
import { ChartCode } from 'types'
import {
  AdditionalInfo,
  Data,
  DISPLAY_OPTIONS,
  Diagram,
  DiagramType,
  ExplorationConfig,
  FetchOptions,
  FetchParams,
  ExplorationResults
} from 'types/exploration'
import { PatientTableLabels } from 'types/patient'
import { ResourceType, VitalStatusLabel } from 'types/requestCriterias'
import {
  Direction,
  Order,
  orderByListPatients,
  orderByListPatientsDeidentified,
  PatientsFilters,
  searchByListPatients,
  SearchByTypes,
  SearchCriterias,
  VitalStatus
} from 'types/searchCriterias'
import { Table, Row, CellType, Column } from 'types/table'
import { getAge, substructAgeString } from 'utils/age'
import { fetcherWithParams, getCommonParamsAll, getCommonParamsList, narrowSearchCriterias } from 'utils/exploration'
import { getExtension } from 'utils/fhir'
import { getAgeRepartitionMapAphp, getGenderRepartitionMapAphp, getGenderRepartitionSimpleData } from 'utils/graphUtils'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { Card } from 'types/card'
import { PatientState } from 'state/patient'

const fetchAdditionalInfos = async (additionalInfo: AdditionalInfo, deidentified?: boolean) => {
  additionalInfo.searchByList = searchByListPatients
  additionalInfo.orderByList = deidentified ? orderByListPatientsDeidentified : orderByListPatients
  return additionalInfo
}

const initSearchCriterias = (search: string): SearchCriterias<PatientsFilters> => ({
  orderBy: {
    orderBy: Order.FAMILY,
    orderDirection: Direction.ASC
  },
  searchInput: search,
  searchBy: SearchByTypes.TEXT,
  filters: {
    genders: [],
    vitalStatuses: [],
    birthdatesRanges: [null, null]
  }
})

const getPatientInfos = (patient: Patient, deidentified: boolean, groupId: string[]) => {
  const vitalStatus = {
    label: patient.deceasedBoolean || patient.deceasedDateTime ? VitalStatusLabel.DECEASED : VitalStatusLabel.ALIVE,
    status: patient.deceasedBoolean || patient.deceasedDateTime ? ChipStatus.CANCELLED : ChipStatus.VALID
  }
  const lastEncounter = patient.extension?.[3]?.valueReference?.display ?? ''
  const surname = deidentified
    ? 'Prénom'
    : patient.name?.[0].given?.[0]
    ? capitalizeFirstLetter(patient.name?.[0].given?.[0])
    : 'Non renseigné'
  const lastname = deidentified
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
        .join(' ') ?? 'Non renseigné'
  const ipp = {
    label: deidentified
      ? patient.id
      : patient.identifier?.find((identifier) => identifier.type?.coding?.[0].code === 'IPP')?.value ??
        patient.identifier?.[0].value ??
        'IPP inconnnu',
    url: `/patients/${patient.id}${groupId ? `?groupId=${groupId}` : ''}` /*${_search}*/
  }
  const age = {
    age: getAge(patient) ?? 'Non renseigné',
    birthdate: deidentified ? 'Non renseigné' : moment(patient.birthDate).format('DD/MM/YYYY') ?? 'Non renseigné'
  }
  const gender = patient.gender?.toLocaleUpperCase() ?? ''
  return { vitalStatus, lastEncounter, surname, lastname, ipp, age, gender }
}

const mapToTable = (data: Data, deidentified: boolean, groupId: string[]): Table => {
  const rows: Row[] = []
  const columns: Column[] = [
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
  ;(data as ExplorationResults<Patient>).list?.forEach((patient) => {
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
  return { columns, rows }
}

const mapToCards = (data: Data, deidentified: boolean, groupId: string[]) => {
  const infos: Card[] = []
  ;(data as ExplorationResults<Patient>).list.forEach((patient) => {
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

const fetchList = (
  fetchParams: FetchParams,
  { filters, searchBy }: FetchOptions<PatientsFilters>,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<Patient>> => {
  const { genders, vitalStatuses, birthdatesRanges } = filters
  const { includeFacets } = fetchParams
  const birthdates: [string, string] = [
    moment(substructAgeString(birthdatesRanges?.[0] || '')).format('MM/DD/YYYY'),
    moment(substructAgeString(birthdatesRanges?.[1] || '')).format('MM/DD/YYYY')
  ]
  const minBirthdate = birthdates && Math.abs(moment(birthdates[0]).diff(moment(), deidentified ? 'months' : 'days'))
  const maxBirthdate = birthdates && Math.abs(moment(birthdates[1]).diff(moment(), deidentified ? 'months' : 'days'))
  const params = {
    pivotFacet: includeFacets
      ? (['age-month_gender', 'deceased_gender'] as ('age-month_gender' | 'deceased_gender')[])
      : [],
    gender: genders.join(','),
    searchBy,
    minBirthdate: minBirthdate,
    maxBirthdate: maxBirthdate,
    deceased: vitalStatuses.length === 1 ? (vitalStatuses.includes(VitalStatus.DECEASED) ? true : false) : undefined,
    deidentified,
    _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension'] as (
      | 'id'
      | 'gender'
      | 'name'
      | 'birthDate'
      | 'deceased'
      | 'identifier'
      | 'extension'
    )[],
    ...getCommonParamsList(fetchParams, groupId),
    signal
  }
  const paramsFetchAll = {
    ...getCommonParamsAll(groupId),
    signal
  }
  return fetcherWithParams(
    () => fetchPatient(params),
    () => fetchPatient(paramsFetchAll),
    { ...fetchParams, filters, deidentified, groupId }
  )
}

const getDiagramData = (meta: Meta): Diagram[] => {
  const agePyramidData = getAgeRepartitionMapAphp(getExtension(meta, ChartCode.AGE_PYRAMID)?.extension)
  const genderRepartitionMap = getGenderRepartitionMapAphp(getExtension(meta, ChartCode.GENDER_REPARTITION)?.extension)
  const { genderData, vitalStatusData } = getGenderRepartitionSimpleData(genderRepartitionMap)
  return [
    {
      title: 'Répartition par genre',
      type: DiagramType.BAR,
      data: genderData ?? []
    },
    {
      title: 'Répartition par statut vital',
      type: DiagramType.PIE,
      data: vitalStatusData ?? []
    },
    {
      title: 'Pyramide des âges',
      type: DiagramType.PYRAMID,
      data: agePyramidData
    }
  ]
}

export const patientsConfig = (
  deidentified: boolean,
  patient: PatientState,
  groupId: string[],
  displayOptions = DISPLAY_OPTIONS,
  search = ''
): ExplorationConfig<PatientsFilters> => ({
  type: ResourceType.PATIENT,
  deidentified,
  displayOptions,
  initSearchCriterias: () => initSearchCriterias(search),
  fetchList: (fetchParams, options, signal) => fetchList(fetchParams, options, deidentified, groupId, signal),
  mapToTable: patient ? undefined : (data) => mapToTable(data, deidentified, groupId),
  mapToCards: patient ? (data) => mapToCards(data, deidentified, groupId) : undefined,
  narrowSearchCriterias: (searchCriterias) =>
    narrowSearchCriterias(
      deidentified,
      searchCriterias,
      !!patient,
      [],
      deidentified ? ['searchBy', 'searchInput'] : []
    ),
  mapToDiagram: patient ? undefined : getDiagramData,
  fetchAdditionalInfos,
  getCount: (counts) => [
    { label: 'patient(s)', display: true, count: counts[0] },
    { label: '', display: false, count: counts[1] }
  ]
})
