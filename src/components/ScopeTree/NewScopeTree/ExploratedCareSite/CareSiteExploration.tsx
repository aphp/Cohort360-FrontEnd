import React, { useRef, useState } from 'react'
import { ScopeTreeRow } from 'types'
import {
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import EnhancedTable from '../../ScopeTreeTable'
import useStyles from '../CareSiteCommons/styles'
import { useAppDispatch, useAppSelector } from 'state'
import {
  displayCareSiteRow,
  getHeadCells,
  isIndeterminated,
  isSelected,
  onExpand,
  onSelect,
  onSelectAll
} from '../CareSiteCommons/ScopeTreeUtils'
import { ScopeState } from 'state/scope'

type ExploratedCareSiteProps = {
  selectedItems: ScopeTreeRow[]
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  isSearchLoading: boolean
  setIsSearchLoading: (isSearchLoading: boolean) => void
}
const CareSiteExploration = (props: ExploratedCareSiteProps) => {
  const { selectedItems, setSelectedItems, isSearchLoading, setIsSearchLoading } = props

  const classes = useStyles()
  const dispatch = useAppDispatch()

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))
  const { scopesList = [] } = scopeState
  const [openPopulation, setOpenPopulations] = useState<any[]>(scopeState.openPopulation)
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>(scopesList)
  const [isEmpty, setIsEmpty] = useState<boolean>(false)
  const [isAllSelected, setIsAllSelected] = useState(false)
  const isHeadChecked: boolean =
    isAllSelected ||
    scopesList.filter((row) => selectedItems.find((item: { id: any }) => item.id === row.id) !== undefined).length ===
      scopesList.length
  const isHeadIndetermined: boolean =
    !isAllSelected && selectedItems && selectedItems.length > 0 && rootRows && !isHeadChecked
  const controllerRef = useRef<AbortController | null>()

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
                {(row: any, index: number) => {
                  if (!row) return <></>
                  const labelId = `enhanced-table-checkbox-${index}`

                  return displayCareSiteRow(
                    row,
                    0,
                    row.access,
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
            </>
          )}
        </>
      )}
    </div>
  )
}

export default CareSiteExploration
