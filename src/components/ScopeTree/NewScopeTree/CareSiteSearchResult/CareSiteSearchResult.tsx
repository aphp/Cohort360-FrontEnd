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
import EnhancedTable from '../../ScopeTreeTable'
import {
  displayCareSiteSearchResultRow,
  getHeadCells,
  isIndeterminated,
  isSelected,
  onExpand,
  onSelect,
  onSelectAll,
  searchInPerimeters
} from '../CareSiteCommons/ScopeTreeUtils'
import useStyles from '../CareSiteCommons/styles'
import { useAppDispatch, useAppSelector } from 'state'
import { ScopeState } from 'state/scope'
import { ScopeTreeRow } from 'types'

type CareSiteSearchResultProps = {
  searchInput: string
  selectedItems: ScopeTreeRow[]
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  isSearchLoading: boolean
  setIsSearchLoading: (isSearchLoading: boolean) => void
}

const CareSiteSearchResult = (props: CareSiteSearchResultProps) => {
  const { searchInput, selectedItems, setSelectedItems, isSearchLoading, setIsSearchLoading } = props
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))

  const { scopesList = [] } = scopeState
  const [openPopulation, setOpenPopulations] = useState<number[]>(scopeState.openPopulation)
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>(scopesList)

  const controllerRef = useRef<AbortController | null>()
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [isEmpty, setIsEmpty] = useState<boolean>(false)
  const debouncedSearchTerm = useDebounce(700, searchInput)
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
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
        false
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
        isAllSelected
      )
    }
  }, [page])

  useEffect(() => {
    if (!scopeState.aborted) {
      setRootRows(scopesList)
    }
  }, [scopesList])

  const headCells = getHeadCells(isHeadChecked, isHeadIndetermined, () =>
    onSelectAll(isAllSelected, setIsAllSelected, scopesList, selectedItems, setSelectedItems)
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
                        dispatch
                      ),
                    (row: ScopeTreeRow) => onSelect(row, selectedItems, setSelectedItems, scopesList),
                    (row: ScopeTreeRow) => isIndeterminated(row, selectedItems),
                    (row: ScopeTreeRow) => isSelected(row, selectedItems, rootRows)
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

export default CareSiteSearchResult
