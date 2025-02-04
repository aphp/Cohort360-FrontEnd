import { useQueryClient } from '@tanstack/react-query'
import { WebSocketContext } from 'components/WebSocket/WebSocketProvider'
import { useContext, useEffect } from 'react'
import { WebSocketJobName, WebSocketJobStatus, WebSocketMessageType, WSJobStatus } from 'types'

const useCohortsWebSocket = () => {
  const wsContext = useContext(WebSocketContext)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!wsContext) return
    // Listener appelé sur chaque message de type JOB_STATUS
    const listener = (message: WSJobStatus) => {
      if (message.job_name === WebSocketJobName.CREATE && message.status === WebSocketJobStatus.finished) {
        queryClient.invalidateQueries({ queryKey: ['cohorts'] })
      }
    }

    // TODO: au lieu d'invalidate les cohorts, simplement modifier l'objet concerné
    wsContext.addListener(listener, WebSocketMessageType.JOB_STATUS) // pour s'abonner

    return () => {
      wsContext.removeListener(listener)
    }
  }, [wsContext, queryClient])
}

export default useCohortsWebSocket
