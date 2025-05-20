import { CohortCount, DatedMeasure } from 'types'

/**
 * This exists because there seems to be a problem in the count state in the cohort creation state
 * where the request is first initiated as a DatedMeasure and then it is updated to a CohortCount
 * @param request The request object to check is either a CohortCount or DatedMeasure
 * @returns if the request is finished
 */
export const isRequestFinished = (request: CohortCount | DatedMeasure) => {
  return (
    request &&
    ((request as unknown as CohortCount).status === 'finished' ||
      (request as unknown as DatedMeasure).request_job_status === 'finished')
  )
}
