import { RESULTS_PER_PAGE } from 'components/ExplorationBoard/useData'
import { getConfig } from 'config'
import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAppDispatch } from 'state'
import { showDialog } from 'state/warningDialog'

export const usePagination = () => {
  const [searchParams] = useSearchParams()
  const initialPage = parseInt(searchParams.get('page') ?? '1', 10)
  const [isPageFromUrl, setIsPageFromUrl] = useState(searchParams.has('page'))

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [pagination, setPagination] = useState({ currentPage: initialPage, total: 0 })

  const updateUrlWithPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(location.search)
      params.set('page', page.toString())
      navigate(`${location.pathname}?${params.toString()}`, { replace: true })
    },
    [navigate]
  )

  const redirect = useCallback(
    async (page: number) => {
      updateUrlWithPage(page)
    },
    [updateUrlWithPage]
  )

  const validatePageNumber = useCallback(
    (nextPage: number) => {
      const maxAllowedPages = getConfig().core.pagination.limit

      // page NaN ou invalide
      if (isNaN(nextPage) || nextPage <= 0) {
        redirect(1)
      }

      // page trop grande selon la limite système
      else if (nextPage > maxAllowedPages) {
        dispatch(
          showDialog({
            isOpen: true,
            message: `La sélection est limitée à ${maxAllowedPages} pages. En cliquant sur OK, vous serez redirigé vers la page 1.`,
            onConfirm: () => redirect(1),
            status: 'warning'
          })
        )
      }

      // page trop grande selon les données réellement dispo
      else if (nextPage > pagination.total && pagination.total > 0) {
        dispatch(
          showDialog({
            isOpen: true,
            message: `Le numéro de page indiqué dans l'URL est supérieur au nombre de pages disponibles (${pagination.total}). En cliquant sur OK, vous serez redirigé vers la dernière page disponible.`,
            onConfirm: () => redirect(pagination.total),
            status: 'warning'
          })
        )
      }

      redirect(nextPage)
    },
    [dispatch, pagination.total, redirect]
  )

  const onChangePage = useCallback(
    (currentPage: number) => {
      if (isPageFromUrl) setIsPageFromUrl(false)
      else {
        validatePageNumber(currentPage)
        setPagination((prev) => ({ total: prev.total, currentPage }))
      }
    },
    [isPageFromUrl, validatePageNumber]
  )

  const onChangeTotal = useCallback((total: number) => {
    setPagination((prev) => ({ currentPage: prev.currentPage, total: Math.ceil(total / RESULTS_PER_PAGE) }))
  }, [])

  return {
    pagination,
    onChangePage,
    onChangeTotal
  }
}
