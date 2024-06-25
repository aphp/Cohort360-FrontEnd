import { ACCESS_TOKEN, BACK_API_URL, SOCKET_API_URL } from '../../constants'
import React, { PropsWithChildren, createContext, useEffect, useRef } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { WebSocketHook } from 'react-use-websocket/dist/lib/types'
import { WebSocketMessage } from 'types'

type WebSocketContentType = {
  websocket: WebSocketHook<string, MessageEvent<string> | null>
  addListener: (newListener: (message: WebSocketMessage) => void) => void
  removeListener: (oldListener: (message: WebSocketMessage) => void) => void
}

export const WebSocketContext = createContext<WebSocketContentType | null>(null)

export const WebSocketProvider = ({ children }: PropsWithChildren) => {
  const websocket = useWebSocket<string>(`${SOCKET_API_URL}${window.location.host}${BACK_API_URL}/ws/`, {
    share: true,
    onError: () => console.error('An error occured.'),
    onClose: () => console.info('Disconnected from WebSocket.'),
    shouldReconnect: () => true
  })

  const websocketRef = useRef(Object.assign({}, websocket))

  const listenersRef = useRef<Array<(message: WebSocketMessage) => void>>([])

  const addListener = (listener: (message: WebSocketMessage) => void) => {
    listenersRef.current.push(listener)
  }

  const removeListener = (listener: (message: WebSocketMessage) => void) => {
    listenersRef.current = listenersRef.current.filter((l) => l !== listener)
  }

  const token = localStorage.getItem(ACCESS_TOKEN)
  const oidcAuthState = localStorage.getItem('oidcAuth')

  useEffect(() => {
    listenersRef.current.forEach((listener) => listener(JSON.parse(websocket.lastMessage?.data ?? '{}')))
  }, [websocket.lastMessage])

  useEffect(() => {
    if (websocketRef.current.readyState !== websocket.readyState && websocket.readyState === ReadyState.OPEN) {
      // Newly Open Websocket
      websocket.sendJsonMessage({ token: token, auth_method: oidcAuthState === 'true' ? 'OIDC' : 'JWT' })
    }
    websocketRef.current = websocket
  }, [websocket])

  return (
    <WebSocketContext.Provider value={{ websocket, addListener, removeListener }}>{children}</WebSocketContext.Provider>
  )
}
