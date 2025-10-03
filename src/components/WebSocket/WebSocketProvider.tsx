import { AppConfig } from 'config'
import { ACCESS_TOKEN } from '../../constants'
import React, { PropsWithChildren, createContext, useContext, useEffect, useRef } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { WebSocketHook } from 'react-use-websocket/dist/lib/types'
import { WebSocketMessage, WebSocketMessageType } from 'types'
import { useGlobalWebsocketListeners } from './globalListeners'

type WebSocketContentType = {
  websocket: WebSocketHook<string, MessageEvent<string> | null>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addListener: (newListener: (message: WebSocketMessage<any>) => void, type?: WebSocketMessageType) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeListener: (oldListener: (message: WebSocketMessage<any>) => void) => void
}

export const WebSocketContext = createContext<WebSocketContentType | null>(null)

export const WebSocketProvider = ({ children }: PropsWithChildren) => {
  const appConfig = useContext(AppConfig)
  const websocket = useWebSocket<string>(
    `${appConfig.system.wsProtocol}${window.location.host}${appConfig.system.backendUrl}/ws/`,
    {
      share: true,
      onError: () => console.error('An error occured.'),
      onClose: () => console.info('Disconnected from WebSocket.'),
      shouldReconnect: () => true
    }
  )

  const websocketRef = useRef(Object.assign({}, websocket))
  const globalListeners = useGlobalWebsocketListeners()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listenersRef = useRef<{ [type: string]: Array<(message: WebSocketMessage<any>) => void> }>(globalListeners)

  const addListener = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (message: WebSocketMessage<any>) => void,
    type: WebSocketMessageType = WebSocketMessageType.ANY
  ) => {
    if (!listenersRef.current[type]) {
      listenersRef.current[type] = []
    }
    listenersRef.current[type].push(listener)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const removeListener = (listener: (message: WebSocketMessage<any>) => void) => {
    Object.keys(listenersRef.current).forEach((type) => {
      listenersRef.current[type] = listenersRef.current[type].filter((l) => l !== listener)
    })
  }

  const token = localStorage.getItem(ACCESS_TOKEN)
  const oidcAuthState = localStorage.getItem('oidcAuth')

  useEffect(() => {
    const message: WebSocketMessage = JSON.parse(websocket.lastMessage?.data ?? '{}')
    if (message.type && listenersRef.current[message.type]) {
      listenersRef.current[message.type].forEach((listener) => listener(message))
    }
    listenersRef.current[WebSocketMessageType.ANY]?.forEach((listener) => listener(message))
  }, [websocket.lastMessage])

  useEffect(() => {
    if (websocketRef.current.readyState !== websocket.readyState && websocket.readyState === ReadyState.OPEN) {
      websocket.sendJsonMessage({ token: token, auth_method: oidcAuthState === 'true' ? 'OIDC' : 'JWT' })
    }
    websocketRef.current = websocket
  }, [websocket, token, oidcAuthState])

  return (
    <WebSocketContext.Provider value={{ websocket, addListener, removeListener }}>{children}</WebSocketContext.Provider>
  )
}
