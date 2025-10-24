import { RESULTS_PER_PAGE } from 'components/ExplorationBoard/useData'
import { getConfig } from 'config'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from 'state'
import { showDialog } from 'state/warningDialog'
import { ExplorationConfig } from 'types/exploration'
import { Filters, SearchCriterias } from 'types/searchCriterias'

export const usePagination = <T>(
  config: ExplorationConfig<T>,
  searchCriterias: SearchCriterias<Filters>,
  fetcher: (page: number, searchCriterias: SearchCriterias<Filters>, config: ExplorationConfig<T>) => Promise<number>
) => {
  const [searchParams] = useSearchParams()

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [pagination, setPagination] = useState({ current: 0, total: 0 })

  const updateUrlWithPage = (page: number) => {
    const params = new URLSearchParams(location.search)
    params.set('page', page.toString())
    navigate(`${location.pathname}?${params.toString()}`, { replace: true })
  }

  const redirect = async (page: number) => {
    updateUrlWithPage(page)
  }

  const validatePageNumber = (nextPage: number) => {
    const config = getConfig()
    const maxAllowedPages = config.core.pagination.limit

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
  }

  const handleChangePage = async (page: number) => {
    validatePageNumber(page)
    const total = await fetcher(page, searchCriterias, config)
    setPagination({ current: page, total: Math.ceil(total / RESULTS_PER_PAGE) })
  }

  useEffect(() => {
    const fetchPage = async () => {
      const pageFromUrl = parseInt(searchParams.get('page') ?? '1', 10)
      await handleChangePage(pageFromUrl)
    }
    fetchPage()
  }, [searchParams])

  useEffect(() => {
    const fetchPage = async () => {
      await handleChangePage(pagination.current)
    }
    fetchPage()
  }, [searchCriterias])

  return {
    pagination,
    onChangePage: (page: number) => handleChangePage(page)
  }
}
