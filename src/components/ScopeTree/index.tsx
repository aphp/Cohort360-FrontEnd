import React, { useCallback, useMemo } from 'react'
import { useAppSelector } from 'state'
import { LoadingStatus, ScopeTreeRow, ScopeType } from 'types'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import {
  Checkbox,
  CircularProgress,
  Grid,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useHierarchy } from '../../hooks/hierarchy/useHierarchy'
import { useSearchParameters } from '../../hooks/useSearchParameters'
import servicesPerimeters from '../../services/aphp/servicePerimeters'
import useStyles from './utils/styles'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import ScopeTreeTest from './ScopeTreeTest'
import SelectedCodes from './SelectedCodes'
import { useFetch } from 'hooks/useFetch'

type ScopeTreeProps = {
  selectedIds: string
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  isExecutiveUnit: boolean
  executiveUnitType?: ScopeType
}

const Index = ({ selectedIds, setSelectedItems, isExecutiveUnit, executiveUnitType }: ScopeTreeProps) => {
  const { classes } = useStyles()
  const practitionerId = useAppSelector((state) => state.me)?.id || ''
  const { options, totalPageNumber } = useSearchParameters(20, 0)

  const fetchBaseTree = useCallback(() => {
    return isExecutiveUnit
      ? servicesPerimeters.getPerimeters({ practitionerId, search: options.searchInput })
      : servicesPerimeters.getRights({ practitionerId, search: options.searchInput })
  }, [isExecutiveUnit, practitionerId, options.searchInput])

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
    async (searchInput: string) => {
      const { results } = isExecutiveUnit
        ? await servicesPerimeters.getPerimeters({ practitionerId, search: searchInput })
        : await servicesPerimeters.getRights({ practitionerId, search: searchInput })
      return results
    },
    [isExecutiveUnit, practitionerId]
  )

  const { fetchStatus: baseLevelsFetchStatus, response: baseLevelsResponse } = useFetch(fetchBaseTree)

  const {
    hierarchy,
    selectedCodes,
    loadingStatus,
    search,
    expandHierarchy,
    selectHierarchyCodes,
    deleteHierarchyCode
  } = useHierarchy(baseLevelsResponse.results, fetchChildren, selectedIds)

  return (
    <Grid container direction="column" wrap="nowrap" height="100%" overflow="hidden">
      <Grid style={{ width: '30%', margin: '8px 8px 8px 70%' }}>
        <SearchInput
          value={options.searchInput}
          placeholder={'Rechercher'}
          onchange={(newValue) => search(newValue, () => fetchSearch(newValue))}
        />
      </Grid>

      <Grid container direction="column" wrap="wrap" height="100%" overflow="auto">
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
            <Table>
              <TableHead>
                <TableRow className={classes.tableHead}>
                  <TableCell className={classes.emptyTableHeadCell}></TableCell>
                  <TableCell align="center" className={classes.emptyTableHeadCell}>
                    <Checkbox
                      color="secondary"
                      indeterminateIcon={<IndeterminateCheckBoxOutlined style={{ color: 'rgba(0,0,0,0.6)' }} />}
                    />
                  </TableCell>
                  <TableCell align="left" className={classes.tableHeadCell}>
                    Nom
                  </TableCell>

                  <TableCell align="center" className={classes.tableHeadCell}>
                    Nombre de patients
                  </TableCell>

                  <TableCell align="center" className={classes.tableHeadCell}>
                    {!!executiveUnitType ? 'Type' : 'Accès'}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {baseLevelsFetchStatus === LoadingStatus.SUCCESS &&
                  loadingStatus === LoadingStatus.SUCCESS &&
                  baseLevelsResponse.count && (
                    <ScopeTreeTest hierarchy={hierarchy} onExpand={expandHierarchy} onSelect={selectHierarchyCodes} />
                  )}
                {baseLevelsFetchStatus === LoadingStatus.SUCCESS && !baseLevelsResponse.count && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography className={classes.loadingSpinnerContainer}>Aucun résultat à afficher</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {baseLevelsFetchStatus === LoadingStatus.FETCHING ||
            (loadingStatus === LoadingStatus.FETCHING && (
              <Grid container justifyContent="center" alignContent="center" height={500}>
                <CircularProgress />
              </Grid>
            ))}

          {/*<Pagination
          // className={classes.pagination}
          count={Math.ceil((count ?? 0) / 100)}
          shape="circular"
          onChange={(event, page: number) => onChangePage(page)}
          page={options.page}
        />*/}

          {/*searchInput ? (
        <ScopeTreeSearch
          searchInput={searchInput}
          selectedItems={fixSelectedItems}
          setSelectedItems={setSelectedItems}
          searchSavedRootRows={searchSavedRootRows}
          setSearchSavedRootRows={setSearchSavedRootRows}
          executiveUnitType={executiveUnitType}
          isSelectionLoading={isSelectionLoading}
          setIsSelectionLoading={setIsSelectionLoading}
        />
        ) : (

        )}
        */}

          <Grid item style={{ backgroundColor: '#E6F1FD' }} padding="20px 40px" alignSelf="bottom">
            <SelectedCodes values={selectedCodes} onDelete={deleteHierarchyCode} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
export default Index
