import { CanceledError } from 'axios'
import { ACCESS_TOKEN } from 'constants.js'
import { getStoredAccessToken, getTokenUsername } from './tokens'

let readSessionUsername: () => string | undefined = () => undefined

/**
 * Lets the store provide the username this tab displays (`me.userName`). The API clients can't
 * import the store themselves: store → me → services → API clients would be a cycle.
 */
export const registerSessionUsername = (reader: () => string | undefined) => {
  readSessionUsername = reader
}

/**
 * True when the stored access token was issued for another user than the one this tab displays.
 * localStorage is shared by all tabs while each tab keeps its own user in memory, so another tab
 * logging in as someone else swaps the token under this tab. Requests sent from this tab would then
 * act on the other user's account (onboarding, charter, saved requests…) while showing this one.
 * Nothing to compare without a displayed user or a username in the token.
 */
export const isSessionUserMismatch = (): boolean => {
  const sessionUsername = readSessionUsername()
  const tokenUsername = getTokenUsername(getStoredAccessToken())
  return !!sessionUsername && !!tokenUsername && sessionUsername !== tokenUsername
}

/**
 * True when another tab's localStorage change ended this tab's session: the token was removed
 * (`key` is null when the other tab called `localStorage.clear()`, which every logout does) or now
 * belongs to another user. A refresh of the same user's token keeps the session.
 */
export const isSessionLostAfterStorageChange = (key: string | null): boolean => {
  if (key !== null && key !== ACCESS_TOKEN) {
    return false
  }
  return !getStoredAccessToken() || isSessionUserMismatch()
}

/**
 * Goes back to the login page with a full reload, so nothing of the previous session stays in
 * this tab's memory (Redux, React Query).
 */
export const leaveSession = () => {
  if (window.location.pathname !== '/') {
    window.location.assign('/')
  }
}

/**
 * Request guard for the API clients: never sends a request with another user's token (see
 * `isSessionUserMismatch`). It cancels the request, which callers already treat as an aborted
 * request, and leaves the session.
 */
export const assertSessionUser = () => {
  if (!isSessionUserMismatch()) {
    return
  }
  leaveSession()
  throw new CanceledError('Access token belongs to another user than the displayed one')
}
