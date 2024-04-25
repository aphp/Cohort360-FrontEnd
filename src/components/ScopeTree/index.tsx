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
import { DisplayMode, useHierarchy } from '../../hooks/hierarchy/useHierarchy'
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

  const { options, totalPageNumber, onChangeSearchInput, onChangePage } = useSearchParameters(20, 0)

  const handleFetch = useCallback(() => {
    return isExecutiveUnit
      ? servicesPerimeters.getPerimeters({ practitionerId, search: options.searchInput })
      : servicesPerimeters.getRights({ practitionerId, search: options.searchInput })
  }, [isExecutiveUnit, practitionerId, options.searchInput])

  const handleFetchChildren = useCallback(
    async (ids: string) => {
      const { results } = isExecutiveUnit
        ? await servicesPerimeters.getPerimeters({ practitionerId, ids, limit: -1 })
        : await servicesPerimeters.getRights({ practitionerId, ids, limit: -1 })
      return results
    },
    [isExecutiveUnit, practitionerId]
  )

  const hierarchyDisplayMode = useMemo(() => {
    return options.searchInput ? DisplayMode.SEARCH : DisplayMode.TREE
  }, [options.searchInput])

  const {
    fetchStatus,
    response: { count, results }
  } = useFetch(options, handleFetch)

  const { hierarchy, selectedCodes, loadingStatus, expandHierarchy, selectHierarchyCodes, deleteHierarchyCode } =
    useHierarchy(results, handleFetchChildren, hierarchyDisplayMode, selectedIds)

  return (
    <Grid container alignContent="flex-start" height="100%">
      <Grid style={{ width: '25%', marginLeft: '75%', marginBottom: '10px' }}>
        <SearchInput
          value={options.searchInput}
          placeholder={'Rechercher'}
          onchange={(newValue) => onChangeSearchInput(newValue)}
        />
      </Grid>

      <Grid container height="90%" justifyContent="space-between">
        <TableContainer component={Paper}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell className={classes.emptyTableHeadCell}></TableCell>
                <TableCell align="center" className={classes.emptyTableHeadCell}>
                  <Checkbox color="secondary" indeterminateIcon={<IndeterminateCheckBoxOutlined />} />
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
              {fetchStatus === LoadingStatus.SUCCESS && loadingStatus === LoadingStatus.SUCCESS && count && (
                <ScopeTreeTest hierarchy={hierarchy} onExpand={expandHierarchy} onSelect={selectHierarchyCodes} />
              )}
              {fetchStatus === LoadingStatus.SUCCESS && !count && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography className={classes.loadingSpinnerContainer}>Aucun résultat à afficher</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {(fetchStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.FETCHING) && (
          <Grid container justifyContent="center" alignContent="center" height={500}>
            <CircularProgress />
          </Grid>
        )}

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

        <Grid item xs={12} style={{ backgroundColor: '#E6F1FD', height: '12vh' }} padding="20px 40px 0px 40px">
          <SelectedCodes values={selectedCodes} onDelete={deleteHierarchyCode} />
        </Grid>
      </Grid>
    </Grid>
  )
}
export default Index
