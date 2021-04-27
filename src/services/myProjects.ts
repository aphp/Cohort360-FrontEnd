import apiBack from './apiBackCohort'
import { CONTEXT } from '../constants'

export const fetchProjectsList = async () => {
  const myProjects = [
    {
      uuid: '1',
      label: 'Mon projet principal'
    }
  ]
  switch (CONTEXT) {
    case 'fakedata':
      return myProjects
    case 'arkhn':
      return myProjects
    default: {
      return myProjects
    }
  }
}

export type RequestResponseType = {
  created_at: string
  data_type_of_query: string
  description?: string
  favorite: boolean
  modified_at: string
  name: string
  owner_id: string
  uuid: string
}[]

export const fetchRequestList = async (limit = 100, offset = 0) => {
  try {
    let search = `?`
    if (limit) {
      search += `limit=${limit}`
    }
    if (offset) {
      search += search === '?' ? `offset=${offset}` : `&offset=${offset}`
    }

    const { data } = await apiBack.get<{
      count: number
      next: string | null
      previous: string | null
      results: RequestResponseType[]
    }>(`/explorations/requests/${search}`)

    return data.results
  } catch (error) {
    console.error(error)
    throw error
  }
}

export type CohortResponseType = {
  created_at: string
  modified_at: string
  create_task_id: string
  dated_measure_id: string
  description: string
  favorite: boolean
  fhir_group_id: string
  name: string
  owner_id: string
  request_id: string
  request_job_duration: string
  request_job_fail_msg: string
  request_job_status: string
  request_query_snapshot_id: string
  result_size: number
  uuid: string
}

export const fetchCohortList = async (limit = 100, offset = 0) => {
  try {
    let search = `?`
    if (limit) {
      search += `limit=${limit}`
    }
    if (offset) {
      search += search === '?' ? `offset=${offset}` : `&offset=${offset}`
    }

    const { data } = await apiBack.get<{
      count: number
      next: string | null
      previous: string | null
      results: CohortResponseType[]
    }>(`/explorations/cohorts/${search}`)

    return data.results
  } catch (error) {
    console.error(error)
    throw error
  }
}
