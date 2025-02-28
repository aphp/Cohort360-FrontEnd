import { Cohort, JobStatus, ProjectType, QuerySnapshotInfo, RequestType, ValueSet } from 'types'
import { CohortsType } from 'types/cohorts'
import { Direction, FilterKeys, FilterValue, Order } from 'types/searchCriterias'
import displayDigit from './displayDigit'
import { SetURLSearchParams } from 'react-router-dom'

export const replaceItem = <T extends ProjectType | RequestType | Cohort>(item: T, itemsList: T[]) => {
  const index = itemsList.findIndex(({ uuid }) => uuid === item.uuid)
  if (index === -1) {
    return itemsList
  }
  const newList = [...itemsList]
  newList[index] = item
  return newList
}

export const replaceParentFolder = (items: RequestType[], itemsList: RequestType[], parent: ProjectType) => {
  return items.reduce(
    (acc, item) => replaceItem({ ...item, parent_folder: { name: parent.name, uuid: parent.uuid } }, acc),
    itemsList
  )
}

export const deleteElements = <T extends ProjectType | RequestType | Cohort>(itemsToDelete: T[], itemsList: T[]) => {
  return itemsList.filter((item) => !itemsToDelete.some(({ uuid }) => uuid === item.uuid))
}

export const getCohortsConfirmDeletionTitle = (quantity = 1) => {
  const correctWording = quantity <= 1 ? 'une cohorte' : 'des cohortes'
  return `Supprimer ${correctWording}`
}

export const getRequestsConfirmDeletionTitle = (quantity = 1) => {
  const correctWording = quantity <= 1 ? 'une requête' : 'des requêtes'
  return `Supprimer ${correctWording}`
}

export const getFoldersConfirmDeletionTitle = () => {
  return `Supprimer un projet`
}

// TODO: plus tard, ajouter au message de confirmation le warning pour les échantillons
export const getCohortsConfirmDeletionMessage = (quantity = 1) => {
  const correctWording = quantity <= 1 ? 'cette cohorte' : 'les cohortes sélectionnées'
  return `Êtes-vous sûr(e) de vouloir supprimer ${correctWording} ?`
}

export const getRequestsConfirmDeletionMessage = (quantity = 1) => {
  const correctRequestWording = quantity <= 1 ? 'cette requête' : 'les requêtes séléctionnées'
  return `Êtes-vous sûr(e) de vouloir supprimer ${correctRequestWording} ? Cette suppression entraînera également celle des cohortes associées.`
}

export const getFoldersConfirmDeletionMessage = () => {
  return `Êtes-vous sûr(e) de vouloir supprimer ce projet ? Cette suppression entraînera également celle des requêtes et cohortes associées.`
}

export const statusOptions = [
  {
    display: 'Terminé',
    code: 'finished'
  },
  {
    display: 'En attente',
    code: 'pending'
  },
  {
    display: 'Erreur',
    code: 'failed'
  }
]

export const getFoldersSearchParams = (searchParams: URLSearchParams) => {
  return {
    searchInput: searchParams.get('searchInput') ?? '',
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
    orderBy: (searchParams.get('orderBy') as Order) ?? Order.CREATED_AT,
    orderDirection: (searchParams.get('direction') as Direction) ?? Direction.DESC
  }
}

export const getRequestsSearchParams = (searchParams: URLSearchParams) => {
  return {
    searchInput: searchParams.get('searchInput') ?? '',
    startDate: searchParams.get('startDate') ?? undefined,
    endDate: searchParams.get('endDate') ?? undefined,
    page: parseInt(searchParams.get('page') ?? '1', 10),
    orderBy: (searchParams.get('orderBy') as Order) ?? Order.UPDATED,
    orderDirection: (searchParams.get('direction') as Direction) ?? Direction.DESC
  }
}

export const getStatusParam = (searchParam: string | null) => {
  if (searchParam === null) {
    return []
  }
  const statusParam = searchParam.split(',').map((status) => {
    const statusIndex = statusOptions.findIndex((option) => status === option.code)
    if (statusIndex > -1) {
      return statusOptions[statusIndex]
    }
  })

  return statusParam
}

export const parseSearchParamValue = (searchParam: string | null, options: {}) => {
  if (searchParam === null) {
    return null
  }
  return searchParam.split(',').map((status) => {
    if (Object.values(options).includes(status)) return status
  })
}

export const removeFromSearchParams = (
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams,
  keyToRemove: string,
  value: FilterValue
) => {
  const targetSearchParam = searchParams.get(keyToRemove)?.split(',')
  const cleanedParam = targetSearchParam
    ?.filter((searchValue) => searchValue !== (keyToRemove === FilterKeys.STATUS ? (value as ValueSet).code : value))
    .join()

  cleanedParam ? searchParams.set(keyToRemove, cleanedParam) : searchParams.delete(keyToRemove)

  setSearchParams(searchParams)
}

export const cleanSearchParams = (searchParams: URLSearchParams) => {
  const keysToKeep = ['startDate', 'endDate', 'searchInput']
  const newSearchParams = new URLSearchParams()

  for (const key of keysToKeep) {
    if (searchParams.has(key)) {
      newSearchParams.set(key, searchParams.get(key) as string)
    }
  }

  return newSearchParams
}

export const getCohortsSearchParams = (searchParams: URLSearchParams) => {
  return {
    searchInput: searchParams.get('searchInput') ?? '',
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
    page: parseInt(searchParams.get('page') ?? '1', 10),
    orderBy: (searchParams.get('orderBy') as Order) ?? Order.CREATED_AT,
    orderDirection: (searchParams.get('direction') as Direction) ?? Direction.DESC,
    status: getStatusParam(searchParams.get('status')) as ValueSet[],
    favorite: (parseSearchParamValue(searchParams.get('favorite'), CohortsType) ?? []) as CohortsType[],
    minPatients: searchParams.get('minPatients'),
    maxPatients: searchParams.get('maxPatients')
  }
}

export const getPathDepth = (pathname: string) => {
  return pathname.split('/').filter(Boolean).length
}

export const getGlobalEstimation = (cohort: Cohort) => {
  if (cohort.measure_min === null || cohort.measure_max === null) {
    return 'N/A'
  } else {
    return `${displayDigit(cohort.measure_min)} - ${displayDigit(cohort.measure_max)}`
  }
}

export const getExportTooltip = (cohort: Cohort, isExportable: boolean) => {
  if (cohort.request_job_status === JobStatus.FAILED) {
    return 'Cette cohorte ne peut pas être exportée car elle a échoué lors de sa création'
  } else if (cohort.request_job_status === JobStatus.PENDING || cohort.request_job_status === JobStatus.LONG_PENDING) {
    return 'Cette cohorte ne peut pas être exportée car elle est en cours de création'
  } else if (cohort.request_job_status === JobStatus.FINISHED) {
    if (!isExportable) {
      return "Vous n'avez pas les droits suffisants pour exporter cette cohorte"
    } else {
      return 'Exporter la cohorte'
    }
  } else if (!cohort.exportable) {
    return 'Cette cohorte ne peut pas être exportée car elle dépasse le seuil de nombre de patients maximum autorisé'
  }
}

export const getCohortTotal = (requestSnapshots?: QuerySnapshotInfo[]) => {
  if (!requestSnapshots) {
    return 0
  }
  const snapshotsWithLinkedCohorts: number[] = requestSnapshots.map((snapshot) => snapshot.cohorts_count)
  return snapshotsWithLinkedCohorts.reduce((sum, a) => sum + a, 0)
}

export const getRequestName = (request?: RequestType | null) => {
  if (!request) return 'N/A'
  const sharedByDetails = request.shared_by ? ` - Envoyée par : ${request.shared_by}` : ''
  return `${request.name}${sharedByDetails}`
}
