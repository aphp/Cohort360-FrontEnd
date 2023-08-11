import React, { useEffect, useRef, useState } from 'react'
import {
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
import { useDebounce } from 'utils/debounce'
import EnhancedTable from '../../ScopeTree/ScopeTreeTable'
import {
  displayCareSiteSearchResultRow,
  getHeadCells,
  isIndeterminated,
  isSelected,
  onExpand,
  onSelect,
  onSelectAll,
  searchInPerimeters
} from '../Commons/ScopeTreeUtils'
import useStyles from '../Commons/styles'
import { useAppDispatch, useAppSelector } from 'state'
import { ScopeState } from 'state/scope'
import { ScopeTreeRow } from 'types'
import { CareSiteSearchProps } from '../NewScopeTree'

const CareSiteSearch = (props: CareSiteSearchProps) => {
  const { searchInput, selectedItems, setSelectedItems, executiveUnitType } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))

  const { scopesList = [] } = scopeState
  const [openPopulation, setOpenPopulations] = useState<number[]>(scopeState.openPopulation)
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>(scopesList)
  const controllerRef = useRef<AbortController | null>(null)
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [isEmpty, setIsEmpty] = useState<boolean>(false)
  const debouncedSearchTerm = useDebounce(500, searchInput)
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false)

  const isHeadChecked: boolean =
    isAllSelected ||
    scopesList.filter((row) => selectedItems.find((item) => item.id === row.id) !== undefined).length ===
      scopesList.length
  const isHeadIndetermined: boolean =
    !isAllSelected && selectedItems && selectedItems.length > 0 && rootRows && !isHeadChecked

  useEffect(() => {
    if (debouncedSearchTerm) {
      setSelectedItems([])
      setIsAllSelected(false)
      searchInPerimeters(
        searchInput,
        page,
        controllerRef,
        setIsSearchLoading,
        setIsEmpty,
        setCount,
        setRootRows,
        selectedItems,
        setSelectedItems,
        setOpenPopulations,
        false,
        executiveUnitType
      )
    }
    return () => {
      controllerRef.current?.abort()
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchInPerimeters(
        searchInput,
        page,
        controllerRef,
        setIsSearchLoading,
        setIsEmpty,
        setCount,
        setRootRows,
        selectedItems,
        setSelectedItems,
        setOpenPopulations,
        isAllSelected,
        executiveUnitType
      )
    }
  }, [page])

  useEffect(() => {
    if (!scopeState.aborted) {
      setRootRows(scopesList)
    }
  }, [scopesList])

  const headCells = getHeadCells(
    isHeadChecked,
    isHeadIndetermined,
    () => onSelectAll(isAllSelected, setIsAllSelected, rootRows, selectedItems, setSelectedItems),
    executiveUnitType
  )

  return (
    <div className={classes.container}>
      {isSearchLoading ? (
        <Grid container justifyContent="center">
          <CircularProgress size={50} />
        </Grid>
      ) : (
        <>
          {isEmpty ? (
            <TableContainer component={Paper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow className={classes.tableHead}>
                    <TableCell align="center" className={classes.tableHeadCell} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography className={classes.loadingSpinnerContainer}>Aucun résultat à afficher</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <>
              <EnhancedTable noCheckbox noPagination rows={rootRows} headCells={headCells}>
                {(row: ScopeTreeRow, index: number) => {
                  if (!row) return <></>
                  const labelId = `enhanced-table-checkbox-${index}`

                  return displayCareSiteSearchResultRow(
                    row,
                    0,
                    row.access ?? '-',
                    selectedItems,
                    rootRows,
                    openPopulation,
                    labelId,
                    (rowId: number) =>
                      onExpand(
                        rowId,
                        controllerRef,
                        openPopulation,
                        setOpenPopulations,
                        rootRows,
                        setRootRows,
                        selectedItems,
                        dispatch,
                        executiveUnitType
                      ),
                    (row: ScopeTreeRow) => onSelect(row, selectedItems, setSelectedItems, scopesList),
                    (row: ScopeTreeRow) => isIndeterminated(row, selectedItems),
                    (row: ScopeTreeRow) => isSelected(row, selectedItems, rootRows),
                    executiveUnitType
                  )
                }}
              </EnhancedTable>
              {
                <Pagination
                  className={classes.pagination}
                  count={Math.ceil((count ?? 0) / 100)}
                  shape="circular"
                  onChange={(event, page: number) => setPage && setPage(page)}
                  page={page}
                />
              }
            </>
          )}
        </>
      )}
    </div>
  )
}

export default CareSiteSearch
