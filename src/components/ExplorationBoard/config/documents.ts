import { ChipStatus } from 'components/ui/StatusChip'
import { plural } from 'utils/string'
import { mapToDateHours } from 'mappers/dates'
import type { CohortComposition, FHIR_Bundle_Response } from 'types'
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
import CheckIcon from 'assets/icones/check.svg?react'
import CancelIcon from 'assets/icones/times.svg?react'
import { DocumentReference, Resource } from 'fhir/r4'
import { fetchDocumentReference } from 'services/aphp/callApi'
import { ResourceType } from 'types/requestCriterias'
import { getConfig } from 'config'
import {
  fetchValueSet,
  getCommonParamsAll,
  getCommonParamsList,
  narrowSearchCriterias,
  resolveAdditionalInfos
} from 'utils/exploration'
import { FhirItem } from 'types/valueSet'
import { Buffer } from 'buffer'
import { SourceType } from 'types/scope'
import {
  getBundleResources,
  getResourceInfos,
  getResourceInfosFromBundle,
  isEncounterResource,
  isPatientResource
} from 'utils/fillElement'
import { getExtension } from 'utils/fhir'
import { linkElementWithEncounter } from 'utils/encounter'
import { getDocTypeLabel } from '../../../utils/docTypesHelper'

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
  const paramsWithInclude = {
    ...params,
    _include: ['Encounter:encounter', 'Patient:patient'] as ('Encounter:encounter' | 'Patient:patient')[]
  }
  const paramsFetchAll = {
    patient: patient?.id,
    uniqueFacet: ['subject'] as 'subject'[],
    ...getCommonParamsAll(groupId),
    signal
  }

  return fetchDocumentsList(paramsWithInclude, paramsFetchAll, patient, deidentified, groupId, signal)
}

const getPatientsCount = (
  response: { data: FHIR_Bundle_Response<DocumentReference> } | null,
  facet = 'unique-subject'
) => {
  return response?.data?.resourceType === 'Bundle'
    ? ((
        getExtension(response.data.meta, facet) || {
          valueDecimal: 0
        }
      ).valueDecimal ?? 0)
    : 0
}

const isDocumentReference = (resource: Resource | undefined): resource is DocumentReference => {
  return resource?.resourceType === 'DocumentReference'
}

const fetchDocumentsList = async (
  paramsWithInclude: Parameters<typeof fetchDocumentReference>[0],
  paramsFetchAll: Parameters<typeof fetchDocumentReference>[0] | null,
  patient: Patient | null,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<DocumentReference>> => {
  const [list, all] = await Promise.all([
    fetchDocumentReference(paramsWithInclude),
    paramsFetchAll ? fetchDocumentReference(paramsFetchAll) : null
  ])

  const resources = getBundleResources(list)
  const documents = resources.filter(isDocumentReference)
  const includedPatients = resources.filter(isPatientResource)
  const includedEncounters = resources.filter(isEncounterResource)

  let listResources
  if (patient) {
    listResources = await linkElementWithEncounter(documents, patient.infos.hospits, deidentified)
  } else if (includedEncounters.length > 0 && (deidentified || includedPatients.length > 0)) {
    listResources = await getResourceInfosFromBundle(documents, deidentified, includedPatients, includedEncounters)
  } else {
    listResources = await getResourceInfos(documents, deidentified, groupId?.[0], signal)
  }

  const total = list.data.resourceType === 'Bundle' ? (list.data.total ?? 0) : 0
  const totalPatients = getPatientsCount(list)

  return {
    total,
    totalAllResults: all?.data.resourceType === 'Bundle' ? (all.data.total ?? 0) : total,
    totalPatients,
    totalAllPatients: all ? getPatientsCount(all) : totalPatients,
    list: listResources as DocumentReference[],
    meta: list.data.resourceType === 'Bundle' ? list.data.meta : undefined
  }
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
    // On récupère tous les codes présents dans elem.type.coding
    const typeCodings = elem?.type?.coding ?? []

    // Pour chaque code, on va chercher le label via getDocTypeLabel,
    // et on garde soit le label, soit le code à défaut
    const docTypeLabels = typeCodings
      .map((coding) => coding.code)
      .filter((code): code is string => !!code)
      .map((code) => {
        const info = getDocTypeLabel(code)
        return info?.label ?? code
      })

    // Concaténation des labels avec " - "
    const concatenatedDocTypes = docTypeLabels.length > 0 ? docTypeLabels.join(' - ') : '-'

    const status = {
      label: getDocumentStatus(elem.docStatus),
      status: elem.docStatus === DocumentStatuses.FINAL ? ChipStatus.VALID : ChipStatus.CANCELLED,
      icon: elem.docStatus === DocumentStatuses.FINAL ? CheckIcon : CancelIcon
    }
    const findContent = elem?.content?.find((content) => content.attachment?.contentType === 'text/plain')
    const documentContent = findContent?.attachment?.data
      ? Buffer.from(findContent?.attachment.data, 'base64').toString('utf-8')
      : ''
    const ippGroupQuery = groupId ? `?groupId=${groupId}` : ''
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
              url: `/patients/${elem.idPatient}${ippGroupQuery}`
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
        value: concatenatedDocTypes,
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-viewDoc`,
        value: { id: elem.content && elem.id, deidentified },
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
      additionalInfo.encounterStatusList
        ? Promise.resolve(undefined)
        : fetchValueSet(getConfig().core.valueSets.encounterStatus.url),
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
