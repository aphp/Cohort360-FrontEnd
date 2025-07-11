import { getConfig } from 'config'
import { plural } from 'utils/string'
import { ImagingStudy, ImagingStudySeries } from 'fhir/r4'
import { mapToDate } from 'mappers/dates'
import { fetchImaging } from 'services/aphp/callApi'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { PatientState } from 'state/patient'
import { CohortImaging } from 'types'
import {
  AdditionalInfo,
  Data,
  DISPLAY_OPTIONS,
  ExplorationConfig,
  ExplorationResults,
  FetchOptions,
  FetchParams
} from 'types/exploration'
import { ResourceType } from 'types/requestCriterias'
import { Direction, ImagingFilters, Order, SearchByTypes, SearchCriterias } from 'types/searchCriterias'
import { Table, Row, CellType, Column } from 'types/table'
import { FhirItem } from 'types/valueSet'
import {
  fetcherWithParams,
  fetchValueSet,
  getCommonParamsAll,
  getCommonParamsList,
  narrowSearchCriterias,
  resolveAdditionalInfos
} from 'utils/exploration'
import { getExtension } from 'utils/fhir'

const fetchAdditionalInfos = async (additionalInfo: AdditionalInfo): Promise<AdditionalInfo> => {
  const fetchersMap: Record<string, () => Promise<FhirItem[] | undefined>> = {
    encounterStatusList: () =>
      !additionalInfo.encounterStatusList
        ? fetchValueSet(getConfig().core.valueSets.encounterStatus.url)
        : Promise.resolve(undefined),
    modalities: () =>
      !additionalInfo.modalities
        ? getCodeList(getConfig().features.imaging.valueSets.imagingModalities.url, true).then((res) => res.results)
        : Promise.resolve(undefined)
  }
  const resolved = await resolveAdditionalInfos(fetchersMap)
  return { ...additionalInfo, ...resolved }
}

export const initSearchCriterias = (search: string): SearchCriterias<ImagingFilters> => ({
  orderBy: {
    orderBy: Order.STUDY_DATE,
    orderDirection: Direction.DESC
  },
  searchInput: search,
  searchBy: SearchByTypes.TEXT,
  filters: {
    ipp: '',
    nda: '',
    modality: [],
    bodySite: '',
    durationRange: [null, null],
    executiveUnits: [],
    encounterStatus: []
  }
})

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

const mapToTable = (data: Data, deidentified: boolean, isPatient: boolean, groupId: string[]): Table => {
  const rows: Row[] = []
  const columns: Column[] = [
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
  ;(data as ExplorationResults<CohortImaging>).list.forEach((elem) => {
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
  return { columns, rows }
}

const fetchList = (
  fetchParams: FetchParams,
  { filters }: FetchOptions<ImagingFilters>,
  patient: PatientState,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<ImagingStudy>> => {
  const { nda, ipp, executiveUnits, encounterStatus, durationRange, modality, bodySite } = filters
  const params = {
    encounter: nda,
    ipp,
    minDate: durationRange[0] ?? '',
    maxDate: durationRange[1] ?? '',
    bodySite: bodySite,
    modalities: modality.map(({ id }) => id),
    executiveUnits: executiveUnits.map((unit) => unit.id),
    encounterStatus: encounterStatus.map(({ id }) => id),
    uniqueFacet: ['subject'],
    patient: patient?.patientInfo?.id,
    ...getCommonParamsList(fetchParams, groupId),
    signal
  }
  const paramsFetchAll = {
    patient: patient?.patientInfo?.id,
    uniqueFacet: ['subject'],
    ...getCommonParamsAll(groupId),
    signal
  }
  return fetcherWithParams(
    () => fetchImaging(params),
    () => fetchImaging(paramsFetchAll),
    { ...fetchParams, filters, deidentified, patient, groupId }
  )
}

export const imagingConfig = (
  deidentified: boolean,
  patient: PatientState,
  groupId: string[],
  displayOptions = DISPLAY_OPTIONS,
  search = ''
): ExplorationConfig<ImagingFilters> => ({
  type: ResourceType.IMAGING,
  deidentified,
  displayOptions,
  initSearchCriterias: () => initSearchCriterias(search),
  fetchList: (fetchParams, options, signal) => fetchList(fetchParams, options, patient, deidentified, groupId, signal),
  mapToTable: (data) => mapToTable(data, deidentified, !!patient, groupId),
  narrowSearchCriterias: (searchCriterias) =>
    narrowSearchCriterias(deidentified, searchCriterias, !!patient, [], ['searchBy']),
  fetchAdditionalInfos,
  getMessages: () => [
    "Seuls les examens d'imagerie présents dans le PACS central et rattachés à un patient qui possède une identité Orbis et au moins une visite sont actuellement disponibles dans Cohort360."
  ],
  getCount: (counts) => [
    { label: `résultat${plural(counts[0].total)}`, display: true, count: counts[0] },
    { label: `patient${plural(counts[1].total)}`, display: !!!patient, count: counts[1] }
  ]
})
