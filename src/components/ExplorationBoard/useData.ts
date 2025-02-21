import { CanceledError } from 'axios'
import { MedicationAdministration, MedicationRequest } from 'fhir/r4'
import { map } from 'mappers/exploration'
import { useEffect, useState } from 'react'
import servicesCohorts from 'services/aphp/serviceCohorts'
import {
  CohortComposition,
  CohortImaging,
  CohortMedication,
  CohortObservation,
  CohortPMSI,
  CohortQuestionnaireResponse,
  CohortResults,
  LoadingStatus
} from 'types'
import { PatientsResponse } from 'types/patient'
import { ResourceType } from 'types/requestCriterias'
import { Filters, SearchByTypes, SearchCriterias } from 'types/searchCriterias'
import { Table } from 'types/table'
import { isPatientsResponse } from 'utils/exploration'

export type Data =
  | PatientsResponse
  | CohortResults<
      | CohortPMSI
      | CohortObservation
      | CohortImaging
      | CohortQuestionnaireResponse
      | CohortMedication<MedicationRequest | MedicationAdministration>
      | CohortComposition
    >

export type ExplorationCount = {
  ressource: {
    results: number
    total: number
  } | null
  patients: {
    results: number
    total: number
  } | null
}

const RESULTS_PER_PAGE = 20

export const useData = (
  type: ResourceType,
  searchCriterias: SearchCriterias<Filters>,
  page: number,
  deidentified: boolean,
  groupId?: string,
  patientId?: string
) => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.IDDLE)
  const [data, setData] = useState<Data | null>(null)
  const [tableData, setTableData] = useState<Table>({ rows: [], columns: [] })
  const [pagination, setPagination] = useState({ currentPage: page, total: 0 })
  const [count, setCount] = useState<ExplorationCount | null>(null)

  const fetchData = async (page: number) => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const fetcher = servicesCohorts.getExplorationFetcher(type, patientId)
      const results = await fetcher({
        page,
        searchCriterias,
        deidentified,
        type,
        groupId,
        patientId,
        includeFacets: true
      })
      console.log('test fetching results', results)
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

  useEffect(() => {
    const fetch = async () => await fetchData(1)
    fetch()
    setPagination({ ...pagination, currentPage: 1 })
  }, [searchCriterias])

  useEffect(() => {
    if (data) {
      const hasSearch =
        type === ResourceType.DOCUMENTS &&
        !!searchCriterias.searchInput &&
        searchCriterias.searchBy === SearchByTypes.TEXT
      setTableData(map(data, type, deidentified, groupId, hasSearch))
      const count: ExplorationCount = {
        ressource: null,
        patients:
          data.totalPatients && data.totalAllPatients
            ? {
                results: data.totalPatients,
                total: data.totalAllPatients
              }
            : null
      }
      if (!isPatientsResponse(data)) count.ressource = { results: data.total, total: data.totalAllResults }
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
    data: { raw: data, table: tableData },
    dataLoading: loadingStatus === LoadingStatus.FETCHING,
    pagination,
    onChangePage: handlePage
  }
}
