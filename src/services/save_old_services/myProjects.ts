// @ts-nocheck
import apiBack from '../apiBackend'
import apiFhir from '../apiFhir'
import { CONTEXT } from '../../constants'

/**
 * Projects:
 *  - ProjectType
 *  - fetchProjectsList : (limit = 100, offset = 0) => response.data
 *  - addProject : (newProject: ProjectType) => response.data
 *  - editProject : (editedProject: ProjectType) => response.data
 *  - deleteProject : (deletedProject: ProjectType) => response.data
 */

export type ProjectType = {
  uuid: string
  name: string
  description?: string
  created_at?: string
  modified_at?: string
  favorite?: boolean
  owner_id?: string
}

export const fetchProjectsList = async (limit = 100, offset = 0) => {
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
      return {
        count: myProjects.length,
        next: '',
        previous: '',
        results: myProjects
      }
    case 'arkhn':
      return {
        count: myProjects.length,
        next: '',
        previous: '',
        results: myProjects
      }
    default: {
      let search = `?ordering=created_at`
      if (limit) {
        search += `&limit=${limit}`
      }
      if (offset) {
        search += `&offset=${offset}`
      }

      const fetchProjectsResponse = (await apiBack.get<{
        count: number
        next: string | null
        previous: string | null
        results: ProjectType[]
      }>(`/explorations/folders/${search}`)) ?? { status: 400 }

      if (fetchProjectsResponse.status === 200) {
        const { data } = fetchProjectsResponse
        return data
      } else {
        return {
          count: 0,
          next: '',
          previous: '',
          results: []
        }
      }
    }
  }
}

export const addProject = async (newProject: ProjectType) => {
  try {
    switch (CONTEXT) {
      case 'fakedata':
        return {
          ...newProject,
          uuid: `${Math.floor(Math.random() * 1000) + 1}`
        }
      case 'arkhn':
        return {
          ...newProject,
          uuid: `${Math.floor(Math.random() * 1000) + 1}`
        }
      default: {
        const addProjectResponse = (await apiBack.post(`/explorations/folders/`, newProject)) ?? { status: 400 }
        if (addProjectResponse.status === 201) {
          return addProjectResponse.data as ProjectType
        } else {
          return {
            ...newProject,
            uuid: `${Math.floor(Math.random() * 1000) + 1}`
          }
        }
      }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const editProject = async (editedProject: ProjectType) => {
  try {
    switch (CONTEXT) {
      case 'fakedata':
      case 'arkhn':
        return editedProject
      default: {
        const editProjectResponse = (await apiBack.patch(`/explorations/folders/${editedProject.uuid}/`, {
          name: editedProject.name,
          parent_folder: editedProject.uuid
        })) ?? {
          data: { results: [] }
        }
        if (editProjectResponse.status === 200) {
          return editProjectResponse.data as ProjectType
        } else {
          return editedProject
        }
      }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const deleteProject = async (deletedProject: ProjectType) => {
  try {
    switch (CONTEXT) {
      case 'fakedata':
      case 'arkhn':
        return null
      default: {
        const deleteProjectResponse = (await apiBack.delete(`/explorations/folders/${deletedProject.uuid}/`)) ?? {
          data: { results: [] }
        }
        if (deleteProjectResponse.status === 204) {
          return deleteProjectResponse.data as ProjectType
        } else {
          throw new Error('Impossible de supprimer le projet de recherche')
        }
      }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * Requests:
 *  - RequestType
 *  - fetchRequestsList : (limit = 100, offset = 0) => response.data
 *  - addRequest : (newRequest: RequestType) => response.data
 *  - editRequest : (editedRequest: RequestType) => response.data
 *  - deleteRequest : (deletedRequest: RequestType) => response.data
 */

export type RequestType = {
  uuid: string
  name: string
  parent_folder?: string
  description?: string
  owner_id?: string
  data_type_of_query?: string
  favorite?: boolean
  created_at?: string
  modified_at?: string
}

export const fetchRequestsList = async (limit = 100, offset = 0) => {
  try {
    let search = `?`
    if (limit) {
      search += `limit=${limit}`
    }
    if (offset) {
      search += search === '?' ? `offset=${offset}` : `&offset=${offset}`
    }

    const fetchRequestsListResponse = (await apiBack.get<{
      count: number
      next: string | null
      previous: string | null
      results: RequestType[]
    }>(`/explorations/requests/${search}`)) ?? { status: 400 }

    if (fetchRequestsListResponse.status === 200) {
      return fetchRequestsListResponse.data
    } else {
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const addRequest = async (newRequest: RequestType) => {
  try {
    switch (CONTEXT) {
      case 'fakedata':
        return {
          ...newRequest,
          parent_folder: `${Math.floor(Math.random() * 1000) + 1}`
        }
      case 'arkhn':
        return {
          ...newRequest,
          parent_folder: `${Math.floor(Math.random() * 1000) + 1}`
        }
      default: {
        const addRequestResponse = (await apiBack.post(`/explorations/requests/`, {
          ...newRequest,
          parent_folder: newRequest.parent_folder
        })) ?? { status: 400 }
        if (addRequestResponse.status === 201) {
          return addRequestResponse.data as ProjectType
        } else {
          return {
            ...newRequest,
            parent_folder: `${Math.floor(Math.random() * 1000) + 1}`
          }
        }
      }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const editRequest = async (editedRequest: RequestType) => {
  try {
    switch (CONTEXT) {
      case 'fakedata':
      case 'arkhn':
        return editedRequest
      default: {
        const editProjectResponse = (await apiBack.patch(`/explorations/requests/${editedRequest.uuid}/`, {
          name: editedRequest.name,
          description: editedRequest.description,
          parent_folder: editedRequest.parent_folder
        })) ?? { status: 400 }
        if (editProjectResponse.status === 200) {
          return editProjectResponse.data as ProjectType
        } else {
          return editedRequest
        }
      }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const deleteRequest = async (deletedRequest: RequestType) => {
  try {
    switch (CONTEXT) {
      case 'fakedata':
      case 'arkhn':
        return null
      default: {
        const deleteProjectResponse = (await apiBack.delete(`/explorations/requests/${deletedRequest.uuid}/`)) ?? {
          status: 400
        }
        if (deleteProjectResponse.status === 204) {
          return deleteProjectResponse.data as ProjectType
        } else {
          throw new Error('Impossible de supprimer le projet de recherche')
        }
      }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * Cohorts:
 *  - CohortType
 *  - fetchCohortsList : (providerId, limit = 100, offset = 0) => response.data
 *  - addCohort : (newCohort: CohortType) => response.data
 *  - editCohort : (editedCohort: CohortType) => response.data
 *  - deleteCohort : (deletedCohort: CohortType) => response.data
 */

export type CohortType = {
  uuid: string
  name: string
  create_task_id?: string
  dated_measure_id?: string
  description?: string
  favorite?: boolean
  fhir_group_id?: string
  owner_id?: string
  request?: string
  request_job_duration?: string
  request_job_fail_msg?: string
  request_job_status?: string
  request_query_snapshot?: string
  result_size?: number
  created_at?: string
  modified_at?: string
  extension?: any[]
}

export const fetchCohortsList: (
  providerId: number | null,
  limit?: number,
  offset?: number
) => Promise<{
  count: number
  next: string | null
  previous: string | null
  results: CohortType[]
}> = async (providerId = null, limit = 100, offset = 0) => {
  try {
    let search = `?`
    if (limit) {
      search += `limit=${limit}`
    }
    if (offset) {
      search += search === '?' ? `offset=${offset}` : `&offset=${offset}`
    }

    const { data } = (await apiBack.get<{
      count: number
      next: string | null
      previous: string | null
      results: CohortType[]
    }>(`/explorations/cohorts/${search}`)) ?? { data: { results: [] } }

    let cohortList = data.results

    // Recupere les droits
    let rightResponses = await Promise.all([
      new Promise((resolve) => {
        resolve(
          apiFhir.get(`/Group?_list=${cohortList.map((cohortItem) => cohortItem.fhir_group_id)}&provider=${providerId}`)
        )
      }).catch((error) => {
        return error
      })
    ])
    // Re-organise l'objet rightResponses
    rightResponses =
      rightResponses &&
      rightResponses[0] &&
      rightResponses[0]?.data?.entry &&
      rightResponses[0]?.data?.entry[0] &&
      rightResponses[0]?.data?.entry[0].resource &&
      rightResponses[0]?.data?.entry[0].resource.extension
        ? rightResponses[0]?.data?.entry[0].resource.extension
        : []
    // Affecte les droits à chaque cohortItem
    cohortList = cohortList.map((cohortItem) => {
      const extension = (
        rightResponses.find(
          (rightResponse: any) => +(rightResponse.url ?? '1') === +(cohortItem.fhir_group_id ?? '0')
        ) || {
          extension: [
            { url: 'READ_DATA_NOMINATIVE', valueString: 'false' },
            { url: 'EXPORT_DATA_NOMINATIVE', valueString: 'false' },
            { url: 'READ_DATA_PSEUDOANONYMISED', valueString: 'false' },
            { url: 'EXPORT_DATA_PSEUDOANONYMISED', valueString: 'false' }
          ]
        }
      ).extension

      return {
        ...cohortItem,
        extension
      }
    })

    return {
      ...data,
      results: cohortList
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const addCohort = async (newCohort: CohortType) => {
  try {
    switch (CONTEXT) {
      case 'fakedata':
        return {
          ...newCohort,
          parent_folder: `${Math.floor(Math.random() * 1000) + 1}`
        } as CohortType
      case 'arkhn':
        return {
          ...newCohort,
          parent_folder: `${Math.floor(Math.random() * 1000) + 1}`
        } as CohortType
      default: {
        const addCohortResponse = (await apiBack.post(`/explorations/cohorts/`, newCohort)) ?? { status: 400 }
        if (addCohortResponse.status === 201) {
          return addCohortResponse.data as CohortType
        } else {
          return {
            ...newCohort,
            parent_folder: `${Math.floor(Math.random() * 1000) + 1}`
          } as CohortType
        }
      }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const editCohort = async (editedCohort: CohortType) => {
  try {
    switch (CONTEXT) {
      case 'fakedata':
      case 'arkhn':
        return editedCohort as CohortType
      default: {
        const editCohortResponse = (await apiBack.patch(`/explorations/cohorts/${editedCohort.uuid}/`, {
          name: editedCohort.name,
          description: editedCohort.description
        })) ?? { status: 400 }
        if (editCohortResponse.status === 200) {
          return editCohortResponse.data as CohortType
        } else {
          return editedCohort as CohortType
        }
      }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const deleteCohort = async (deletedCohort: CohortType) => {
  try {
    switch (CONTEXT) {
      case 'fakedata':
      case 'arkhn':
        return null
      default: {
        const deleteCohortResponse = (await apiBack.delete(`/explorations/cohorts/${deletedCohort.uuid}/`)) ?? {
          status: 400
        }
        if (deleteCohortResponse.status === 204) {
          return deleteCohortResponse.data as CohortType
        } else {
          throw new Error('Impossible de supprimer le projet de recherche')
        }
      }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
