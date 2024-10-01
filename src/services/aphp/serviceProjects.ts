import apiBack from '../apiBackend'

import { ProjectType, RequestType, Cohort, User, JobStatus } from 'types'

import servicesCohorts from './serviceCohorts'
import { CohortsFilters, Direction, Order, OrderBy, ProjectsFilters } from 'types/searchCriterias'
import { CohortsType } from 'types/cohorts'

type FetchProjectsListProps = {
  filters?: ProjectsFilters
  searchInput?: string
  order?: OrderBy
  limit?: number
  offset?: number
  signal?: AbortSignal
}

type FetchRequestsListProps = {
  orderBy?: OrderBy
  parentId?: string
  searchInput?: string
  startDate?: string | null
  endDate?: string | null
  limit?: number
  offset?: number
  signal?: AbortSignal
}

type FetchCohortsListProps = {
  filters: CohortsFilters
  searchInput?: string
  orderBy: OrderBy
  limit?: number
  offset?: number
  signal?: AbortSignal
  isSample?: boolean
  parentCohort?: string
  parentRequest?: string
}

const optionsReducer = (accumulator: string, currentValue: string) =>
  accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator

export interface IServiceProjects {
  fetchProject: (projectId: string, signal?: AbortSignal) => Promise<ProjectType>
  /**
   * Retourne la liste de projet de recherche d'un practitioner
   *
   * Argument:
   *   - filters: Indique les filtres choisis sur les projets
   *   - searchInput: Indique la chaîne de caractère recherchée par l'utilisateur
   *   - limit: Determine une limite de projet demandé
   *   - offset: Determine un index de départ
   *
   * Retourne:
   *   - count: Nombre total de projet de recherche
   *   - next: URL d'appel pour récupérer les projet de recherche suivant
   *   - previous: URL d'appel pour récupérer les projet de recherche précédent
   *   - results: Liste de projet de recherche récupéré
   */
  fetchProjectsList: (args: FetchProjectsListProps) => Promise<{
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
  addProject: (newProject: Omit<ProjectType, 'uuid'>) => Promise<ProjectType>

  /**
   * Cette fonction modifie un projet de recherche existant
   *
   * Argument:
   *   - newProject: Projet de recherche à modifier
   *
   */
  editProject: (editedProject: ProjectType) => Promise<void>

  /**
   * Cette fonction supprime un projet de recherche existant
   *
   * Argument:
   *   - newProject: Projet de recherche à supprimer
   *
   */
  deleteProject: (deletedProject: ProjectType) => Promise<void>

  fetchRequest: (request_id: string, signal?: AbortSignal) => Promise<RequestType>

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
  fetchRequestsList: (args: FetchRequestsListProps) => Promise<{
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
  editRequest: (editedRequest: RequestType) => Promise<void>

  /**
   * Cette fonction partage une requete á un autre utilisateur
   *
   * Argument:
   *  - sharedRequest: Requete á partager
   **/
  shareRequest: (sharedRequest: RequestType, notify_by_email: boolean) => Promise<void>

  /**
   * Cette fonction supprime une requete existante
   *
   * Argument:
   *   - deletedRequest: Requete à supprimer
   */
  deleteRequest: (deletedRequest: RequestType) => Promise<void>

  /**
   * Cette fonction déplace des requetes existantes vers un autre dossier
   *
   * Argument:
   *   - selectedRequests: Requetes à déplacer
   *   - parent_folder: destination des requêtes
  
   */
  moveRequests: (selectedRequests: RequestType[], parent_folder: string) => Promise<void>

  /**
   * Cette fonction supprimer des requetes existantes
   *
   * Argument:
   *   - deletedRequests: Requetes à supprimer
   */
  deleteRequests: (deletedRequests: RequestType[]) => Promise<void>

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
  fetchCohortsList: (args: FetchCohortsListProps) => Promise<{
    count: number
    next: string | null
    previous: string | null
    results: Cohort[]
  }>

  fetchCohort: (cohort_id: string, signal?: AbortSignal) => Promise<Cohort>

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
  editCohort: (editedCohort: Cohort) => Promise<void>

  /**
   * Cette fonction supprime une cohorte existant
   *
   * Argument:
   *   - newProject: Cohorte à supprimer
   *
   * Retourne:
   *   - Cohorte supprimée
   */
  deleteCohorts: (deletedCohorts: Cohort[]) => Promise<void>
}

const servicesProjects: IServiceProjects = {
  fetchProject: async (projectId, signal) => {
    try {
      return (await apiBack.get(`/cohort/folders/${projectId}/`, { signal })).data
    } catch (error) {
      console.error(error)
    }
  },
  fetchRequest: async (requestId, signal) => {
    try {
      return (await apiBack.get(`/cohort/requests/${requestId}/`, { signal })).data
    } catch (error) {
      console.error(error)
    }
  },
  fetchCohort: async (cohortId, signal) => {
    try {
      const cohortResponse: Cohort = (await apiBack.get(`/cohort/cohorts/${cohortId}/`, { signal })).data
      return (await servicesCohorts.fetchCohortsRights([cohortResponse]))[0]
    } catch (error) {
      console.error(error)
      return {}
    }
  },
  fetchProjectsList: async (args) => {
    try {
      const { filters, searchInput, order, limit, offset, signal } = args
      const _orderBy = order ?? { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC }
      const orderDirection = _orderBy.orderDirection === Direction.DESC ? '-' : ''
      let options: string[] = []
      if (_orderBy) options = [...options, `ordering=${orderDirection}${_orderBy.orderBy}`]
      if (limit) options = [...options, `limit=${limit}`]
      if (offset) options = [...options, `offset=${offset}`]
      if (searchInput) options = [...options, `search=${searchInput}`]
      if (filters?.startDate) options = [...options, `min_created_at=${filters.startDate}`]
      if (filters?.endDate) options = [...options, `max_created_at=${filters.endDate}`]

      const fetchProjectsResponse = await apiBack.get<{
        count: number
        next: string | null
        previous: string | null
        results: ProjectType[]
      }>(`/cohort/folders/?${options.reduce(optionsReducer)}`, { signal })

      return fetchProjectsResponse.data
    } catch (error) {
      console.error(error)
      return {
        count: 0,
        next: '',
        previous: '',
        results: []
      }
    }
  },
  addProject: async (newProject) => {
    try {
      const addProjectResponse = await apiBack.post(`/cohort/folders/`, newProject)
      if (addProjectResponse.status !== 201) {
        throw new Error("Erreur lors de l'ajout du projet")
      }
      return addProjectResponse.data
    } catch (error) {
      console.error(error)
      throw error
    }
  },
  editProject: async (editedProject) => {
    try {
      const editProjectResponse = await apiBack.patch(`/cohort/folders/${editedProject.uuid}/`, {
        parent_folder: editedProject.uuid,
        name: editedProject.name,
        description: editedProject.description
      })
      if (editProjectResponse.status !== 200) {
        throw new Error("Erreur lors de l'édition du projet")
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  },
  deleteProject: async (deletedProject) => {
    try {
      const deleteProjectResponse = (await apiBack.delete(`/cohort/folders/${deletedProject.uuid}/`)) ?? {
        data: { results: [] }
      }
      if (deleteProjectResponse.status !== 204) {
        throw new Error('Erreur lors de la suppression du projet')
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  fetchRequestsList: async (args) => {
    try {
      const { orderBy, parentId, searchInput, startDate, endDate, limit, offset, signal } = args
      const _orderBy = orderBy ?? { orderBy: Order.UPDATED, orderDirection: Direction.DESC }
      const _sortDirection = _orderBy.orderDirection === Direction.DESC ? '-' : ''
      let options: string[] = []
      if (limit || limit === 0) options = [...options, `limit=${limit}`]
      if (offset) options = [...options, `offset=${offset}`]
      if (_orderBy) options = [...options, `ordering=${_sortDirection}${_orderBy.orderBy}`]
      if (!parentId && searchInput && searchInput !== '') options = [...options, `search=${searchInput}`]
      if (!parentId && startDate) options = [...options, `min_updated_at=${startDate}`]
      if (!parentId && endDate) options = [...options, `max_updated_at=${endDate}`]
      if (parentId) options = [...options, `parent_folder=${parentId}`]

      const fetchRequestsListResponse = await apiBack.get<{
        count: number
        next: string | null
        previous: string | null
        results: RequestType[]
      }>(`/cohort/requests/?${options.reduce(optionsReducer)}`, { signal })

      return fetchRequestsListResponse.data
    } catch (error) {
      console.error(error)
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
      parent_folder: newRequest.parent_folder?.uuid
    })) ?? { status: 400 }
    if (addRequestResponse.status === 201) {
      return addRequestResponse.data
    } else {
      throw new Error('Impossible de créer la requête')
    }
  },
  editRequest: async (editedRequest) => {
    try {
      const editProjectResponse = await apiBack.patch(`/cohort/requests/${editedRequest.uuid}/`, {
        name: editedRequest.name,
        description: editedRequest.description,
        parent_folder: editedRequest.parent_folder
      })
      if (editProjectResponse.status !== 200) {
        throw new Error("Erreur lors de l'édition de la requête")
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  },
  shareRequest: async (sharedRequest, notify_by_email) => {
    try {
      const usersToShareId = sharedRequest.usersToShare?.map((userToshareId: User) => userToshareId.username)
      const shared_query_snapshot_id = sharedRequest.shared_query_snapshot
        ? sharedRequest.shared_query_snapshot
        : sharedRequest.currentSnapshot?.uuid
      const shared_query_snapshot_name = sharedRequest.name ? sharedRequest.name : sharedRequest.requestName
      const shareRequestResponse = await apiBack.post<ProjectType>(
        `/cohort/request-query-snapshots/${shared_query_snapshot_id}/share/`,
        {
          name: shared_query_snapshot_name,
          recipients: usersToShareId?.join(),
          notify_by_email: notify_by_email
        }
      )
      if (shareRequestResponse.status !== 201) {
        throw new Error('Erreur lors du partage de la requête')
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  },
  deleteRequest: async (deletedRequest) => {
    try {
      const deleteProjectResponse = await apiBack.delete(`/cohort/requests/${deletedRequest.uuid}zesrtyuhio/`)
      if (deleteProjectResponse.status !== 204) {
        throw new Error('Erreur lors de la suppression de la requête')
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  moveRequests: async (selectedRequests, parent_folder) => {
    try {
      const moveRequestsResponse = await Promise.all(
        selectedRequests.map((selectedRequest) =>
          apiBack.patch(`/cohort/requests/${selectedRequest.uuid}/`, {
            parent_folder
          })
        )
      )
      if (moveRequestsResponse.some((response) => response.status !== 200)) {
        throw new Error('Erreur lors du déplacement de requête')
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  deleteRequests: async (deletedRequests) => {
    try {
      const requestsIds = deletedRequests.map((request) => request.uuid).join()
      const deleteRequestsResponse = await apiBack.delete(`/cohort/requests/${requestsIds}/`)

      if (deleteRequestsResponse.status !== 204) {
        throw new Error('Erreur lors de la suppression de la requête')
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  fetchCohortsList: async (args) => {
    try {
      const { filters, searchInput, orderBy, limit, offset, signal, isSample, parentCohort, parentRequest } = args
      const _sortDirection = orderBy.orderDirection === Direction.DESC ? '-' : ''

      let options: string[] = [`is_sample=${isSample}`]
      const { status, favorite, minPatients, maxPatients, startDate, endDate } = filters
      const _status =
        status?.map((stat) =>
          stat.id === JobStatus.PENDING
            ? `${JobStatus.LONG_PENDING},${JobStatus.PENDING},${JobStatus.STARTED}`
            : stat.id
        ) ?? []

      if (limit || limit === 0) options = [...options, `limit=${limit}`]
      if (offset) options = [...options, `offset=${offset}`]
      if (orderBy) options = [...options, `ordering=${_sortDirection}${orderBy.orderBy}`]
      if (searchInput !== '') options = [...options, `search=${searchInput}`]
      if (_status.length > 0) options = [...options, `status=${_status.join()}`]
      if (minPatients) options = [...options, `min_result_size=${minPatients}`]
      if (maxPatients) options = [...options, `max_result_size=${maxPatients}`]
      if (startDate) options = [...options, `min_created_at=${startDate}`]
      if (endDate) options = [...options, `max_created_at=${endDate}`]
      if (parentRequest) options = [...options, `request_id=${parentRequest}`]
      if (parentCohort) options = [...options, `parent_cohort=${parentCohort}`]
      if (favorite?.length === 1)
        options = [...options, `favorite=${favorite[0] === CohortsType.FAVORITE ? 'true' : 'false'}`]

      const cohortListResponse = await apiBack.get<{
        count: number
        next: string | null
        previous: string | null
        results: Cohort[]
      }>(`/cohort/cohorts/?${options.reduce(optionsReducer)}`, { signal })

      // Récupère les droits
      const cohortList = await servicesCohorts.fetchCohortsRights(cohortListResponse.data.results)
      return {
        ...cohortListResponse.data,
        results: cohortList
      }
    } catch (error) {
      console.error(error)
      return {
        count: 0,
        next: '',
        previous: '',
        results: []
      }
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
    try {
      const editCohortResponse = await apiBack.patch(`/cohort/cohorts/${editedCohort.uuid}/`, {
        name: editedCohort.name,
        description: editedCohort.description,
        favorite: editedCohort.favorite !== undefined ? !!editedCohort.favorite : undefined
      })

      if (editCohortResponse.status !== 200) {
        throw new Error("Erreur lors de l'édition de la cohorte")
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  },
  deleteCohorts: async (deletedCohorts) => {
    try {
      const cohortsIds = deletedCohorts.map((cohort) => cohort.uuid).join()
      const deleteCohortResponse = await apiBack.delete(`/cohort/cohorts/${cohortsIds}/`)

      if (deleteCohortResponse.status !== 204) {
        throw new Error('Erreur lors de la suppression de la cohorte')
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default servicesProjects
