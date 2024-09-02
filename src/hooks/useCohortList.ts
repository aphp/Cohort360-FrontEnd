import { WebSocketContext } from 'components/WebSocket/WebSocketProvider'
import { useContext, useEffect, useState } from 'react'
import servicesCohorts from 'services/aphp/serviceCohorts'
import { useAppSelector } from 'state'
import { WebSocketJobName, WebSocketJobStatus, WebSocketMessageType, WSJobStatus } from 'types'

/**
 * Returns the list of the fetched cohorts (a single 20 element page)
 * It will also listen to the WebSocket for cohort creation events and update the list accordingly if the updated cohort is in the list
 * TODO: this hook is temporaray, there should be a global handling of the WebSocket events to update the store state instead of this temporary list
 * Maybe the store will be removed in the future when Cohorts/Requests page is refactored
 * @returns the currently fetched cohort list with automatic updates of existing cohorts
 */
const useCohortList = () => {
  const stateCohortList = useAppSelector((state) => state.cohort.cohortsList)
  const [cohortList, setCohortList] = useState(stateCohortList)

  const webSocketContext = useContext(WebSocketContext)

  useEffect(() => {
    setCohortList(stateCohortList)
  }, [stateCohortList])

  useEffect(() => {
    const listener = async (message: WSJobStatus) => {
      if (message.job_name === WebSocketJobName.CREATE && message.status === WebSocketJobStatus.finished) {
        const websocketUpdatedCohorts = cohortList.map((cohort) => {
          const temp = Object.assign({}, cohort)
          if (temp.uuid === message.uuid) {
            if (temp.dated_measure_global) {
              temp.dated_measure_global = {
                ...temp.dated_measure_global,
                measure_min: message.extra_info?.global ? message.extra_info.global.measure_min : null,
                measure_max: message.extra_info?.global ? message.extra_info.global.measure_max : null
              }
            }
            temp.request_job_status = message.status
            temp.group_id = message.extra_info?.group_id
          }
          return temp
        })
        const newCohortList = await servicesCohorts.fetchCohortsRights(websocketUpdatedCohorts)
        setCohortList(newCohortList)
      }
    }

    webSocketContext?.addListener(listener, WebSocketMessageType.JOB_STATUS)
    return () => webSocketContext?.removeListener(listener)
  }, [cohortList, webSocketContext])

  return cohortList
}

export default useCohortList
