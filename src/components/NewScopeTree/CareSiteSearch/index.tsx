import React, { useEffect, useRef, useState } from 'react'
import { CircularProgress, Grid, Pagination } from '@mui/material'
import { useDebounce } from 'utils/debounce'
import EnhancedTable from '../../ScopeTree/ScopeTreeTable'
import {
  displayCareSiteSearchResultRow,
  getHeadCells,
  isSearchIndeterminate,
  isSearchSelected,
  onExpand,
  onSearchSelect,
  onSelectAll,
  searchInPerimeters
} from '../commons/scopeTreeUtils'
import useStyles from '../commons/styles'
import { useAppDispatch, useAppSelector } from 'state'
import { ScopeState } from 'state/scope'
import { ScopeTreeRow } from 'types'
import { CareSiteSearchProps } from '../index'

const Index: React.FC<CareSiteSearchProps> = (props) => {
  const { searchInput, selectedItems, setSelectedItems, searchedRows, setSearchedRows, executiveUnitType } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))

  const { scopesList = [] } = scopeState
  const [openPopulation, setOpenPopulations] = useState<number[]>(scopeState.openPopulation)
  // const [searchedRows, setSearchedRows] = useState<ScopeTreeRow[]>([...scopesList])
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>([])
  const controllerRef = useRef<AbortController | null>(null)
  const [isEmpty, setIsEmpty] = useState<boolean>(true)
  const debouncedSearchTerm = useDebounce(700, searchInput)
  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false)
  // const searchSelectedItems = rootRows.filter((item) => selectedItems.map(({ id }) => id).includes(item.id))

  const isHeadChecked: boolean = rootRows.length > 0 && rootRows.every((item) => isSearchSelected(item, selectedItems))
  const isHeadIndeterminate: boolean =
    !isHeadChecked && rootRows.length > 0 && !!rootRows.find((item) => isSearchIndeterminate(item, selectedItems))

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
      setRootRows,
      searchedRows,
      setSearchedRows,
      setOpenPopulations,
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

  // useEffect(() => {
  //   if (debouncedSearchTerm) {
  //     search()
  //   }
  // }, [page])

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
                    (row: ScopeTreeRow) =>
                      onSearchSelect(row, selectedItems, setSelectedItems, searchedRows, scopesList),
                    (row: ScopeTreeRow) => isSearchIndeterminate(row, selectedItems),
                    (row: ScopeTreeRow) => isSearchSelected(row, selectedItems),
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
