import { AxiosResponse } from 'axios'
import apiBack from '../apiBackend'

import { ProjectType, RequestType, Cohort, User } from 'types'

import servicesCohorts from './serviceCohorts'
import { CohortsFilters, Direction, OrderBy } from 'types/searchCriterias'
import { CohortsType } from 'types/cohorts'

export interface IServiceProjects {
  /**
   * Retourne la liste de projet de recherche d'un practitioner
   *
   * Argument:
   *   - limit: Determine une limite de projet demandé
   *   - offset: Determine un index de départ
   *
   * Retourne:
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
   * Retourne:
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
   * Cette fonction partage une requete á un autre utilisateur
   *
   * Argument:
   *  - sharedRequest: Requete á partager
   *
   * Retourne:
   *  - Requete partagée
   */
  shareRequest: (sharedRequest: RequestType, notify_by_email: boolean) => Promise<AxiosResponse<ProjectType>>

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
   *   - filters: Indique les filtres choisis sur les cohortes
   *   - searchInput: Indique la chaîne de caractère recherchée par l'utilisateur
   *   - sort: Indique l'ordre dans lequel les cohortes seront affichées
   *   - limit: Determine une limite de cohorte demandé
   *   - offset: Determine un index de départ
   *
   * Retourne:
   *   - count: Nombre total de cohortes
   *   - next: URL d'appel pour récupérer les cohortes suivantes
   *   - previous: URL d'appel pour récupérer les cohortes précédentes
   *   - results: Liste de cohortes récupérées
   */
  fetchCohortsList: (
    filters: CohortsFilters,
    searchInput: string,
    orderBy: OrderBy,
    limit?: number,
    offset?: number,
    signal?: AbortSignal
  ) => Promise<{
    count: number
    next: string | null
    previous: string | null
    results: Cohort[]
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
  addCohort: (newCohort: Cohort) => Promise<Cohort>

  /**
   * Cette fonction modifie une cohorte existant
   *
   * Argument:
   *   - newProject: Cohorte à modifier
   *
   * Retourne:
   *   - Cohorte modifiée
   */
  editCohort: (editedCohort: Cohort) => Promise<Cohort>

  /**
   * Cette fonction supprime une cohorte existant
   *
   * Argument:
   *   - newProject: Cohorte à supprimer
   *
   * Retourne:
   *   - Cohorte supprimée
   */
  deleteCohort: (deletedCohort: Cohort) => Promise<Cohort>
}

const servicesProjects: IServiceProjects = {
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
    }>(`/cohort/folders/${search}`)) ?? { status: 400 }

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
    const addProjectResponse = (await apiBack.post(`/cohort/folders/`, newProject)) ?? { status: 400 }

    if (addProjectResponse.status === 201) {
      return addProjectResponse.data as ProjectType
    } else {
      throw new Error('Impossible de créer le projet de recherche')
    }
  },
  editProject: async (editedProject) => {
    const editProjectResponse = (await apiBack.patch(`/cohort/folders/${editedProject.uuid}/`, {
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
    const deleteProjectResponse = (await apiBack.delete(`/cohort/folders/${deletedProject.uuid}/`)) ?? {
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
    }>(`/cohort/requests/${search}`)) ?? { status: 400 }

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
    const addRequestResponse = (await apiBack.post(`/cohort/requests/`, {
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
    const editProjectResponse = (await apiBack.patch(`/cohort/requests/${editedRequest.uuid}/`, {
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
  shareRequest: async (sharedRequest, notify_by_email): Promise<AxiosResponse<ProjectType>> => {
    const usersToShareId = sharedRequest.usersToShare?.map((userToshareId: User) => userToshareId.username)
    const shared_query_snapshot_id = sharedRequest.shared_query_snapshot
      ? sharedRequest.shared_query_snapshot
      : sharedRequest.currentSnapshot?.uuid
    const shared_query_snapshot_name = sharedRequest.name ? sharedRequest.name : sharedRequest.requestName
    const shareRequestResponse = (await apiBack.post<ProjectType>(
      `/cohort/request-query-snapshots/${shared_query_snapshot_id}/share/`,
      {
        name: shared_query_snapshot_name,
        recipients: usersToShareId?.join(),
        notify_by_email: notify_by_email
      }
    )) ?? { status: 400 }
    if (shareRequestResponse.status === 201) {
      return shareRequestResponse.data, shareRequestResponse
    } else {
      console.error('Impossible de partager la requête')
      return shareRequestResponse
    }
  },
  deleteRequest: async (deletedRequest) => {
    const deleteProjectResponse = (await apiBack.delete(`/cohort/requests/${deletedRequest.uuid}/`)) ?? {
      status: 400
    }
    if (deleteProjectResponse.status === 204) {
      return deleteProjectResponse.data
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
            apiBack.patch(`/cohort/requests/${selectedRequest.uuid}/`, {
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
            resolve(apiBack.delete(`/cohort/requests/${deletedRequest.uuid}/`))
          })
      )
    )

    // @ts-ignore
    const checkResponse = deleteRequestsResponse.filter(({ status }) => status === 204)
    return checkResponse.length === deletedRequests.length ? deletedRequests : []
  },

  fetchCohortsList: async (filters, searchInput, orderBy, limit, offset, signal) => {
    const _sortDirection = orderBy.orderDirection === Direction.DESC ? '-' : ''
    const optionsReducer = (accumulator: string, currentValue: string) =>
      accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator

    let options: string[] = []
    const { status, favorite, minPatients, maxPatients, durationRange } = filters
    const _status = status.map((stat) => stat.id)

    if (limit) options = [...options, `limit=${limit}`]
    if (offset) options = [...options, `offset=${offset}`]
    if (orderBy) options = [...options, `ordering=${_sortDirection}${orderBy.orderBy}`]
    if (searchInput !== '') options = [...options, `search=${searchInput}`]
    if (_status.length > 0) options = [...options, `status=${_status.join()}`]
    if (minPatients) options = [...options, `min_result_size=${minPatients}`]
    if (maxPatients) options = [...options, `max_result_size=${maxPatients}`]
    if (durationRange[0]) options = [...options, `min_fhir_datetime=${durationRange[0]}`]
    if (durationRange[1]) options = [...options, `max_fhir_datetime=${durationRange[1]}`]
    if (favorite !== CohortsType.ALL)
      options = [...options, `favorite=${favorite === CohortsType.FAVORITE ? 'true' : 'false'}`]

    const { data } = (await apiBack.get<{
      count: number
      next: string | null
      previous: string | null
      results: Cohort[]
    }>(`/cohort/cohorts/?${options.reduce(optionsReducer)}`, {
      signal: signal
    })) ?? { data: { results: [] } }

    // Récupère les droits
    const cohortList = await servicesCohorts.fetchCohortsRights(data.results)
    if (cohortList.length === 0) return data
    return {
      ...data,
      results: cohortList
    }
  },
  addCohort: async (newCohort) => {
    const addCohortResponse = (await apiBack.post(`/cohort/cohorts/`, newCohort)) ?? { status: 400 }

    if (addCohortResponse.status === 201) {
      return addCohortResponse.data as Cohort
    } else {
      throw new Error('Impossible de créer la liste de patients')
    }
  },
  editCohort: async (editedCohort) => {
    const editCohortResponse = (await apiBack.patch(`/cohort/cohorts/${editedCohort.uuid}/`, {
      name: editedCohort.name,
      description: editedCohort.description,
      favorite: editedCohort.favorite !== undefined ? !!editedCohort.favorite : undefined
    })) ?? { status: 400 }

    if (editCohortResponse.status === 200) {
      return editCohortResponse.data as Cohort
    } else {
      throw new Error('Impossible de modifier la liste de patients')
    }
  },
  deleteCohort: async (deletedCohort) => {
    const deleteCohortResponse = (await apiBack.delete(`/cohort/cohorts/${deletedCohort.uuid}/`)) ?? {
      status: 400
    }

    if (deleteCohortResponse.status === 204) {
      return deleteCohortResponse.data as Cohort
    } else {
      throw new Error('Impossible de supprimer la liste de patients')
    }
  }
}

export default servicesProjects
