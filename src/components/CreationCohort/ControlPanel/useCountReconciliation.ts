import { useEffect, useRef } from 'react'

import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { updateCount } from 'state/cohortCreation'
import { type CohortCount, JobStatus } from 'types'

export const POLL_INTERVAL_MS = 30_000
export const STUCK_TIMEOUT_MS = 10 * 60_000

const NON_TERMINAL_STATUSES = new Set<string>([
  JobStatus.NEW,
  JobStatus.PENDING,
  JobStatus.STARTED,
  JobStatus.LONG_PENDING
])

export const useCountReconciliation = (count: CohortCount | undefined): void => {
  const dispatch = useAppDispatch()
  const stuckSinceRef = useRef<{ uuid: string; at: number } | null>(null)

  useEffect(() => {
    const uuid = count?.uuid
    const status = count?.status

    if (!uuid || !status || !NON_TERMINAL_STATUSES.has(status)) {
      if (stuckSinceRef.current && (!uuid || stuckSinceRef.current.uuid !== uuid)) {
        stuckSinceRef.current = null
      }
      return
    }

    if (!stuckSinceRef.current || stuckSinceRef.current.uuid !== uuid) {
      stuckSinceRef.current = { uuid, at: Date.now() }
    }

    let cancelled = false

    const poll = async () => {
      try {
        const fresh = await services.cohortCreation.countCohort(undefined, undefined, undefined, uuid)
        if (cancelled || !fresh) return

        const freshStatus = fresh.status
        if (freshStatus && !NON_TERMINAL_STATUSES.has(freshStatus)) {
          dispatch(
            updateCount({
              status: freshStatus,
              includePatient: fresh.includePatient,
              jobFailMsg: fresh.jobFailMsg,
              extra: fresh.extra,
              snapshotId: fresh.snapshotId
            })
          )
          return
        }

        const stuckSince = stuckSinceRef.current
        if (stuckSince && stuckSince.uuid === uuid && Date.now() - stuckSince.at >= STUCK_TIMEOUT_MS) {
          dispatch(
            updateCount({
              status: 'error',
              jobFailMsg: `Aucune réponse du moteur de calcul après ${STUCK_TIMEOUT_MS / 60_000} min.`
            })
          )
        }
      } catch {
        /* */
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [count?.uuid, count?.status, dispatch])
}
