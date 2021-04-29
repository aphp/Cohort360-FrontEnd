import apiBack from './apiBackCohort'
import { CONTEXT } from '../constants'

export type ProjectType = {
  uuid: string
  name: string
  created_at?: string
  modified_at?: string
  favorite?: boolean
  owner_id?: string
}

export const fetchProjectsList = async () => {
  const myProjects: ProjectType[] = [
    {
      uuid: '1',
      name: 'Mon projet principal',
      created_at: new Date().toString()
    },
    {
      uuid: '2',
      name: 'Mon projet de recherche 1',
      created_at: new Date().toString()
    },
    {
      uuid: '3',
      name: 'Mon projet de recherche 2',
      created_at: new Date().toString()
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

export type RequestType = {
  project_id: string
  uuid: string
  name: string
  description?: string
  owner_id?: string
  data_type_of_query?: string
  favorite?: boolean
  created_at?: string
  modified_at?: string
}

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
      results: RequestType[]
    }>(`/explorations/requests/${search}`)

    return {
      ...data,
      results: data.results.map((res) => ({
        ...res,
        project_id: `${Math.floor(Math.random() * 3) + 1}`
      }))
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export type CohortResponseType = {
  modified_at?: string
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
  created_at?: string
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

    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
