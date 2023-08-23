import React, { useEffect, useRef, useState } from 'react'
import { ScopeTreeRow } from 'types'
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
import EnhancedTable from '../../ScopeTree/ScopeTreeTable'
import useStyles from '../commons/styles'
import { AppDispatch, useAppDispatch, useAppSelector } from 'state'
import {
  displayCareSiteExplorationRow,
  getHeadCells,
  init,
  isIndeterminated,
  isSelected,
  onExpand,
  onSelect,
  onSelectAll
} from '../commons/scopeTreeUtils'
import { ScopeState } from 'state/scope'
import { CareSiteExplorationProps } from '../index'

const Index = (props: CareSiteExplorationProps) => {
  const { selectedItems, setSelectedItems, executiveUnitType } = props

  const { classes } = useStyles()
  const dispatch: AppDispatch = useAppDispatch()

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))
  const { scopesList = [] } = scopeState
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>(scopesList)
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false)
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [isEmpty, setIsEmpty] = useState<boolean>(!rootRows || rootRows.length === 0)
  const [openPopulation, setOpenPopulations] = useState<number[]>([])

  const explorationSelectedItems = rootRows.filter((item) => selectedItems.map(({ id }) => id).includes(item.id))
  const isHeadChecked: boolean =
    rootRows
      .map((rootRow) => rootRow.id)
      .every((rootRowId) => explorationSelectedItems.map((selected) => selected.id).includes(rootRowId)) &&
    rootRows.length > 0
  const isHeadIndeterminate: boolean =
    (explorationSelectedItems?.length > 0 && rootRows?.length > 0 && !isHeadChecked) ||
    (!isHeadChecked && selectedItems?.length > 0)

  const controllerRef = useRef<AbortController | null>(null)

  const headCells = getHeadCells(
    isHeadChecked,
    isHeadIndeterminate,
    () => onSelectAll(scopesList, selectedItems, setSelectedItems),
    executiveUnitType
  )

  useEffect(() => {
    init(
      setIsSearchLoading,
      controllerRef,
      rootRows,
      setRootRows,
      setOpenPopulations,
      setCount,
      setIsEmpty,
      selectedItems,
      dispatch,
      executiveUnitType
    )
  }, [])

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

                  return displayCareSiteExplorationRow(
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

export default Index
