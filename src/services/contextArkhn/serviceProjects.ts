import apiBack from '../apiBackend'

import { fetchGroup } from './callApi'

export interface IServicesProjects {
  fetchProjectsList: (
    limit: number,
    offset: number
  ) => Promise<{
    count: number
    next: string | null
    previous: string | null
    results: ProjectType[]
  }>
  addProject: (newProject: ProjectType) => Promise<ProjectType>
  editProject: (editedProject: ProjectType) => Promise<ProjectType>
  deleteProject: (deletedProject: ProjectType) => Promise<ProjectType>

  fetchRequestsList: (
    limit: number,
    offset: number
  ) => Promise<{
    count: number
    next: string | null
    previous: string | null
    results: RequestType[]
  }>
  addRequest: (newRequest: RequestType) => Promise<RequestType>
  editRequest: (editedRequest: RequestType) => Promise<RequestType>
  deleteRequest: (deletedRequest: RequestType) => Promise<RequestType>

  fetchCohortsList: (
    providerId: string,
    limit: number,
    offset: number
  ) => Promise<{
    count: number
    next: string | null
    previous: string | null
    results: CohortType[]
  }>
  addCohort: (newCohort: CohortType) => Promise<CohortType>
  editCohort: (editedCohort: CohortType) => Promise<CohortType>
  deleteCohort: (deletedCohort: CohortType) => Promise<CohortType>
}

const servicesProjects: IServicesProjects = {
  fetchProjectsList: async (limit, offset) => {
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
  },
  addProject: async (newProject) => {
    const addProjectResponse = (await apiBack.post(`/explorations/folders/`, newProject)) ?? { status: 400 }

    if (addProjectResponse.status === 201) {
      return addProjectResponse.data as ProjectType
    } else {
      throw new Error('Impossible de créer le projet de recherche')
    }
  },
  editProject: async (editedProject) => {
    const editProjectResponse = (await apiBack.patch(`/explorations/folders/${editedProject.uuid}/`, {
      name: editedProject.name,
      parent_folder: editedProject.uuid
    })) ?? {
      data: { results: [] }
    }

    if (editProjectResponse.status === 200) {
      return editProjectResponse.data as ProjectType
    } else {
      throw new Error('Impossible de modifier le projet de recherche')
    }
  },
  deleteProject: async (deletedProject) => {
    const deleteProjectResponse = (await apiBack.delete(`/explorations/folders/${deletedProject.uuid}/`)) ?? {
      data: { results: [] }
    }

    if (deleteProjectResponse.status === 204) {
      return deleteProjectResponse.data as ProjectType
    } else {
      throw new Error('Impossible de supprimer le projet de recherche')
    }
  },

  fetchRequestsList: async (limit, offset) => {
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
  },
  addRequest: async (newRequest) => {
    const addRequestResponse = (await apiBack.post(`/explorations/requests/`, {
      ...newRequest,
      parent_folder: newRequest.parent_folder
    })) ?? { status: 400 }
    if (addRequestResponse.status === 201) {
      return addRequestResponse.data as ProjectType
    } else {
      throw new Error('Impossible de créer la requête')
    }
  },
  editRequest: async (editedRequest) => {
    const editProjectResponse = (await apiBack.patch(`/explorations/requests/${editedRequest.uuid}/`, {
      name: editedRequest.name,
      description: editedRequest.description,
      parent_folder: editedRequest.parent_folder
    })) ?? { status: 400 }
    if (editProjectResponse.status === 200) {
      return editProjectResponse.data as ProjectType
    } else {
      throw new Error('Impossible de modifier la requête')
    }
  },
  deleteRequest: async (deletedRequest) => {
    const deleteProjectResponse = (await apiBack.delete(`/explorations/requests/${deletedRequest.uuid}/`)) ?? {
      status: 400
    }
    if (deleteProjectResponse.status === 204) {
      return deleteProjectResponse.data as ProjectType
    } else {
      throw new Error('Impossible de supprimer la requête')
    }
  },

  fetchCohortsList: async (providerId, limit, offset) => {
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
    let [rightResponses] = await Promise.all([
      fetchGroup({
        _list: cohortList.map((cohortItem) => cohortItem.fhir_group_id ?? ''),
        provider: providerId
      })
    ])
    // Re-organise l'objet rightResponses
    // @ts-ignore
    rightResponses =
      rightResponses &&
      rightResponses.data.resourceType === 'Bundle' &&
      rightResponses.data?.entry &&
      rightResponses.data?.entry[0] &&
      rightResponses.data?.entry[0].resource &&
      rightResponses.data?.entry[0].resource.extension
        ? rightResponses.data?.entry[0].resource.extension
        : []
    // Affecte les droits à chaque cohortItem
    cohortList = cohortList.map((cohortItem) => {
      const extension =
        Array.isArray(rightResponses) &&
        rightResponses.find((rightResponse: any) => +(rightResponse.url ?? '1') === +(cohortItem.fhir_group_id ?? '0'))
          ?.extension

      return {
        ...cohortItem,
        extension
      }
    })

    return {
      ...data,
      results: cohortList
    }
  },
  addCohort: async (newCohort) => {
    const addCohortResponse = (await apiBack.post(`/explorations/cohorts/`, newCohort)) ?? { status: 400 }

    if (addCohortResponse.status === 201) {
      return addCohortResponse.data as CohortType
    } else {
      throw new Error('Impossible de créer la liste de patients')
    }
  },
  editCohort: async (editedCohort) => {
    const editCohortResponse = (await apiBack.patch(`/explorations/cohorts/${editedCohort.uuid}/`, {
      name: editedCohort.name,
      description: editedCohort.description
    })) ?? { status: 400 }

    if (editCohortResponse.status === 200) {
      return editCohortResponse.data as CohortType
    } else {
      throw new Error('Impossible de modifier la liste de patients')
    }
  },
  deleteCohort: async (deletedCohort) => {
    const deleteCohortResponse = (await apiBack.delete(`/explorations/cohorts/${deletedCohort.uuid}/`)) ?? {
      status: 400
    }

    if (deleteCohortResponse.status === 204) {
      return deleteCohortResponse.data as CohortType
    } else {
      throw new Error('Impossible de supprimer la liste de patients')
    }
  }
}

export default servicesProjects

export type ProjectType = {
  uuid: string
  name: string
  description?: string
  created_at?: string
  modified_at?: string
  favorite?: boolean
  owner_id?: string
}

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
