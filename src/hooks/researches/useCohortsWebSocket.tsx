import { useContext, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { WebSocketContext } from 'components/WebSocket/WebSocketProvider'
import { Cohort, JobStatus, WebSocketJobName, WebSocketMessageType, WSJobStatus } from 'types'
import { fetchCohortAccesses } from 'services/aphp/callApi'

const useCohortsWebSocket = () => {
  const wsContext = useContext(WebSocketContext)
  const queryClient = useQueryClient()

  const updateCohorts = async (message: WSJobStatus) => {
    const newRights = message.extra_info?.group_id
      ? (await fetchCohortAccesses([message.extra_info?.group_id])).data
      : []

    const queryKeys = queryClient.getQueriesData<{
      count: number
      next: string | null
      previous: string | null
      results: Cohort[]
    }>({ queryKey: ['cohorts'] })
    queryKeys.forEach(([key, oldData]) => {
      if (!oldData?.results) return

      const updatedCohorts = oldData.results.map((cohort) =>
        cohort.uuid === message.uuid
          ? {
              ...cohort,
              measure_min: message.extra_info?.global?.measure_min,
              measure_max: message.extra_info?.global?.measure_max,
              request_job_status: message.status,
              group_id: message.extra_info?.group_id,
              rights: newRights.find((right) => right.cohort_id == cohort.group_id)?.rights
            }
          : cohort
      )

      queryClient.setQueryData(key, { ...oldData, results: updatedCohorts })
    })
  }

  useEffect(() => {
    if (!wsContext) return
    // Listener appelé sur chaque message de type JOB_STATUS
    const listener = (message: WSJobStatus) => {
      if (message.job_name === WebSocketJobName.CREATE && message.status === JobStatus.FINISHED) {
        updateCohorts(message)
      }
    }

    wsContext.addListener(listener, WebSocketMessageType.JOB_STATUS) // pour s'abonner

    return () => {
      wsContext.removeListener(listener)
    }
  }, [wsContext])

  return null
}

export default useCohortsWebSocket
