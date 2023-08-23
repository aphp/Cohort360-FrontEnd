import React, { useEffect, useRef, useState } from 'react'
import { CircularProgress, Grid, Pagination } from '@mui/material'
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
} from '../commons/scopeTreeUtils'
import useStyles from '../commons/styles'
import { useAppDispatch, useAppSelector } from 'state'
import { ScopeState } from 'state/scope'
import { ScopeTreeRow } from 'types'
import { CareSiteSearchProps } from '../index'

const Index: React.FC<CareSiteSearchProps> = (props) => {
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
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>([])
  const controllerRef = useRef<AbortController | null>(null)
  const [isEmpty, setIsEmpty] = useState<boolean>(true)
  const debouncedSearchTerm = useDebounce(700, searchInput)
  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false)
  const searchSelectedItems = rootRows.filter((item) => selectedItems.map(({ id }) => id).includes(item.id))

  const isHeadChecked: boolean =
    rootRows
      .map((rootRow) => rootRow.id)
      .every((rootRowId) => searchSelectedItems.map((selected) => selected.id).includes(rootRowId)) &&
    rootRows.length > 0
  const isHeadIndeterminate: boolean = rootRows?.length > 0 && !isHeadChecked && searchSelectedItems?.length > 0

  const headCells = getHeadCells(
    isHeadChecked,
    isHeadIndeterminate,
    () => onSelectAll(rootRows, selectedItems, setSelectedItems),
    executiveUnitType
  )

  const search = async () =>
    await searchInPerimeters(
      debouncedSearchTerm,
      page,
      controllerRef,
      setIsSearchLoading,
      setIsEmpty,
      setCount,
      scopesList,
      setRootRows,
      setOpenPopulations,
      dispatch,
      executiveUnitType
    )

  useEffect(() => {
    let delayTimer: string | number | NodeJS.Timeout | undefined = undefined
    if (debouncedSearchTerm) {
      delayTimer = setTimeout(search, 600)
    } else {
      setRootRows([])
    }
    return () => {
      controllerRef.current?.abort()
      clearTimeout(delayTimer)
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    if (debouncedSearchTerm) {
      search()
    }
  }, [page])

  return (
    <div className={classes.container}>
      {isSearchLoading ? (
        <Grid container justifyContent="center">
          <CircularProgress size={50} />
        </Grid>
      ) : (
        <>
          {!debouncedSearchTerm || isEmpty ? (
            <EnhancedTable
              noCheckbox
              noPagination
              rows={rootRows}
              headCells={headCells}
              emptyRowsMessage={'Aucun résultat à afficher'}
            />
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
                    (row: ScopeTreeRow) => onSelect(row, selectedItems, setSelectedItems, rootRows),
                    (row: ScopeTreeRow) => isIndeterminated(row, selectedItems),
                    (row: ScopeTreeRow) => isSelected(row, selectedItems, scopesList),
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
