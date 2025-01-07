import React, { useEffect, useState } from 'react'
import services from 'services/aphp'
import { Cohort } from 'types'
import { CohortsType } from 'types/cohorts'
import { Direction, Order } from 'types/searchCriterias'

const useCohorts = (parentRequestId: string, searchInput: string, startDate?: string, endDate?: string, page = 1) => {
  const [cohortsList, setCohortsList] = useState<Cohort[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // TODO: à externaliser
  const fetchCohortsList = async () => {
    // TODO: modifier le service de sorte à ajouter les filtres + try/catch
    const rowsPerPage = 20
    const offset = (page - 1) * rowsPerPage
    const cohortsList = await services.projects.fetchCohortsList(
      {
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        status: [],
        favorite: CohortsType.ALL,
        minPatients: null,
        maxPatients: null
      },
      searchInput,
      { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC },
      rowsPerPage,
      offset
      //   AbortSignal???
    )
    console.log('test cohortsList', cohortsList)
    setCohortsList(cohortsList.results)
    setTotal(cohortsList.count)
  }

  useEffect(() => {
    // setLoading(true)
    console.log('test fetchCohortsList()', fetchCohortsList())
  }, [parentRequestId, searchInput, startDate, endDate, page])

  return { cohortsList, total, loading }
}

export default useCohorts
