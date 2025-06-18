/**
 * @fileoverview Utility functions for URL parameter handling and page validation
 * @module utils/url
 */

import { AppDispatch } from 'state'
import { getConfig } from 'config'
import { showDialog } from 'state/warningDialog'

/**
 * Converts an array of parameter strings to a URL query string
 *
 * @param params - Array of parameter strings (e.g., ['key1=value1', 'key2=value2'])
 * @returns A formatted URL query string
 *
 * @example
 * ```typescript
 * mapParamsToNetworkParams(['page=1', 'size=10']) // returns '?page=1&size=10'
 * ```
 */
export const mapParamsToNetworkParams = (params: string[]) => {
  let url = ''
  params.forEach((item, index) => {
    url += index === 0 ? `?${item}` : `&${item}`
  })
  return url
}

/**
 * Validates a page number and shows appropriate warnings/redirects if invalid
 *
 * @param requestedPage - The requested page number
 * @param totalPages - The total number of available pages
 * @param onRedirect - Callback function to handle page redirection
 * @param dispatch - Redux dispatch function for showing dialogs
 *
 * @example
 * ```typescript
 * validatePageNumber(5, 10, (page) => navigate(`/page/${page}`), dispatch)
 * ```
 */
export const validatePageNumber = (
  requestedPage: number,
  totalPages: number,
  onRedirect: (newPage: number) => void,
  dispatch: AppDispatch
) => {
  const config = getConfig()
  const maxAllowedPages = config.core.pagination.limit

  // page NaN ou invalide
  if (isNaN(requestedPage) || requestedPage <= 0) {
    onRedirect(1)
  }

  // page trop grande selon la limite système
  if (requestedPage > maxAllowedPages) {
    dispatch(
      showDialog({
        isOpen: true,
        message: `La sélection est limitée à ${maxAllowedPages} pages. En cliquant sur OK, vous serez redirigé vers la page 1.`,
        onConfirm: () => onRedirect(1),
        status: 'warning'
      })
    )
  }

  // page trop grande selon les données réellement dispo
  if (requestedPage > totalPages && totalPages > 0) {
    dispatch(
      showDialog({
        isOpen: true,
        message: `Le numéro de page indiqué dans l'URL est supérieur au nombre de pages disponibles (${totalPages}). En cliquant sur OK, vous serez redirigé vers la dernière page disponible.`,
        onConfirm: () => onRedirect(totalPages),
        status: 'warning'
      })
    )
  }
}
