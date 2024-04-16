import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import {
  Checkbox,
  CircularProgress,
  Grid,
  LinearProgress,
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
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { AppDispatch, useAppDispatch, useAppSelector } from 'state'
import { ScopeTreeRow } from 'types'
import { getCurrentScopeList } from 'utils/scopeTree'
import ScopeTreeHierarchy from '../ScopeTreeHierarchy'
import EnhancedTable from '../ScopeTreeTable'
import { ScopeTreeExplorationProps } from '../index'
import {
  getHeadCells,
  init,
  isSearchIndeterminate,
  isSearchSelected,
  onExpand,
  onExplorationSelectAll,
  onSearchSelect
} from '../utils/scopeTreeUtils'
import useStyles from '../utils/styles'

const Index = (props: ScopeTreeExplorationProps) => {
  const {
    selectedItems,
    setSelectedItems,
    searchSavedRootRows,
    executiveUnitType,
    isSelectionLoading,
    setIsSelectionLoading
  } = props

  const { classes } = useStyles()
  const dispatch: AppDispatch = useAppDispatch()

  const scopeState = useAppSelector((state) => state.scope || {})
  const isExecutiveUnit: boolean = !!executiveUnitType ?? false
  const scopesList: ScopeTreeRow[] = getCurrentScopeList(scopeState.scopesList, isExecutiveUnit) ?? []
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>(scopesList)
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false)
  //const [page, setPage] = useState(1)
  //const [count, setCount] = useState(0)
  const [isEmpty, setIsEmpty] = useState<boolean>(!rootRows || rootRows.length === 0)
  const [open, setOpen] = useState<number[]>([])

  const isHeadChecked: boolean = rootRows.length > 0 && rootRows.every((item) => isSearchSelected(item, selectedItems))
  const isHeadIndeterminate: boolean =
    !isHeadChecked && rootRows.length > 0 && !!rootRows.find((item) => isSearchIndeterminate(item, selectedItems))

  const controllerRef: React.MutableRefObject<AbortController | null> = useRef<AbortController | null>(null)

  const headCheckbox: ReactElement = (
    <div style={{ padding: '0 0 0 4px' }}>
      <Checkbox
        color="secondary"
        checked={isHeadChecked}
        indeterminate={isHeadIndeterminate}
        indeterminateIcon={<IndeterminateCheckBoxOutlined />}
        onClick={() =>
          onExplorationSelectAll(rootRows, setSelectedItems, isHeadChecked, isSelectionLoading, setIsSelectionLoading)
        }
      />
    </div>
  )
  const headCells = getHeadCells(headCheckbox, executiveUnitType)

  /*useEffect(() => {
    init(
      setIsSearchLoading,
      controllerRef,
      rootRows,
      setRootRows,
      setOpen,
      setCount,
      setIsEmpty,
      dispatch,
      executiveUnitType,
      !!executiveUnitType
    )
  }, [])*/

  return (
    <div className={classes.container}>
      {!isSearchLoading && <div className={classes.linearProgress}>{isSelectionLoading && <LinearProgress />}</div>}
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
                  return (
                    <ScopeTreeHierarchy
                      row={row}
                      level={0}
                      parentAccess={row.access ?? '-'}
                      openPopulation={open}
                      labelId={`enhanced-table-checkbox-${index}`}
                      onExpand={(rowId: number) =>
                        onExpand(
                          rowId,
                          controllerRef,
                          open,
                          setOpen,
                          rootRows,
                          setRootRows,
                          selectedItems,
                          dispatch,
                          executiveUnitType,
                          !!executiveUnitType
                        )
                      }
                      onSelect={(row: ScopeTreeRow) =>
                        onSearchSelect(
                          row,
                          selectedItems,
                          searchSavedRootRows,
                          scopesList,
                          isSelectionLoading,
                          setIsSelectionLoading,
                          setSelectedItems,
                          undefined,
                          !!executiveUnitType
                        )
                      }
                      isIndeterminate={(row: ScopeTreeRow) => isSearchIndeterminate(row, selectedItems)}
                      isSelected={(row: ScopeTreeRow) => isSearchSelected(row, selectedItems)}
                      executiveUnitType={executiveUnitType}
                    />
                  )
                }}
              </EnhancedTable>
              {}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Index
