import type { QueryClient } from '@tanstack/react-query'
import { ACCESS_TOKEN, REFRESH_TOKEN } from 'constants.js'

// 'old-path' is the page to return to after login, 'oidcAuth' is written just before authenticating.
// The tokens are overwritten by the new session's right after: removing them first would look like
// a logout to the other tabs (see `CrossTabAuthSync`).
const KEYS_KEPT_ON_LOGIN = ['old-path', 'oidcAuth', ACCESS_TOKEN, REFRESH_TOKEN]

/**
 * Drops what a previous session left behind when the window was closed without logging out:
 * every localStorage entry (impersonated user, …) except the ones the current login needs or
 * overwrites, and the React Query cache.
 *
 * @param queryClient - The app's React Query client, emptied so no data fetched for another user is served from cache
 */
export const clearPreviousSession = (queryClient: QueryClient) => {
  Object.keys(localStorage)
    .filter((key) => !KEYS_KEPT_ON_LOGIN.includes(key))
    .forEach((key) => localStorage.removeItem(key))
  queryClient.clear()
}
