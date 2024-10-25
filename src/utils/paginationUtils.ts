import { AppDispatch } from 'state'
import { getConfig } from 'config'
import { showDialog } from 'state/warningDialog'
import { LoadingStatus } from 'types'

export const checkIfPageAvailable = (
  count: number,
  currentPage: number,
  setPage: (page: number) => void,
  dispatch: AppDispatch,
  rowsPerPage = 20
) => {
  if (!(currentPage === 1 && count === 0)) {
    const totalPagesAvalaible = Math.ceil(count / rowsPerPage)
    if (totalPagesAvalaible < currentPage) {
      dispatch(
        showDialog({
          isOpen: true,
          message: `Le numéro de page indiqué dans l'url est supérieur au nombre de pages possible pour ce tableau qui est de ${totalPagesAvalaible}. En cliquant sur OK, vous serez redirigé vers la dernière page disponible.`,
          onConfirm: () => setPage(totalPagesAvalaible)
        })
      )
    }
  }
}

export const handlePageError = (
  page: number,
  setPage: (page: number) => void,
  dispatch: AppDispatch,
  setLoadingStatus: (loadingStatus: LoadingStatus) => void
) => {
  const config = getConfig()
  if (isNaN(page) || page <= 0) {
    setPage(1)
  } else if (page > config.core.pagination.limit) {
    dispatch(
      showDialog({
        isOpen: true,
        message: `La sélection est limitée à ${config.core.pagination.limit} pages. En cliquant sur OK, vous serez redirigé vers la page 1.`,
        onConfirm: () => setPage(1)
      })
    )
  } else {
    setLoadingStatus(LoadingStatus.IDDLE)
  }
}

export const getCleanGroupId = (groupId: string | null) => {
  if (groupId === null) return undefined
  const cleanGroupId = groupId.split(',').filter((value) => !!value && RegExp(/^\d+$/).exec(value))

  return cleanGroupId.length > 0 ? cleanGroupId.join() : undefined
}

type cleanSearchParamsProps = {
  page: string
  tabId?: string
  groupId?: string
}
export const cleanSearchParams = (params: cleanSearchParamsProps) => {
  const { page, tabId, groupId } = params
  return {
    ...(groupId && getCleanGroupId(groupId) && { groupId: getCleanGroupId(groupId) }),
    page: page,
    ...(tabId && { tabId })
  }
}
