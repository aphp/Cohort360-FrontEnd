import apiBack from './apiBackCohort'
import { CONTEXT } from '../constants'

export type ProjectType = {
  uuid: string
  name: string
  description?: string
  created_at?: string
  modified_at?: string
  favorite?: boolean
  owner_id?: string
}

export const fetchProjectsList = async () => {
  // export const fetchProjectsList = async (limit = 100, offset = 0) => {
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
  return {
    count: myProjects.length,
    next: '',
    previous: '',
    results: myProjects
  }
  // switch (CONTEXT) {
  //   case 'fakedata':
  //     return {
  //       count: myProjects.length,
  //       next: '',
  //       previous: '',
  //       results: myProjects
  //     }
  //   case 'arkhn':
  //     return {
  //       count: myProjects.length,
  //       next: '',
  //       previous: '',
  //       results: myProjects
  //     }
  //   default: {
  //     let search = `?`
  //     if (limit) {
  //       search += `limit=${limit}`
  //     }
  //     if (offset) {
  //       search += search === '?' ? `offset=${offset}` : `&offset=${offset}`
  //     }

  //     const fetchProjectsResponse = (await apiBack.get<{
  //       count: number
  //       next: string | null
  //       previous: string | null
  //       results: ProjectType[]
  //     }>(`/explorations/folders/${search}`)) ?? { status: 400 }

  //     if (fetchProjectsResponse.status === 200) {
  //       const { data } = fetchProjectsResponse
  //       return {
  //         ...data,
  //         results: data.results.map((res) => ({
  //           ...res,
  //           project_id: `${Math.floor(Math.random() * 3) + 1}`
  //         }))
  //       }
  //     } else {
  //       return {
  //         count: myProjects.length,
  //         next: '',
  //         previous: '',
  //         results: myProjects
  //       }
  //     }
  //   }
  // }
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
          parent_folder_id: editedProject.uuid
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

    const { data } = (await apiBack.get<{
      count: number
      next: string | null
      previous: string | null
      results: RequestType[]
    }>(`/explorations/requests/${search}`)) ?? { data: { results: [] } }

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

export const editRequest = async (request: RequestType) => {
  try {
    const editResult = await apiBack.patch(`/explorations/requests/${request.uuid}/`, {
      name: request.name,
      description: request.description
      // project_id: request.project_id
    })
    return editResult
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const deleteRequest = async (requestId: string) => {
  try {
    const deleteResult = await apiBack.delete(`/explorations/requests/${requestId}/`)
    return deleteResult
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

    const { data } = (await apiBack.get<{
      count: number
      next: string | null
      previous: string | null
      results: CohortResponseType[]
    }>(`/explorations/cohorts/${search}`)) ?? { data: { results: [] } }

    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
