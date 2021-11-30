import apiBack from '../apiBackend'

import { fetchGroup } from './callApi'

export interface IServicesProjects {
  /**
   * Retourne la liste de projet de recherche d'un practitioner
   *
   * Argument:
   *   - limit: Determine une limite de projet demandé
   *   - offset: Determine un index de départ
   *
   * Retoune:
   *   - count: Nombre total de projet de recherche
   *   - next: URL d'appel pour récupérer les projet de recherche suivant
   *   - previous: URL d'appel pour récupérer les projet de recherche précédent
   *   - results: Liste de projet de recherche récupéré
   */
  fetchProjectsList: (
    limit?: number,
    offset?: number
  ) => Promise<{
    count: number
    next: string | null
    previous: string | null
    results: ProjectType[]
  }>

  /**
   * Cette fonction ajoute un nouveau projet de recherche
   *
   * Argument:
   *   - newProject: Nouveau projet de recherche
   *
   * Retourne:
   *   - Projet de recherche ajouté
   */
  addProject: (newProject: ProjectType) => Promise<ProjectType>

  /**
   * Cette fonction modifie un projet de recherche existant
   *
   * Argument:
   *   - newProject: Projet de recherche à modifier
   *
   * Retourne:
   *   - Projet de recherche modifié
   */
  editProject: (editedProject: ProjectType) => Promise<ProjectType>

  /**
   * Cette fonction supprime un projet de recherche existant
   *
   * Argument:
   *   - newProject: Projet de recherche à supprimer
   *
   * Retourne:
   *   - Projet de recherche supprimé
   */
  deleteProject: (deletedProject: ProjectType) => Promise<ProjectType>

  /**
   * Retourne la liste de requete d'un practitioner
   *
   * Argument:
   *   - limit: Determine une limite de requete demandé
   *   - offset: Determine un index de départ
   *
   * Retoune:
   *   - count: Nombre total de requete
   *   - next: URL d'appel pour récupérer les requete suivant
   *   - previous: URL d'appel pour récupérer les requete précédent
   *   - results: Liste de requete récupéré
   */
  fetchRequestsList: (
    limit?: number,
    offset?: number
  ) => Promise<{
    count: number
    next: string | null
    previous: string | null
    results: RequestType[]
  }>

  /**
   * Cette fonction ajoute une nouvelle requete
   *
   * Argument:
   *   - newProject: Nouvelle requete
   *
   * Retourne:
   *   - Requete ajoutée
   */
  addRequest: (newRequest: RequestType) => Promise<RequestType>

  /**
   * Cette fonction modifie un requete existant
   *
   * Argument:
   *   - editedRequest: Requete à modifier
   *
   * Retourne:
   *   - Requete modifiée
   */
  editRequest: (editedRequest: RequestType) => Promise<RequestType>

  /**
   * Cette fonction supprime un requete existant
   *
   * Argument:
   *   - deletedRequest: Requete à supprimer
   *
   * Retourne:
   *   - Requete supprimée
   */
  deleteRequest: (deletedRequest: RequestType) => Promise<RequestType>

  /**
   * Cette fonction déplace des requetes existant vers un autre dossier
   *
   * Argument:
   *   - selectedRequests: Requetes à déplacer
   *   - parent_folder: destination des requêtes
   *
   * Retourne:
   *   - Requete supprimée
   */
  moveRequests: (selectedRequests: RequestType[], parent_folder: string) => Promise<RequestType[]>

  /**
   * Cette fonction supprimer des requetes existantes
   *
   * Argument:
   *   - deletedRequests: Requetes à supprimer
   *
   * Retourne:
   *   - Requete supprimée
   */
  deleteRequests: (deletedRequests: RequestType[]) => Promise<RequestType[]>

  /**
   * Retourne la liste de Cohort d'un practitioner
   *
   * Argument:
   *   - limit: Determine une limite de projet demandé
   *   - offset: Determine un index de départ
   *
   * Retoune:
   *   - count: Nombre total de Cohort
   *   - next: URL d'appel pour récupérer les Cohort suivant
   *   - previous: URL d'appel pour récupérer les Cohort précédent
   *   - results: Liste de Cohort récupéré
   */
  fetchCohortsList: (
    providerId: string,
    limit?: number,
    offset?: number
  ) => Promise<{
    count: number
    next: string | null
    previous: string | null
    results: CohortType[]
  }>

  /**
   * Cette fonction ajoute une nouvelle cohorte
   *
   * Argument:
   *   - newProject: Nouvelle cohorte
   *
   * Retourne:
   *   - Cohorte ajoutée
   */
  addCohort: (newCohort: CohortType) => Promise<CohortType>

  /**
   * Cette fonction modifie un cohorte existant
   *
   * Argument:
   *   - newProject: Cohorte à modifier
   *
   * Retourne:
   *   - Cohorte modifiée
   */
  editCohort: (editedCohort: CohortType) => Promise<CohortType>

  /**
   * Cette fonction supprime un cohorte existant
   *
   * Argument:
   *   - newProject: Cohorte à supprimer
   *
   * Retourne:
   *   - Cohorte supprimée
   */
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

  moveRequests: async (selectedRequests, parent_folder) => {
    if (!parent_folder) return []

    const moveRequestsResponse = await Promise.all(
      selectedRequests.map((selectedRequest) =>
        new Promise((resolve) => {
          resolve(
            apiBack.patch(`/explorations/requests/${selectedRequest.uuid}/`, {
              parent_folder
            })
          )
        })
          .then((values) => {
            return values
          })
          .catch((error) => {
            return error
          })
      )
    )
    return moveRequestsResponse && moveRequestsResponse.length > 0
      ? // @ts-ignore
        moveRequestsResponse.map((moveRequestResponse) => moveRequestResponse?.data as RequestType)
      : []
  },

  deleteRequests: async (deletedRequests) => {
    const deleteRequestsResponse = await Promise.all(
      deletedRequests.map(
        (deletedRequest) =>
          new Promise((resolve) => {
            resolve(apiBack.delete(`/explorations/requests/${deletedRequest.uuid}/`))
          })
      )
    )

    // @ts-ignore
    const checkResponse = deleteRequestsResponse.filter(({ status }) => status === 204)
    return checkResponse.length === deletedRequests.length ? deletedRequests : []
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
        (
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
        )?.extension

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
