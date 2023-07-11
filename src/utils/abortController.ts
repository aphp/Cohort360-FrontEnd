export const _cancelPendingRequest = (controller: AbortController) => {
  controller.abort()
}
