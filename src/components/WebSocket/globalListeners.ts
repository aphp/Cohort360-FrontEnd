import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { updateMaintenance } from 'state/me'
import { MaintenanceInfo, WebSocketMessage, WebSocketMessageType } from 'types'

export const useGlobalWebsocketListeners = () => {
  const dispatch = useAppDispatch()

  const handleMaintenanceMessage = useCallback(
    (message: WebSocketMessage<{ info: MaintenanceInfo }>) => {
      if (message.type === WebSocketMessageType.MAINTENANCE) {
        dispatch(updateMaintenance(message.info))
      }
    },
    [dispatch]
  )

  return {
    [WebSocketMessageType.MAINTENANCE]: [handleMaintenanceMessage]
  }
}
