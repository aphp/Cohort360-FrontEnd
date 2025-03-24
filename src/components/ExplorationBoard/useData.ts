import { CanceledError } from 'axios'
import {
  DocumentReference,
  ImagingStudy,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  QuestionnaireResponse
} from 'fhir/r4'
import { mapToTable, mapToCards } from 'mappers/exploration'
import { useEffect, useState } from 'react'
import { getExplorationFetcher } from 'services/aphp/serviceExploration'
import { PatientState } from 'state/patient'
import { CohortPMSI, CohortQuestionnaireResponse, ExplorationResults, LoadingStatus } from 'types'
import { DATA_DISPLAY } from 'types/exploration'
import { Card } from 'types/card'
import { PatientsResponse } from 'types/patient'
import { ResourceType } from 'types/requestCriterias'
import { Filters, SearchByTypes, SearchCriterias } from 'types/searchCriterias'
import { Table } from 'types/table'
import { isPatientsResponse } from 'utils/exploration'
import { useSearchParams } from 'react-router-dom'
import { cleanSearchParams } from 'utils/paginationUtils'

export type Data =
  | PatientsResponse
  | ExplorationResults<
      | CohortPMSI
      | Observation
      | ImagingStudy
      | CohortQuestionnaireResponse
      | MedicationRequest
      | MedicationAdministration
      | DocumentReference
      | QuestionnaireResponse
    >

export type ExplorationCount = {
  ressource: {
    results: number | null
    total: number | null
  } | null
  patients: {
    results: number | null
    total: number | null
  } | null
}

const RESULTS_PER_PAGE = 20

export const useData = (
  type: ResourceType,
  display: DATA_DISPLAY,
  searchCriterias: SearchCriterias<Filters>,
  deidentified: boolean,
  groupId: string[],
  patient?: PatientState
) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.IDDLE)
  const [data, setData] = useState<Data | null>(null)
  const [tableData, setTableData] = useState<Table>({ rows: [], columns: [] })
  const [cards, setCards] = useState<Card[]>([])
  const [pagination, setPagination] = useState({ currentPage: 0, total: 0 })
  const [count, setCount] = useState<ExplorationCount>({ patients: null, ressource: null })

  const fetchData = async (page: number) => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const fetcher = getExplorationFetcher(type)
      const results = await fetcher({
        page,
        searchCriterias,
        deidentified,
        type,
        groupId,
        patient,
        includeFacets: true
      })
      setData(results)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
      setData(null)
    }
  }

  useEffect(() => {
    if (data) {
      const hasSearch =
        type === ResourceType.DOCUMENTS &&
        !!searchCriterias.searchInput &&
        searchCriterias.searchBy === SearchByTypes.TEXT
      if (display === DATA_DISPLAY.TABLE)
        setTableData(mapToTable(data, type, deidentified, !!patient, groupId, hasSearch))
      if (display === DATA_DISPLAY.INFO) setCards(mapToCards(data, deidentified, groupId))
      const patients =
        !patient && data.totalPatients ? { results: data.totalPatients, total: data.totalAllPatients } : null
      const ressource =
        !isPatientsResponse(data) && data.total ? { results: data.total, total: data.totalAllResults } : null
      setPagination({
        ...pagination,
        total: Math.ceil((ressource?.results ?? patients?.results ?? 0) / RESULTS_PER_PAGE)
      })
      setCount({ patients, ressource })
    } else {
      setTableData({ rows: [], columns: [] })
      setCards([])
      setCount({ patients: null, ressource: null })
      setCount({ patients: null, ressource: null })
    }
    setLoadingStatus(LoadingStatus.SUCCESS)
  }, [data])

  useEffect(() => {
    const fetch = async () => await fetchData(1)
    fetch()
    setPagination({ ...pagination, currentPage: 1 })
  }, [searchCriterias])

  const handlePage = async (page: number) => {
    await fetchData(page)
    setPagination({ ...pagination, currentPage: page })
  }

  return {
    count,
    data: { raw: data, table: tableData, cards },
    dataLoading: loadingStatus === LoadingStatus.FETCHING,
    pagination,
    onChangePage: handlePage
  }
}
