import { useEffect } from 'react'
import { useAppDispatch } from 'state'
import { showDialog } from 'state/warningDialog'

const usePageValidation = (
  total: number,
  page: number,
  rowsPerPage: number,
  onInvalidPage: (pageMax: number) => void
) => {
  const dispatch = useAppDispatch()

  //TODO : merge avec checkIfPageAvailable dans paginationUtils
  useEffect(() => {
    if (total >= 0) {
      const totalPages = Math.ceil(total / rowsPerPage)
      if (page > totalPages && totalPages > 0) {
        dispatch(
          showDialog({
            isOpen: true,
            message: `Le numéro de page indiqué dans l'url est supérieur au nombre de pages possible pour ce tableau qui est de ${totalPages}. En cliquant sur OK, vous serez redirigé vers la dernière page disponible.`,
            onConfirm: () => onInvalidPage(totalPages),
            status: 'warning'
          })
        )
      }
    }
  }, [page, total, rowsPerPage, dispatch, onInvalidPage])
}

export default usePageValidation
