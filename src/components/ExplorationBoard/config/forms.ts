import { getConfig } from 'config'
import { QuestionnaireResponse } from 'fhir/r4'
import { mapToDate } from 'mappers/dates'
import services from 'services/aphp'
import { fetchForms } from 'services/aphp/callApi'
import { PatientState } from 'state/patient'
import { CohortQuestionnaireResponse } from 'types'
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
import { Direction, FormNames, LabelObject, MaternityFormFilters, Order, SearchCriterias } from 'types/searchCriterias'
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
import { getFormDetails, getFormLabel, getFormName } from 'utils/formUtils'

export const fetchAdditionalInfos = async (additionalInfo: AdditionalInfo): Promise<AdditionalInfo> => {
  const fetchersMap: Record<string, () => Promise<FhirItem[] | LabelObject[] | undefined>> = {
    encounterStatusList: () =>
      !additionalInfo.encounterStatusList
        ? fetchValueSet(getConfig().core.valueSets.encounterStatus.url)
        : Promise.resolve(undefined),
    questionnaires: () =>
      !additionalInfo.questionnaires
        ? services.patients.fetchQuestionnaires().then((resp) =>
            resp.map((elem) => ({
              id: elem.name ?? '',
              label: getFormLabel(elem.name as FormNames) ?? ''
            }))
          )
        : Promise.resolve(undefined)
  }
  const resolved = await resolveAdditionalInfos(fetchersMap)
  return { ...additionalInfo, ...resolved }
}

export const initSearchCriterias = (search: string): SearchCriterias<MaternityFormFilters> => ({
  orderBy: {
    orderBy: Order.AUTHORED,
    orderDirection: Direction.DESC
  },
  searchInput: search,
  filters: {
    ipp: '',
    formName: [],
    durationRange: [null, null],
    executiveUnits: [],
    encounterStatus: []
  }
})

const mapToTable = (data: Data, groupId: string[]): Table => {
  const rows: Row[] = []
  const columns: Column[] = [
    { label: 'Type de formulaire' },
    { label: "Date d'écriture", code: Order.AUTHORED },
    { label: `IPP` },
    { label: 'Unité exécutrice' },
    { label: 'Aperçu', align: 'center' }
  ].filter((elem) => elem) as Column[]
  ;(data as ExplorationResults<CohortQuestionnaireResponse>).list.forEach((elem) => {
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
  return { columns, rows }
}

const fetchList = async (
  fetchParams: FetchParams,
  { filters }: FetchOptions<MaternityFormFilters>,
  patient: PatientState,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<QuestionnaireResponse>> => {
  const { ipp, executiveUnits, encounterStatus, durationRange, formName } = filters
  const params = {
    ipp,
    startDate: durationRange?.[0] ?? '',
    endDate: durationRange?.[1] ?? '',
    executiveUnits: executiveUnits.map((unit) => unit.id),
    encounterStatus: encounterStatus.map((status) => status.id),
    formName: formName.join(','),
    uniqueFacet: ['subject'],
    patient: patient?.patientInfo?.id,
    ...getCommonParamsList(fetchParams, groupId),
    signal
  }
  const paramsFetchAll = {
    uniqueFacet: ['subject'],
    patient: patient?.patientInfo?.id,
    ...getCommonParamsAll(groupId),
    signal
  }

  const [forms, questionnaires] = await Promise.all([
    fetcherWithParams(
      () => fetchForms(params),
      () => fetchForms(paramsFetchAll),
      { ...fetchParams, filters, deidentified, patient, groupId }
    ),
    services.patients.fetchQuestionnaires()
  ])
  return {
    ...forms,
    list: forms.list.map((elem) => ({
      ...elem,
      formName: getFormName(elem as QuestionnaireResponse, questionnaires)
    })) as QuestionnaireResponse[]
  }
}

export const formsConfig = (
  deidentified: boolean,
  patient: PatientState,
  groupId: string[],
  displayOptions = DISPLAY_OPTIONS,
  search = ''
): ExplorationConfig<MaternityFormFilters> => ({
  type: ResourceType.QUESTIONNAIRE_RESPONSE,
  deidentified,
  displayOptions: { ...displayOptions, search: false },
  initSearchCriterias: () => initSearchCriterias(search),
  fetchList: (fetchParams, options, signal) => fetchList(fetchParams, options, patient, deidentified, groupId, signal),
  mapToTable: (data) => mapToTable(data, groupId),
  mapToTimeline: !!patient
    ? async (data: Data) => {
        const questionnaires = await services.patients.fetchQuestionnaires()
        return { data: (data.list ?? []) as CohortQuestionnaireResponse[], questionnaires: questionnaires ?? [] }
      }
    : undefined,
  narrowSearchCriterias: (searchCriterias) =>
    narrowSearchCriterias(deidentified, searchCriterias, !!patient, [], ['searchBy', 'searchInput']),
  fetchAdditionalInfos,
  getCount: !!patient
    ? undefined
    : (counts) => [
        { label: `résultat${counts[0].total > 1 ? 's' : ''}`, display: true, count: counts[0] },
        { label: `patient${counts[1].total > 1 ? 's' : ''}`, display: true, count: counts[1] }
      ]
})
