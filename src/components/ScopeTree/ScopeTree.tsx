import React, { useEffect, useRef, useState } from 'react'

import {
  Breadcrumbs,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core'

import Skeleton from '@material-ui/lab/Skeleton'
import KeyboardArrowRightIcon from '@material-ui/icons/ChevronRight'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import EnhancedTable from 'components/ScopeTree/ScopeTreeTable'
import { ScopeTreeRow, TreeElement } from 'types'

import { useAppDispatch, useAppSelector } from 'state'
import { expandScopeElement, fetchScopesList, ScopeState } from 'state/scope'

import displayDigit from 'utils/displayDigit'
import { useDebounce } from 'utils/debounce'

import useStyles from './styles'
import { findEquivalentRowInItemAndSubItems, getSelectedPmsi } from 'utils/pmsi'
import { Pagination } from '@material-ui/lab'
import servicesPerimeters from '../../services/aphp/servicePerimeters'
import { findSelectedInListAndSubItems } from '../../utils/cohortCreation'

type ScopeTreeListItemProps = {
  row: any
  level: number
  parentAccess: string
  selectedItems: ScopeTreeRow[]
  rootRows: ScopeTreeRow[]
  openPopulation: ScopeTreeRow[]
  debouncedSearchTerm: string | undefined
  labelId: string
  onExpand: (rowId: number) => void
  onSelect: (row: ScopeTreeRow) => void
  isIndeterminated: (row: any) => boolean | undefined
  isSelected: (searchedItem: TreeElement, selectedItems: ScopeTreeRow[], allItems: ScopeTreeRow[]) => boolean
}

const ScopeTreeListItem: React.FC<ScopeTreeListItemProps> = (props) => {
  const {
    row,
    level,
    parentAccess,
    selectedItems,
    rootRows,
    openPopulation,
    debouncedSearchTerm,
    labelId,
    onExpand,
    onSelect,
    isIndeterminated,
    isSelected
  } = props

  const classes = useStyles()

  return (
    <>
      {row.id === 'loading' ? (
        <TableRow hover key={Math.random()}>
          <TableCell colSpan={5}>
            <Skeleton animation="wave" />
          </TableCell>
        </TableRow>
      ) : (
        <TableRow
          hover
          key={row.id}
          classes={{
            root: level % 2 === 0 ? classes.mainRow : classes.secondRow
          }}
        >
          <TableCell>
            {row.subItems && row.subItems.length > 0 && (
              <IconButton
                onClick={() => onExpand(row.id)}
                style={{ marginLeft: level * 35, padding: 0, marginRight: -30 }}
              >
                {openPopulation.find((id) => row.id === id) ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
              </IconButton>
            )}
          </TableCell>

          <TableCell align="center" padding="checkbox">
            <Checkbox
              color="secondary"
              onClick={() => {
                onSelect(row)
              }}
              indeterminate={isIndeterminated(row)}
              checked={isSelected(row, selectedItems, rootRows) ? true : false}
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </TableCell>

          <TableCell>
            {debouncedSearchTerm && row.name ? (
              <Breadcrumbs maxItems={2}>
                {(row.name.split('/').length > 1 ? row.name.split('/').slice(1) : row.name.split('/').slice(0)).map(
                  (name: any, index: number) => (
                    <Typography key={index} style={{ color: '#153D8A' }}>
                      {name}
                    </Typography>
                  )
                )}
              </Breadcrumbs>
            ) : (
              <Typography>{row.name}</Typography>
            )}
          </TableCell>

          <TableCell align="center" style={{ cursor: 'pointer' }} onClick={() => onSelect(row)}>
            <Typography>{displayDigit(row.quantity)}</Typography>
          </TableCell>

          <TableCell align="center" style={{ cursor: 'pointer' }} onClick={() => onSelect(row)}>
            <Typography>{row.access ?? parentAccess}</Typography>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

type ScopeTreeProps = {
  defaultSelectedItems: ScopeTreeRow[]
  onChangeSelectedItem: (selectedItems: ScopeTreeRow[]) => void
  searchInput?: string
}

const ScopeTree: React.FC<ScopeTreeProps> = ({ defaultSelectedItems, onChangeSelectedItem, searchInput }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const [isEmpty, setIsEmpty] = useState<boolean>(false)

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))

  const { scopesList = [] } = scopeState
  const [openPopulation, setOpenPopulations] = useState<any[]>(scopeState.openPopulation)
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>(scopesList)
  const [selectedItems, setSelectedItem] = useState<any>(
    defaultSelectedItems.map((item) => findEquivalentRowInItemAndSubItems(item, rootRows).equivalentRow ?? item)
  )
  const debouncedSearchTerm = useDebounce(700, searchInput)
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [isAllSelected, setIsAllSelected] = useState(false)
  const controllerRef = useRef<AbortController | null>()

  const fetchScopeTree = async () => {
    dispatch<any>(fetchScopesList())
  }

  const _init = async () => {
    setSearchLoading(true)
    await fetchScopeTree()
    setRootRows(scopesList)
    setOpenPopulations([])
    setCount(scopesList?.length)
    setSearchLoading(false)
    setIsEmpty(false)
  }

  const _searchInPerimeters = async (_isAllSelected?: boolean) => {
    setSearchLoading(true)
    if (controllerRef.current) {
      controllerRef.current.abort()
    }
    const controller = new AbortController()
    controllerRef.current = controller
    const {
      scopeTreeRows: newPerimetersList,
      count: newCount,
      aborted: aborted
    } = await servicesPerimeters.findScope(searchInput, page, controllerRef.current?.signal)
    if (!aborted) {
      if (!newPerimetersList || newPerimetersList.length < 1) {
        setIsEmpty(true)
      } else {
        setIsEmpty(false)
      }
      if (_isAllSelected) {
        const _newSelectedItems = [...selectedItems, ...newPerimetersList]
        onChangeSelectedItem(_newSelectedItems)
      }
      setRootRows(newPerimetersList)
      setOpenPopulations([])
      setCount(newCount)
      setSearchLoading(false)
    }
    controllerRef.current = null
    return newPerimetersList
  }

  /**
   * This function is called when a user click on chevron
   *
   */
  const _onExpand = async (rowId: number) => {
    const controller = controllerRef.current ?? new AbortController()
    controllerRef.current = controller
    let _openPopulation = openPopulation ? openPopulation : []
    let _rootRows = rootRows ? [...rootRows] : []
    const index = _openPopulation.indexOf(rowId)

    if (index !== -1) {
      _openPopulation = _openPopulation.filter((perimeter_id) => perimeter_id !== rowId)
      setOpenPopulations(_openPopulation)
    } else {
      _openPopulation = [..._openPopulation, rowId]
      setOpenPopulations(_openPopulation)
    }
    const expandResponse = await dispatch<any>(
      expandScopeElement({
        rowId: rowId,
        selectedItems: selectedItems,
        scopesList: _rootRows,
        openPopulation: openPopulation,
        signal: controllerRef.current?.signal
      })
    )
    if (expandResponse && expandResponse.payload) {
      if (!expandResponse.payload.aborted) {
        const _selectedItems = expandResponse.payload.selectedItems ?? []
        _rootRows = expandResponse.payload.rootRows ?? _rootRows
        setRootRows(_rootRows)
        onChangeSelectedItem(_selectedItems)
      }
    }
  }

  /**
   * This function is called when a user click on checkbox
   *
   */
  const isSelected = (searchedItem: TreeElement, selectedItems: TreeElement[], allItems: TreeElement[] = rootRows) => {
    selectedItems = selectedItems.map(
      (item) => findEquivalentRowInItemAndSubItems(item, allItems).equivalentRow ?? item
    )
    return findSelectedInListAndSubItems(selectedItems, searchedItem, allItems)
  }
  const _onSelect = (row: ScopeTreeRow) => {
    const savedSelectedItems: any[] = getSelectedPmsi(row, selectedItems, scopesList)

    onChangeSelectedItem(savedSelectedItems)
    return savedSelectedItems
  }

  const _onSelectAll = () => {
    let results: any[] = []
    const newIsAllSelected = !isAllSelected
    setIsAllSelected(newIsAllSelected)
    if (debouncedSearchTerm) {
      if (newIsAllSelected) {
        results = rootRows
      } else {
        results = []
      }
    } else if (
      scopesList.filter((row) => selectedItems.find((item: { id: any }) => item.id === row.id) !== undefined).length ===
      scopesList.length
    ) {
      results = []
    } else {
      for (const rootRow of scopesList) {
        const rowsAndChildren = _onSelect(rootRow)
        results = [...results, ...rowsAndChildren]
      }
    }
    onChangeSelectedItem(results)
  }

  const _isIndeterminated: (_row: any) => boolean | undefined = (_row) => {
    // Si que un loading => false
    if (_row.subItems && _row.subItems.length > 0 && _row.subItems[0].id === 'loading') {
      return false
    }
    const checkChild: (item: any) => boolean = (item) => {
      const numberOfSubItemsSelected = item.subItems?.filter((subItem: any) =>
        selectedItems.find((item: { id: any }) => item.id === subItem.id)
      )?.length

      if (numberOfSubItemsSelected && numberOfSubItemsSelected !== item.subItems.length) {
        // Si un des sub elem qui est check => true
        return true
      } else if (item.subItems?.length >= numberOfSubItemsSelected) {
        // Si un des sub-sub (ou sub-sub-sub ...) elem qui est check => true
        let isCheck = false
        for (const child of item.subItems) {
          if (isCheck) continue
          isCheck = !!checkChild(child)
        }
        return isCheck
      } else {
        // Sinon => false
        return false
      }
    }
    return checkChild(_row)
  }

  useEffect(() => {
    if (debouncedSearchTerm) {
      onChangeSelectedItem([])
      setIsAllSelected(false)
      _searchInPerimeters(false)
    } else if (!debouncedSearchTerm) {
      _init()
    }
    return () => {
      controllerRef.current?.abort()
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    if (debouncedSearchTerm) {
      _searchInPerimeters(isAllSelected)
    }
  }, [page])

  useEffect(() => {
    const _selectedItems: TreeElement[] = defaultSelectedItems.map(
      (item) => findEquivalentRowInItemAndSubItems(item, rootRows).equivalentRow ?? item
    )
    setSelectedItem(_selectedItems)
  }, [defaultSelectedItems])

  useEffect(() => {
    if (!scopeState.aborted) {
      setRootRows(scopesList)
    }
  }, [scopesList])

  const headCells = [
    { id: '', align: 'left', disablePadding: true, disableOrderBy: true, label: '' },
    {
      id: '',
      align: 'left',
      disablePadding: true,
      disableOrderBy: true,
      label: (
        <div style={{ padding: '0 0 0 4px' }}>
          <Checkbox
            color="secondary"
            indeterminate={
              !isAllSelected &&
              selectedItems &&
              selectedItems.length > 0 &&
              rootRows &&
              selectedItems.length !== rootRows.length
            }
            checked={
              isAllSelected ||
              scopesList.filter((row) => selectedItems.find((item: { id: any }) => item.id === row.id) !== undefined)
                .length === scopesList.length
            }
            onClick={_onSelectAll}
          />
        </div>
      )
    },
    { id: 'name', align: 'left', disablePadding: false, disableOrderBy: true, label: 'Nom' },
    { id: 'quantity', align: 'center', disablePadding: false, disableOrderBy: true, label: 'Nombre de patients' },
    { id: 'deidentified', align: 'center', disablePadding: false, disableOrderBy: true, label: 'Accès' }
  ]

  return (
    <div className={classes.container}>
      {searchLoading ? (
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

                  const _displayChildren = (_row: any, level: number, parentAccess: string) => {
                    return (
                      <React.Fragment key={Math.random()}>
                        <ScopeTreeListItem
                          row={_row}
                          level={level}
                          parentAccess={parentAccess}
                          selectedItems={selectedItems}
                          rootRows={rootRows}
                          openPopulation={openPopulation}
                          debouncedSearchTerm={debouncedSearchTerm as string}
                          labelId={labelId}
                          onExpand={_onExpand}
                          onSelect={_onSelect}
                          isIndeterminated={_isIndeterminated}
                          isSelected={isSelected}
                        />
                        {openPopulation.find((id) => _row.id === id) &&
                          _row.subItems &&
                          _row.subItems.map((subItem: any) => _displayChildren(subItem, level + 1, parentAccess))}
                      </React.Fragment>
                    )
                  }

                  return (
                    <React.Fragment key={Math.random()}>
                      <ScopeTreeListItem
                        row={row}
                        level={0}
                        parentAccess={row.access}
                        selectedItems={selectedItems}
                        rootRows={rootRows}
                        openPopulation={openPopulation}
                        debouncedSearchTerm={debouncedSearchTerm as string}
                        labelId={labelId}
                        onExpand={_onExpand}
                        onSelect={_onSelect}
                        isIndeterminated={_isIndeterminated}
                        isSelected={isSelected}
                      />
                      {openPopulation.find((id) => row.id === id) &&
                        row.subItems &&
                        row.subItems.map((subItem: any) => {
                          return _displayChildren(subItem, 1, row.access)
                        })}
                    </React.Fragment>
                  )
                }}
              </EnhancedTable>
            </>
          )}
          <Pagination
            className={classes.pagination}
            count={Math.ceil((count ?? 0) / 100)}
            shape="rounded"
            onChange={(event, page: number) => setPage && setPage(page)}
            page={page}
          />
        </>
      )}
    </div>
  )
}

export default ScopeTree
