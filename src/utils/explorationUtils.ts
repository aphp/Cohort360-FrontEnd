import { Cohort, CohortJobStatus, QuerySnapshotInfo, RequestType } from 'types'
import displayDigit from './displayDigit'

export const getGlobalEstimation = (cohort: Cohort) => {
  if (cohort.measure_min === null || cohort.measure_max === null) {
    return 'N/A'
  } else {
    return `${displayDigit(cohort.measure_min)} - ${displayDigit(cohort.measure_max)}`
  }
}

export const getExportTooltip = (cohort: Cohort, isExportable: boolean) => {
  if (!cohort.exportable) {
    return 'Cette cohorte ne peut pas être exportée car elle dépasse le seuil de nombre de patients maximum autorisé'
  } else if (!isExportable && cohort.request_job_status === CohortJobStatus.FINISHED) {
    return "Vous n'avez pas les droits suffisants pour exporter cette cohorte"
  } else if (cohort.request_job_status === CohortJobStatus.FAILED) {
    return 'Cette cohorte ne peut pas être exportée car elle a échoué lors de sa création'
  } else if (cohort.request_job_status === CohortJobStatus.PENDING) {
    return 'Cette cohorte ne peut pas être exportée car elle est en cours de création'
  } else {
    return 'Exporter la cohorte'
  }
}

export const getCohortTotal = (requestSnapshots?: QuerySnapshotInfo[]) => {
  if (!requestSnapshots) {
    return 0
  }
  const snapshotsWithLinkedCohorts: number[] = requestSnapshots.map((snapshot) => snapshot.cohorts_count)
  return snapshotsWithLinkedCohorts.reduce((sum, a) => sum + a, 0)
}

export const getRequestName = (request: RequestType) => {
  const sharedByDetails = request.shared_by ? ` - Envoyée par : ${request.shared_by}` : ''
  return `${request.name}${sharedByDetails}`
}
