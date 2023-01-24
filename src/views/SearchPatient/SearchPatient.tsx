import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useAppSelector } from 'state'
import { useParams } from 'react-router'

import { CircularProgress, Grid, Typography } from '@material-ui/core'

import PatientSearchBar from 'components/Inputs/PatientSearchBar/PatientSearchBar'
import DataTablePatient from 'components/DataTable/DataTablePatient'

import services from 'services'

import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4'
import { SearchByTypes, Order } from 'types'

import useStyles from './styles'

const SearchPatient: React.FC<{}> = () => {
  const classes = useStyles()
  const practitioner = useAppSelector((state) => state.me)
  const { search } = useParams<{ search: string }>()

  const [loading, setLoading] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [patientResults, setPatientResults] = useState<IPatient[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [searchInput, setSearchInput] = useState(search ?? '')

  const [order, setOrder] = useState<Order>({
    orderBy: 'given',
    orderDirection: 'asc'
  })

  const performQueries = async (page: number) => {
    const nominativeGroupsIds = practitioner ? practitioner.nominativeGroupsIds : []
    if (!searchInput) return

    setLoading(true)
    if (typeof services?.patients?.searchPatient === 'function') {
      const results = await services.patients.searchPatient(
        nominativeGroupsIds,
        page,
        order.orderBy,
        order.orderDirection,
        searchInput,
        searchBy
      )
      if (results) {
        setPatientResults(results.patientList ?? [])
        setTotal(results.totalPatients ?? 0)
        setShowTable(true)
      }
    }
    setLoading(false)
  }

  const handleChangePage = (page: number) => {
    setPage(page)
    performQueries(page)
  }

  useEffect(() => {
    performQueries(page)
  }, [order.orderBy, order.orderDirection, searchBy]) // eslint-disable-line

  const open = useAppSelector((state) => state.drawer)

  return (
    <Grid
      container
      direction="column"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Grid container justifyContent="center" alignItems="center">
        <Grid container item xs={11}>
          <Typography variant="h1" color="primary" className={classes.title}>
            Rechercher un patient
          </Typography>
          <PatientSearchBar
            showSelect
            performQueries={performQueries}
            searchInput={searchInput}
            onChangeInput={setSearchInput}
            searchBy={searchBy}
            onChangeSearchBy={setSearchBy}
          />
          {loading && (
            <Grid container item justifyContent="center">
              <CircularProgress />
            </Grid>
          )}
          {!loading && showTable && (
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
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SearchPatient
