import apiBack from '../apiBackend'

import { ProjectType, RequestType, Cohort } from 'types'

import servicesCohorts from './serviceCohorts'

export interface IServiceProjects {
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
   * Cette fonction partage une requete á un autre utilisateur
   *
   * Argument:
   *  - sharedRequest: Requete á partager
   *
   * Retourne:
   *  - Requete partagée
   */
  shareRequest: (sharedRequest: RequestType) => Promise<any>

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
   *   - limit: Determine une limite de cohorte demandé
   *   - offset: Determine un index de départ
   *
   * Retoune:
   *   - count: Nombre total de cohortes
   *   - next: URL d'appel pour récupérer les cohortes suivant
   *   - previous: URL d'appel pour récupérer les cohortes précédent
   *   - results: Liste de cohortes récupérées
   */
  fetchCohortsList: (
    providerId: string,
    limit?: number,
    offset?: number
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
  shareRequest: async (sharedRequest) => {
    const usersToShareId = sharedRequest.usersToShare?.map((userToshareId) => userToshareId.provider_username)
    const shared_query_snapshot_id = sharedRequest.shared_query_snapshot
      ? sharedRequest.shared_query_snapshot
      : sharedRequest.currentSnapshot
    const shared_query_snapshot_name = sharedRequest.name ? sharedRequest.name : sharedRequest.requestName
    const shareProjectResponse = (await apiBack.post(
      `/cohort/request-query-snapshots/${shared_query_snapshot_id}/share/`,
      {
        name: shared_query_snapshot_name,
        recipients: usersToShareId?.join()
      }
    )) ?? { status: 400 }
    if (shareProjectResponse.status === 201) {
      return shareProjectResponse.data as ProjectType
    } else {
      throw new Error('Impossible de partager la requête')
    }
  },
  deleteRequest: async (deletedRequest) => {
    const deleteProjectResponse = (await apiBack.delete(`/cohort/requests/${deletedRequest.uuid}/`)) ?? {
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
      results: Cohort[]
    }>(`/cohort/cohorts/${search}`)) ?? { data: { results: [] } }

    // Recupere les droits
    const cohortList = await servicesCohorts.fetchCohortsRights(data.results)

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
