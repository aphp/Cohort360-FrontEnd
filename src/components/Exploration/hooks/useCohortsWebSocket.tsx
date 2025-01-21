import { useQueryClient } from '@tanstack/react-query'
import { WebSocketContext } from 'components/WebSocket/WebSocketProvider'
import { useContext, useEffect } from 'react'
import { WebSocketJobName, WebSocketJobStatus, WebSocketMessageType, WSJobStatus } from 'types'

// TODO: ajouter projetId aussi ?
const useCohortsWebSocket = (requestId?: string) => {
  const wsContext = useContext(WebSocketContext)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!requestId) return
    if (!wsContext) return

    // Listener appelé sur chaque message de type JOB_STATUS
    const listener = (message: WSJobStatus) => {
      if (message.job_name === WebSocketJobName.CREATE && message.status === WebSocketJobStatus.finished) {
        queryClient.invalidateQueries({ queryKey: ['cohorts', requestId] })
      }
    }

    wsContext.addListener(listener, WebSocketMessageType.JOB_STATUS) // pour s'abonner

    return () => {
      wsContext.removeListener(listener)
    }
  }, [requestId, wsContext, queryClient])
}

export default useCohortsWebSocket
