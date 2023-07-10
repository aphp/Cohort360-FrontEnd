import React, { useEffect, useRef, useState } from 'react'
import { useAppSelector } from 'state'
import { useParams } from 'react-router'

import { Grid, Typography } from '@mui/material'

import DataTableTopBar from 'components/DataTable/DataTableTopBar'
import DataTablePatient from 'components/DataTable/DataTablePatient'

import services from 'services/aphp'

import { SearchByTypes, Order } from 'types'

import useStyles from './styles'
import { Patient } from 'fhir/r4'
import { useDebounce } from 'utils/debounce'
import { _cancelPendingRequest } from 'utils/abortController'

const SearchPatient: React.FC<{}> = () => {
  const { classes, cx } = useStyles()
  const practitioner = useAppSelector((state) => state.me)
  const { search } = useParams<{ search: string }>()

  const [loading, setLoading] = useState(false)
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [searchInput, setSearchInput] = useState(search ?? '')

  const [order, setOrder] = useState<Order>({
    orderBy: 'family',
    orderDirection: 'asc'
  })

  const debouncedSearchInput = useDebounce(500, searchInput)
  const controllerRef = useRef<AbortController>(new AbortController())

  /*const _cancelPendingRequest = () => {
    if (controllerRef.current) {
      controllerRef.current.abort()
    }
    controllerRef.current = new AbortController()
  }*/

  const performQueries = async (page: number) => {
    const nominativeGroupsIds = practitioner ? practitioner.nominativeGroupsIds : []

    setLoading(true)
    if (typeof services?.patients?.searchPatient === 'function') {
      const results = await services.patients.searchPatient(
        nominativeGroupsIds,
        page,
        order.orderBy,
        order.orderDirection,
        searchInput,
        searchBy,
        controllerRef.current.signal
      )
      if (results) {
        setPatientResults(results.patientList ?? [])
        setTotal(results.totalPatients ?? 0)
      }
    }
    setLoading(false)
  }

  const handleChangePage = (page: number) => {
    setPage(page)
    performQueries(page)
  }

  const onSearchPatient = (inputSearch?: string, searchBy?: SearchByTypes) => {
    setSearchInput(inputSearch ?? '')
    setSearchBy(searchBy ?? SearchByTypes.text)
  }

  useEffect(() => {
    _cancelPendingRequest(controllerRef)
    setPage(1)
    performQueries(1)
  }, [order, searchBy, debouncedSearchInput, controllerRef])

  const open = useAppSelector((state) => state.drawer)

  return (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Grid container justifyContent="center" alignItems="center">
        <Grid container item xs={11}>
          <Typography variant="h1" color="primary" className={classes.title}>
            Rechercher un patient
          </Typography>
          <Grid container style={{ marginBottom: 8 }}>
            <DataTableTopBar
              loading={false}
              searchBar={{
                type: 'patient',
                value: searchInput,
                searchBy: searchBy,
                fullWidth: true,
                onSearch: (newSearchInput: string, newSearchBy?: SearchByTypes) =>
                  onSearchPatient(newSearchInput, newSearchBy)
              }}
            />
          </Grid>

          <DataTablePatient
            loading={loading}
            groupId={practitioner?.nominativeGroupsIds ? practitioner?.nominativeGroupsIds.join(',') : undefined}
            search={searchInput}
            deidentified={practitioner?.deidentified ?? true}
            patientsList={patientResults ?? []}
            order={order}
            setOrder={setOrder}
            page={page}
            setPage={(newPage) => handleChangePage(newPage)}
            total={total}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SearchPatient
