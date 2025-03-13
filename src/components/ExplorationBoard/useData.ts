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
  page: number,
  deidentified: boolean,
  groupId: string[],
  patient?: PatientState
) => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.IDDLE)
  const [data, setData] = useState<Data | null>(null)
  const [tableData, setTableData] = useState<Table>({ rows: [], columns: [] })
  const [cards, setCards] = useState<Card[]>([])
  const [pagination, setPagination] = useState({ currentPage: page, total: 0 })
  const [count, setCount] = useState<ExplorationCount | null>(null)

  const fetchData = async (page: number) => {
    try {
      console.log('test fetching')
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
      setCount(null)
    }
  }

  const refetch = () => {
    const fetch = async () => await fetchData(1)
    fetch()
    setPagination({ ...pagination, currentPage: 1 })
  }

  useEffect(() => {
    console.log('test refetch')
    refetch()
  }, [searchCriterias])

  useEffect(() => {
    if (data) {
      const hasSearch =
        type === ResourceType.DOCUMENTS &&
        !!searchCriterias.searchInput &&
        searchCriterias.searchBy === SearchByTypes.TEXT
      if (display === DATA_DISPLAY.TABLE)
        setTableData(mapToTable(data, type, deidentified, !!patient, groupId, hasSearch))
      if (display === DATA_DISPLAY.INFO) setCards(mapToCards(data, deidentified, groupId))
      const count: ExplorationCount = {
        ressource: null,
        patients: data.totalPatients
          ? {
              results: data.totalPatients,
              total: data.totalAllPatients
            }
          : null
      }
      if (!isPatientsResponse(data))
        count.ressource = data.total ? { results: data.total, total: data.totalAllResults } : null
      setPagination({
        ...pagination,
        total: Math.ceil((count.ressource?.results ?? count.patients?.results ?? 0) / RESULTS_PER_PAGE)
      })
      setCount(count)
    } else setTableData({ rows: [], columns: [] })
    setLoadingStatus(LoadingStatus.SUCCESS)
  }, [data])

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
