import { AppDispatch } from 'state'
import { getConfig } from 'config'
import { showDialog } from 'state/warningDialog'

export const mapParamsToNetworkParams = (params: string[]) => {
  let url = ''
  params.forEach((item, index) => {
    url += index === 0 ? `?${item}` : `&${item}`
  })
  return url
}

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
