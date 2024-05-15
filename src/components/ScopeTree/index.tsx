import React, { useCallback } from 'react'
import { useAppSelector } from 'state'
import { LoadingStatus, ScopeTreeRow, ScopeType } from 'types'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import {
  CircularProgress,
  Grid,
  Pagination,
  Paper,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@mui/material'
import { useHierarchy } from '../../hooks/hierarchy/useHierarchy'
import servicesPerimeters from '../../services/aphp/servicePerimeters'
import ScopeTreeTest from './ScopeTreeTest'
import SelectedCodes from './SelectedCodes'
import { useFetch } from 'hooks/useFetch'
import { useSearchParameters } from 'hooks/useSearchParameters'

type ScopeTreeProps = {
  selectedIds: string
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  isExecutiveUnit: boolean
  executiveUnitType?: ScopeType
}

const Index = ({ selectedIds, setSelectedItems, isExecutiveUnit, executiveUnitType }: ScopeTreeProps) => {
  const practitionerId = useAppSelector((state) => state.me)?.id || ''
  const { options, onChangeSearchInput, onChangePage, onChangeCount, onChangeSearchMode } = useSearchParameters()

  const fetchBaseTree = useCallback(async () => {
    const response = isExecutiveUnit
      ? await servicesPerimeters.getPerimeters({ practitionerId })
      : await servicesPerimeters.getRights({ practitionerId })
    return response
  }, [isExecutiveUnit, practitionerId])

  const fetchChildren = useCallback(
    async (ids: string) => {
      const { results } = isExecutiveUnit
        ? await servicesPerimeters.getPerimeters({ practitionerId, ids, limit: -1 })
        : await servicesPerimeters.getRights({ practitionerId, ids, limit: -1 })
      return results
    },
    [isExecutiveUnit, practitionerId]
  )

  const fetchSearch = useCallback(
    async (search: string, page: number) => {
      const { results, count } = isExecutiveUnit
        ? await servicesPerimeters.getPerimeters({ practitionerId, search, page, limit: options.limit })
        : await servicesPerimeters.getRights({ practitionerId, search, page, limit: options.limit })
      onChangeCount(count)
      return results
    },
    [isExecutiveUnit, practitionerId]
  )

  const { fetchStatus: baseLevelsFetchStatus, response: baseLevelsResponse } = useFetch(fetchBaseTree)

  const {
    hierarchy,
    selectedCodes,
    loadingStatus,
    selectAllStatus,
    search,
    expandHierarchy,
    selectHierarchyCode,
    selectAllHierarchyCodes,
    deleteHierarchyCode
  } = useHierarchy(baseLevelsResponse.results, fetchChildren, selectedIds)

  const handleSearch = (searchValue: string, page: number) => {
    if (searchValue === '') onChangeCount(baseLevelsResponse.count)
    onChangeSearchInput(searchValue)
    onChangePage(page)
    onChangeSearchMode(searchValue !== '')
    search(searchValue, page, fetchSearch)
  }

  return (
    <Grid container direction="column" wrap="nowrap" height="100%" overflow="hidden">
      <Grid style={{ width: '30%', margin: '8px 8px 8px 70%' }}>
        <SearchInput
          value={options.search}
          placeholder={'Rechercher'}
          onchange={(newValue) => handleSearch(newValue, 0)}
        />
      </Grid>

      <Grid container direction="column" wrap="wrap" height="100%" overflow="auto">
        {baseLevelsFetchStatus === LoadingStatus.SUCCESS &&
          loadingStatus === LoadingStatus.SUCCESS &&
          baseLevelsResponse.count && (
            <Grid
              item
              container
              direction="column"
              justifyContent="space-between"
              wrap="nowrap"
              height="100%"
              style={{ overflowX: 'auto' }}
            >
              <TableContainer component={Paper} style={{ overflowX: 'hidden' }}>
                <ScopeTreeTest
                  selectAllStatus={selectAllStatus}
                  executiveUnitType={executiveUnitType}
                  searchMode={options.searchMode}
                  hierarchy={hierarchy}
                  onExpand={expandHierarchy}
                  onSelect={selectHierarchyCode}
                  onSelectAll={selectAllHierarchyCodes}
                />

                <>
                  {((baseLevelsFetchStatus === LoadingStatus.SUCCESS && !baseLevelsResponse.count) ||
                    (loadingStatus === LoadingStatus.SUCCESS && !hierarchy.length)) && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography>Aucun résultat à afficher</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              </TableContainer>

              <Grid item alignSelf="bottom">
                <Paper elevation={5}>
                  <Grid item style={{ padding: '10px 40px', borderBottom: '2px solid #0063AF' }}>
                    <SelectedCodes values={selectedCodes} onDelete={deleteHierarchyCode} />
                  </Grid>

                  <Grid item container justifyContent="center" style={{ padding: '10px 40px' }}>
                    <Pagination
                      count={options.totalPages || 1}
                      color="primary"
                      onChange={(event, page: number) => handleSearch(options.search, page - 1)}
                      page={options.page + 1}
                    />
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

        {baseLevelsFetchStatus === LoadingStatus.FETCHING ||
          (loadingStatus === LoadingStatus.FETCHING && (
            <Grid container justifyContent="center" alignContent="center" height={500}>
              <CircularProgress />
            </Grid>
          ))}
      </Grid>
    </Grid>
  )
}
export default Index
