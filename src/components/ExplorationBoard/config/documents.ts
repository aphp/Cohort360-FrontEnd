import { ChipStatus } from 'components/ui/StatusChip'
import { plural } from 'utils/string'
import { mapToDateHours } from 'mappers/dates'
import { CohortComposition } from 'types'
import {
  AdditionalInfo,
  Data,
  DISPLAY_OPTIONS,
  ExplorationConfig,
  ExplorationResults,
  FetchOptions,
  FetchParams,
  Patient
} from 'types/exploration'
import {
  Order,
  DocumentStatuses,
  DocumentsFilters,
  SearchByTypes,
  SearchCriterias,
  Direction,
  searchByListDocuments,
  SearchBy
} from 'types/searchCriterias'
import { Table, Row, CellType, Column } from 'types/table'
import { getDocumentStatus } from 'utils/documentsFormatter'
import docTypes from 'assets/docTypes.json'
import CheckIcon from 'assets/icones/check.svg?react'
import CancelIcon from 'assets/icones/times.svg?react'
import { DocumentReference } from 'fhir/r4'
import { fetchDocumentReference } from 'services/aphp/callApi'
import { ResourceType } from 'types/requestCriterias'
import { getConfig } from 'config'
import {
  fetcherWithParams,
  fetchValueSet,
  getCommonParamsAll,
  getCommonParamsList,
  narrowSearchCriterias,
  resolveAdditionalInfos
} from 'utils/exploration'
import { FhirItem } from 'types/valueSet'
import { Buffer } from 'buffer'
import { SourceType } from 'types/scope'

const initSearchCriterias = (search: string): SearchCriterias<DocumentsFilters> => ({
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.DESC
  },
  searchInput: search,
  searchBy: SearchByTypes.TEXT,
  filters: {
    ipp: '',
    nda: '',
    docStatuses: [],
    docTypes: [],
    onlyPdfAvailable: true,
    durationRange: [null, null],
    executiveUnits: [],
    encounterStatus: []
  }
})

const fetchList = (
  fetchParams: FetchParams,
  { filters, searchBy }: FetchOptions<DocumentsFilters>,
  patient: Patient | null,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<DocumentReference>> => {
  const { nda, ipp, executiveUnits, encounterStatus, durationRange, docStatuses, docTypes, onlyPdfAvailable } = filters
  const { searchInput } = fetchParams
  const params = {
    searchBy: searchBy,
    docStatuses: docStatuses.map((status) => status.id),
    _elements: searchInput ? [] : undefined,
    highlight_search_results: searchBy === SearchByTypes.TEXT,
    type: docTypes.map((docType) => docType.code).join(','),
    patient: patient?.id,
    'encounter-identifier': nda,
    'patient-identifier': ipp,
    onlyPdfAvailable,
    uniqueFacet: ['subject'] as 'subject'[],
    executiveUnits: executiveUnits.map((unit) => unit.id),
    encounterStatus: encounterStatus?.map(({ id }) => id),
    minDate: durationRange[0] ?? '',
    maxDate: durationRange[1] ?? '',
    ...getCommonParamsList(fetchParams, groupId),
    signal
  }
  const paramsFetchAll = {
    patient: patient?.id,
    uniqueFacet: ['subject'] as 'subject'[],
    ...getCommonParamsAll(groupId),
    signal
  }
  return fetcherWithParams(
    () => fetchDocumentReference(params),
    () => fetchDocumentReference(paramsFetchAll),
    { ...fetchParams, filters, deidentified, groupId, patient }
  )
}

export const mapToTable = (
  data: Data,
  deidentified: boolean,
  isPatient: boolean,
  groupId: string[],
  hasSearch: boolean
): Table => {
  const rows: Row[] = []
  const columns: Column[] = [
    { label: 'Statut' },
    { label: 'Nom / Date', code: Order.DATE },
    !isPatient && { label: `IPP${deidentified ? ' chiffré' : ''}`, code: Order.SUBJECT_IDENTIFIER },
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Unité exécutrice' },
    { label: 'Type de document', code: Order.TYPE },
    { label: 'Aperçu' }
  ].filter((elem) => elem) as Column[]
  ;(data as ExplorationResults<CohortComposition>).list?.forEach((elem) => {
    const docType = docTypes.docTypes.find(
      ({ code }) => code.toLowerCase() === (elem?.type?.coding?.[0] ? elem.type.coding[0].code : '-')?.toLowerCase()
    )
    const status = {
      label: getDocumentStatus(elem.docStatus),
      status: elem.docStatus === DocumentStatuses.FINAL ? ChipStatus.VALID : ChipStatus.CANCELLED,
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
  return { columns, rows }
}

const fetchAdditionalInfos = async (additionalInfo: AdditionalInfo): Promise<AdditionalInfo> => {
  const fetchersMap: Record<string, () => Promise<FhirItem[] | SearchBy[] | undefined>> = {
    encounterStatusList: () =>
      !additionalInfo.encounterStatusList
        ? fetchValueSet(getConfig().core.valueSets.encounterStatus.url)
        : Promise.resolve(undefined),
    searchByList: () => Promise.resolve(searchByListDocuments)
  }
  const sourceType = SourceType.DOCUMENT
  const resolved = await resolveAdditionalInfos(fetchersMap)
  return { ...additionalInfo, sourceType, ...resolved }
}

const getMessages = (deidentified: boolean) => {
  return deidentified
    ? [
        'Attention : Les données identifiantes des patients sont remplacées par des informations fictives dans les résultats de la recherche et dans les documents prévisualisés.'
      ]
    : [
        "Attention : La recherche textuelle est pseudonymisée (les données identifiantes des patients sont remplacées par des informations fictives). Vous retrouverez les données personnelles de votre patient en cliquant sur l'aperçu."
      ]
}

export const documentsConfig = (
  deidentified: boolean,
  patient: Patient | null,
  groupId: string[],
  displayOptions = DISPLAY_OPTIONS,
  search = ''
): ExplorationConfig<DocumentsFilters> => ({
  type: ResourceType.DOCUMENTS,
  deidentified,
  displayOptions,
  initSearchCriterias: () => initSearchCriterias(search),
  fetchList: (fetchParams, options, signal) => fetchList(fetchParams, options, patient, deidentified, groupId, signal),
  mapToTable: (data, hasSearch) => mapToTable(data, deidentified, !!patient, groupId, !!hasSearch),
  getMessages: () => getMessages(deidentified),
  narrowSearchCriterias: (searchCriterias) =>
    narrowSearchCriterias(deidentified, searchCriterias, !!patient, deidentified ? ['onlyPdfAvailable'] : [], []),
  fetchAdditionalInfos,
  getCount: (counts) => [
    { label: `document${plural(counts[0].total)}`, display: true, count: counts[0] },
    { label: `patient${plural(counts[1].total)}`, display: !!!patient, count: counts[1] }
  ],
  hasSearchDisplay: (input, searchBy) => !!input && searchBy === SearchByTypes.TEXT
})
