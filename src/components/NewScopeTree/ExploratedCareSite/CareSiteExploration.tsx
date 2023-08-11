import React, { useEffect, useRef, useState } from 'react'
import { ScopeTreeRow, ScopeType, TreeElement } from 'types'
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
import useStyles from '../Commons/styles'
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
} from '../Commons/ScopeTreeUtils'
import { ScopeState } from 'state/scope'
import { findEquivalentRowInItemAndSubItems } from '../../../utils/pmsi'

type ExploratedCareSiteProps = {
  selectedItems: ScopeTreeRow[]
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  openPopulation: number[]
  setOpenPopulations: (openPopulation: number[]) => void
  executiveUnitType?: ScopeType
}
const CareSiteExploration = (props: ExploratedCareSiteProps) => {
  const { selectedItems, setSelectedItems, openPopulation, setOpenPopulations, executiveUnitType } = props

  const { classes } = useStyles()
  const dispatch: AppDispatch = useAppDispatch()

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))
  const { scopesList = [] } = scopeState
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>(scopesList)
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false)
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [isEmpty, setIsEmpty] = useState<boolean>(!rootRows || rootRows.length === 0)

  const isHeadChecked: boolean =
    isAllSelected ||
    scopesList.filter((row) => selectedItems.find((item: { id: string }) => item.id === row.id) !== undefined)
      .length === scopesList.length
  const isHeadIndetermined: boolean =
    !isAllSelected && selectedItems && selectedItems.length > 0 && rootRows && !isHeadChecked
  const controllerRef = useRef<AbortController | null>(null)

  const headCells = getHeadCells(
    isHeadChecked,
    isHeadIndetermined,
    () => onSelectAll(isAllSelected, setIsAllSelected, scopesList, selectedItems, setSelectedItems),
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

export default CareSiteExploration
