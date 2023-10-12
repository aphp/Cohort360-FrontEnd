import React, { useEffect, useRef, useState } from 'react'

import {
  Breadcrumbs,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  Pagination,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import KeyboardArrowRightIcon from '@mui/icons-material/ChevronRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import EnhancedTable from 'components/ScopeTree/ScopeTreeTable'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import { ScopeType, ScopeTreeRow, TreeElement } from 'types'

import { useAppDispatch, useAppSelector } from 'state'
import { expandScopeElement, fetchScopesList, ScopeState, updateScopeList } from 'state/scope'

import displayDigit from 'utils/displayDigit'
import { useDebounce } from 'utils/debounce'

import useStyles from './styles'
import {
  checkIfIndeterminated,
  findEquivalentRowInItemAndSubItems,
  getHierarchySelection,
  optimizeHierarchySelection
} from 'utils/pmsi'
import servicesPerimeters, { loadingItem } from '../../services/aphp/servicePerimeters'
import { findSelectedInListAndSubItems } from '../../utils/cohortCreation'
import { _cancelPendingRequest } from 'utils/abortController'

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
  executiveUnitType?: string
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
    isSelected,
    executiveUnitType
  } = props

  const { classes } = useStyles()

  return (
    <>
      {row.id === 'loading' ? (
        <TableRow hover key={Math.random()}>
          <TableCellWrapper align="left" colSpan={5}>
            <Skeleton animation="wave" />
          </TableCellWrapper>
        </TableRow>
      ) : (
        <TableRow
          hover
          key={row.id}
          classes={{
            root: level % 2 === 0 ? classes.mainRow : classes.secondRow
          }}
        >
          <TableCellWrapper align="left">
            {row.subItems && row.subItems.length > 0 && row.type !== executiveUnitType && (
              <IconButton
                onClick={() => onExpand(row.id)}
                style={{ marginLeft: level * 35, padding: 0, marginRight: -30 }}
              >
                {openPopulation.find((id) => row.id === id) ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
              </IconButton>
            )}
          </TableCellWrapper>

          <TableCellWrapper padding="checkbox">
            <Checkbox
              color="secondary"
              onClick={() => {
                onSelect(row)
              }}
              indeterminate={isIndeterminated(row)}
              checked={isSelected(row, selectedItems, rootRows) ? true : false}
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </TableCellWrapper>
          <TableCellWrapper align="left">
            {debouncedSearchTerm && row.full_path ? (
              <Breadcrumbs maxItems={2}>
                {(row.full_path.split('/').length > 1
                  ? row.full_path.split('/').slice(1)
                  : row.full_path.split('/').slice(0)
                ).map((full_path: any, index: number) => (
                  <Typography key={index} style={{ color: '#153D8A' }}>
                    {full_path}
                  </Typography>
                ))}
              </Breadcrumbs>
            ) : (
              <Typography>{row.name}</Typography>
            )}
          </TableCellWrapper>
          <TableCellWrapper style={{ cursor: 'pointer' }} onClick={() => onSelect(row)}>
            <Typography>{displayDigit(row.quantity)}</Typography>
          </TableCellWrapper>
          {executiveUnitType ? (
            <TableCellWrapper style={{ cursor: 'pointer' }} onClick={() => onSelect(row)}>
              <Typography>{row.type ?? '-'}</Typography>
            </TableCellWrapper>
          ) : (
            <TableCellWrapper style={{ cursor: 'pointer' }} onClick={() => onSelect(row)}>
              <Typography>{row.access ?? parentAccess}</Typography>
            </TableCellWrapper>
          )}
        </TableRow>
      )}
    </>
  )
}

type ScopeTreeProps = {
  defaultSelectedItems: ScopeTreeRow[]
  onChangeSelectedItem: (selectedItems: ScopeTreeRow[]) => void
  searchInput: string
  executiveUnitType?: ScopeType
}

const ScopeTree: React.FC<ScopeTreeProps> = ({
  defaultSelectedItems,
  onChangeSelectedItem,
  searchInput,
  executiveUnitType
}) => {
  const { classes } = useStyles()
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
  const controllerRef = useRef<AbortController | null>(null)
  const isHeadChecked: boolean =
    isAllSelected ||
    scopesList.filter((row) => selectedItems.find((item: { id: any }) => item.id === row.id) !== undefined).length ===
      scopesList.length
  const isHeadIndetermined: boolean =
    !isAllSelected && selectedItems && selectedItems.length > 0 && rootRows && !isHeadChecked

  const fetchScopeTree = async (executiveUnitType?: ScopeType, signal?: AbortSignal) => {
    return dispatch(fetchScopesList({ signal, type: executiveUnitType })).unwrap()
  }

  const _init = async () => {
    setSearchLoading(true)
    controllerRef.current = _cancelPendingRequest(controllerRef.current)

    let newPerimetersList: ScopeTreeRow[] = []
    const fetchScopeTreeResponse = await fetchScopeTree(executiveUnitType, controllerRef.current?.signal)
    if (fetchScopeTreeResponse && !fetchScopeTreeResponse.aborted) {
      newPerimetersList = fetchScopeTreeResponse.scopesList
      setRootRows(newPerimetersList)
      setOpenPopulations([])
      setCount(newPerimetersList?.length)
      setIsEmpty(!newPerimetersList || newPerimetersList.length < 0)
    }
    await _expandSelectedItems(newPerimetersList ?? rootRows)
    setSearchLoading(false)
  }

  const getFetchedSelectedItems = (selectedItems: ScopeTreeRow[], rootRows: ScopeTreeRow[]) => {
    const fetchedSelectedItems: ScopeTreeRow[] = []
    const notFetchedSelectedItemsIds: string[] = []
    selectedItems.forEach((item: ScopeTreeRow) => {
      if (findEquivalentRowInItemAndSubItems({ id: item.id }, rootRows).equivalentRow) {
        fetchedSelectedItems.push(item)
      } else {
        notFetchedSelectedItemsIds.push(item.id)
      }
    })
    return {
      fetchedSelectedItems: fetchedSelectedItems,
      notFetchedSelectedItemsIds: notFetchedSelectedItemsIds
    }
  }

  const getAllParentsIds = async (selectedItems: ScopeTreeRow[], rootRows: ScopeTreeRow[]) => {
    const { fetchedSelectedItems: fetchedSelectedItems, notFetchedSelectedItemsIds: notFetchedSelectedItemsIds } =
      getFetchedSelectedItems(selectedItems, rootRows)

    const notFetchedSelectedItems: ScopeTreeRow[] =
      notFetchedSelectedItemsIds?.length > 0
        ? await servicesPerimeters.buildScopeTreeRowList(
            await servicesPerimeters.getPerimeters(notFetchedSelectedItemsIds)
          )
        : []
    const allParentsIds: string[] = [...fetchedSelectedItems, ...notFetchedSelectedItems]
      .map((item: ScopeTreeRow) => (item?.above_levels_ids ?? '').split(','))
      .flat()
      ?.filter((idValue, index, array) => {
        return idValue && array.indexOf(idValue) === index
      })
    return allParentsIds
  }

  const getParents = async (allParentsIds: string[]) => {
    const fetchedParents: ScopeTreeRow[] = []
    const notFetchedSubItemsIds: string[] = []
    const notFetchedParentsIds: string[] = allParentsIds.filter((parentId) => {
      const foundItem = findEquivalentRowInItemAndSubItems({ id: parentId }, rootRows).equivalentRow
      if (!foundItem) return true
      fetchedParents.push(foundItem)
      if (!foundItem.subItems || foundItem.subItems.length < 1 || foundItem.subItems[0]?.id === loadingItem.id) {
        notFetchedSubItemsIds.push(foundItem?.inferior_levels_ids?.split(','))
      }
      return false
    })
    const notFetchedItems: string[] = [...notFetchedParentsIds, ...notFetchedSubItemsIds]?.filter(
      (idValue, index, array) => {
        return idValue && array.indexOf(idValue) === index
      }
    )
    const notFetchedParents: ScopeTreeRow[] =
      notFetchedItems?.length > 0
        ? await servicesPerimeters.buildScopeTreeRowList(await servicesPerimeters.getPerimeters(notFetchedItems))
        : []
    return [...fetchedParents, ...notFetchedParents]
  }

  const _updateRootRows = (newRootRows: ScopeTreeRow[], parents: ScopeTreeRow[]) => {
    for (let i = 0; i < newRootRows.length; i++) {
      const updatedSubItems: ScopeTreeRow[] = parents?.filter((item) => newRootRows[i].id === item.parentId)
      if (updatedSubItems?.length > 0) {
        const newSubItems = newRootRows[i].subItems?.filter(
          (item) => item.id !== loadingItem.id && !updatedSubItems?.map((item) => item.id).includes(item?.id)
        )
        newRootRows[i] = { ...newRootRows[i], subItems: [...newSubItems, ...updatedSubItems] }
      }
      if (newRootRows[i]?.subItems?.length > 0 && newRootRows[i]?.subItems[0]?.id !== 'loading') {
        _updateRootRows(newRootRows[i].subItems, parents)
      }
    }
  }

  const _expandSelectedItems = async (rootRows: ScopeTreeRow[]) => {
    if (!selectedItems || selectedItems.length < 1) return

    const allParentsIds: string[] = await getAllParentsIds(selectedItems, rootRows)

    const parents: ScopeTreeRow[] = await getParents(allParentsIds)
    parents.push(...selectedItems)

    const newRootRows: ScopeTreeRow[] = [...rootRows]

    _updateRootRows(newRootRows, parents)
    dispatch(updateScopeList(newRootRows))
  }

  const _searchInPerimeters = async (_isAllSelected?: boolean) => {
    setSearchLoading(true)
    controllerRef.current = _cancelPendingRequest(controllerRef.current)
    const {
      scopeTreeRows: newPerimetersList,
      count: newCount,
      aborted: aborted
    } = await servicesPerimeters.findScope(searchInput, page, controllerRef.current?.signal, executiveUnitType)

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
    return newPerimetersList
  }

  /**
   * This function is called when a user click on chevron
   *
   */
  const _onExpand = async (rowId: number) => {
    controllerRef.current = new AbortController()
    let _openPopulation = openPopulation ? openPopulation : []
    const _rootRows = rootRows ? [...rootRows] : []
    const index = _openPopulation.indexOf(rowId)

    if (index !== -1) {
      _openPopulation = _openPopulation.filter((perimeter_id) => perimeter_id !== rowId)
      setOpenPopulations(_openPopulation)
    } else {
      _openPopulation = [..._openPopulation, rowId]
      setOpenPopulations(_openPopulation)
    }
    const expandResponse = await dispatch(
      expandScopeElement({
        rowId: rowId,
        selectedItems: selectedItems,
        scopesList: _rootRows,
        openPopulation: openPopulation,
        type: executiveUnitType,
        signal: controllerRef.current?.signal
      })
    ).unwrap()
    if (expandResponse && !expandResponse.aborted) {
      setRootRows(expandResponse.scopesList ?? [])
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
    const hierarchySelection: any[] = getHierarchySelection(row, selectedItems, scopesList)
    const optimizedHierarchySelection: any[] = optimizeHierarchySelection(hierarchySelection, scopesList)

    onChangeSelectedItem(optimizedHierarchySelection)
    return optimizedHierarchySelection
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

  const _isIndeterminated: (_row: any) => boolean | undefined = (_row) => checkIfIndeterminated(_row, selectedItems)

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
            checked={isHeadChecked}
            indeterminate={isHeadIndetermined}
            onClick={_onSelectAll}
          />
        </div>
      )
    },
    { id: 'name', align: 'left', disablePadding: false, disableOrderBy: true, label: 'Nom' },
    { id: 'quantity', align: 'center', disablePadding: false, disableOrderBy: true, label: 'Nombre de patients' },
    executiveUnitType
      ? {
          id: 'deidentified',
          align: 'center',
          disablePadding: false,
          disableOrderBy: true,
          label: 'Type'
        }
      : {
          id: 'type',
          align: 'center',
          disablePadding: false,
          disableOrderBy: true,
          label: 'Accès'
        }
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
                    <TableCellWrapper className={classes.tableHeadCell} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCellWrapper colSpan={7}>
                      <Typography className={classes.loadingSpinnerContainer}>Aucun résultat à afficher</Typography>
                    </TableCellWrapper>
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
                          executiveUnitType={executiveUnitType}
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
                        executiveUnitType={executiveUnitType}
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
          {searchInput && !isEmpty && (
            <Pagination
              className={classes.pagination}
              count={Math.ceil((count ?? 0) / 100)}
              shape="circular"
              onChange={(event, page: number) => setPage && setPage(page)}
              page={page}
            />
          )}
        </>
      )}
    </div>
  )
}

export default ScopeTree
