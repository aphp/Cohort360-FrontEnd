import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Grid, CssBaseline, Typography, Button, CircularProgress } from '@mui/material'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import DataTable from 'components/ui/Table'
import HeaderPage from 'components/ui/HeaderPage'
import { useNavigate, useSearchParams } from 'react-router-dom'
import sideBarTransition from 'styles/sideBarTransition'
import styles from './styles'
import { fetchExportsList } from 'services/aphp/serviceExportCohort'
import { cleanSearchParams } from 'utils/paginationUtils'
import { Back_API_Response, LoadingStatus } from 'types'
import { cancelPendingRequest } from 'utils/abortController'
import useSearchCriterias, { initExportSearchCriterias } from 'reducers/searchCriteriasReducer'
import { mapExportListToTable } from 'mappers/exports'
import { ExportList, FetchExportArgs } from 'types/export'
import { Pagination } from 'components/ui/Pagination'
import { StickyContainer } from 'components/ui/Pagination/styles'
import { useAppSelector } from 'state'

const RESULTS_PER_PAGE = 20

const Export = () => {
  const { classes, cx } = sideBarTransition()
  const controllerRef = useRef<AbortController>(new AbortController())
  const navigate = useNavigate()
  const openDrawer = useAppSelector((state) => state.drawer)
  const user = useAppSelector((state) => state.me?.impersonation?.username ?? state.me?.userName) ?? ''
  const deidentified = useAppSelector((state) => state.me?.deidentified)
  const [exportList, setExportList] = useState<Back_API_Response<ExportList> | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [searchParams, setSearchParams] = useSearchParams()
  const [pagination, setPagination] = useState({ current: 0, total: 0 })
  const [{ orderBy, searchInput }, { changeOrderBy, changeSearchInput }] = useSearchCriterias(initExportSearchCriterias)

  const _fetchExportList = async ({ input, orderBy, page }: FetchExportArgs) => {
    let controller = controllerRef.current
    if (loadingStatus === LoadingStatus.FETCHING) {
      controller = cancelPendingRequest(controllerRef.current)
      controllerRef.current = controller
    }
    setLoadingStatus(LoadingStatus.FETCHING)
    const response = await fetchExportsList({ user, page, input, orderBy }, controllerRef.current?.signal)
    if (controller?.signal.aborted) return
    setPagination((prev) => ({ ...prev, total: Math.ceil(response.count / RESULTS_PER_PAGE) }))
    setExportList(response)
    setLoadingStatus(LoadingStatus.SUCCESS)
  }

  const handleSearch = (args: Partial<FetchExportArgs>) => {
    const page = args.page ?? 1
    if ('input' in args) changeSearchInput(args.input ?? '')
    if (args.orderBy) changeOrderBy(args.orderBy)
    setPagination((prev) => ({ ...prev, current: page }))
    setSearchParams(cleanSearchParams({ page: page.toString() }))
    _fetchExportList({ page, input: args.input ?? searchInput ?? '', orderBy: args.orderBy ?? orderBy })
  }

  useEffect(() => {
    handleSearch({ page: Math.max(1, parseInt(searchParams.get('page') ?? '1', 10)) })
  }, [])

  useEffect(() => {
    if (deidentified) navigate('/home')
  }, [deidentified, navigate])

  const table = useMemo(() => mapExportListToTable(exportList?.results ?? []), [exportList])

  return (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, {
        [classes.appBarShift]: openDrawer
      })}
    >
      <Grid container direction="column" style={{ minHeight: '100vh' }}>
        <Grid container justifyContent="center" alignItems="center">
          <CssBaseline />
          <Grid container item xs={11} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <HeaderPage id="export-page-title" title="Mes exports" />
            <Grid container alignItems="center" gap="20px" style={{ flexGrow: 1 }}>
              <Grid item container gap={1} justifyContent="space-between">
                <Grid item xs={12} sm={5}>
                  <Button className={styles().classes.newExportButton} onClick={() => navigate('/exports/new')}>
                    Nouvel export
                  </Button>
                </Grid>
                <Grid container xs={12} sm={6}>
                  <SearchInput
                    value={searchInput ?? ''}
                    placeholder="Rechercher un export"
                    onChange={(input) => handleSearch({ input })}
                  />
                </Grid>
              </Grid>
              <Grid item container style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {loadingStatus === LoadingStatus.FETCHING && (
                  <Grid container justifyContent="center">
                    <CircularProgress />
                  </Grid>
                )}
                {loadingStatus === LoadingStatus.SUCCESS && (
                  <>
                    {!!exportList?.count && (
                      <DataTable
                        value={table}
                        orderBy={orderBy}
                        onSort={(orderBy) => handleSearch({ orderBy })}
                        sxRow={{ backgroundColor: 'white', flexGrow: 1 }}
                      />
                    )}
                    {!!!exportList?.count && (
                      <Grid container justifyContent="center">
                        <Typography variant="button">Aucune donnée à afficher</Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {pagination.total && (
        <StickyContainer container>
          <Pagination
            color="#303030"
            count={pagination.total}
            currentPage={pagination.current}
            onPageChange={(page) => handleSearch({ page })}
            centered={true}
          />
        </StickyContainer>
      )}
    </Grid>
  )
}

export default Export
