import { MutableRefObject } from 'react'

export const _cancelPendingRequest = (controllerRef: MutableRefObject<AbortController>) => {
  controllerRef?.current.abort()
}
