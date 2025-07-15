/**
 * @fileoverview Utility functions for handling AbortController instances
 * @module utils/abortController
 */

/**
 * Cancels a pending request if it exists and creates a new AbortController instance
 *
 * @param controller - The AbortController instance to cancel, or null
 * @returns A new AbortController instance
 *
 * @example
 * ```typescript
 * const controller = new AbortController();
 * const newController = cancelPendingRequest(controller);
 * ```
 */
export const cancelPendingRequest = (controller: AbortController | null): AbortController => {
  if (controller?.signal && !controller?.signal?.aborted) {
    controller.abort()
  }
  return new AbortController()
}
