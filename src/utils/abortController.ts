export const cancelPendingRequest = (controller: AbortController | null): AbortController => {
  if (controller?.signal && !controller?.signal?.aborted) {
    controller.abort()
  }
  return new AbortController()
}
