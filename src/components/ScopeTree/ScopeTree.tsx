import React, { useEffect, useState } from 'react'

import {
  Grid,
  CircularProgress,
  IconButton,
  Checkbox,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography,
  Breadcrumbs
} from '@material-ui/core'

import Skeleton from '@material-ui/lab/Skeleton'
import KeyboardArrowRightIcon from '@material-ui/icons/ChevronRight'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import EnhancedTable from 'components/ScopeTree/ScopeTreeTable'
import { ScopeTreeRow } from 'types'

import { useAppDispatch, useAppSelector } from 'state'
import { expandScopeElement, fetchScopesList, ScopeState } from 'state/scope'

import apiBackend from 'services/apiBackend'

import displayDigit from 'utils/displayDigit'
import { getSelectedScopes } from 'utils/scopeTree'
import { useDebounce } from 'utils/debounce'

import useStyles from './styles'

type ScopeTreeProps = {
  defaultSelectedItems: ScopeTreeRow[]
  onChangeSelectedItem: (selectedItems: ScopeTreeRow[]) => void
  searchInput?: string
}

const ScopeTree: React.FC<ScopeTreeProps> = ({ defaultSelectedItems, onChangeSelectedItem, searchInput }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const [selectedItems, setSelectedItem] = useState(defaultSelectedItems)
  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const [isEmpty, setIsEmpty] = useState<boolean>(false)

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))

  const { openPopulation = [], scopesList = [] } = scopeState
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>(scopesList)
  const debouncedSearchTerm = useDebounce(700, searchInput)

  const fetchScopeTree = async () => {
    dispatch<any>(fetchScopesList())
  }

  const _init = async () => {
    setSearchLoading(true)
    await fetchScopeTree()
    setRootRows(scopesList)
    setSearchLoading(false)
    setIsEmpty(false)
  }

  useEffect(() => {
    const _searchInPerimeters = async () => {
      setSearchLoading(true)
      const backCohortResponse = await apiBackend.get(`accesses/perimeters/read-patient/?search=${searchInput}`)
      const newPerimetersList = parsePerimeters(backCohortResponse)
      setRootRows(newPerimetersList)
      setSearchLoading(false)
    }

    if (debouncedSearchTerm && debouncedSearchTerm?.length > 2) {
      _searchInPerimeters()
    } else if (!debouncedSearchTerm) {
      _init()
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    fetchScopeTree()
  }, [])

  useEffect(() => setSelectedItem(defaultSelectedItems), [defaultSelectedItems])
  useEffect(() => {
    setRootRows(scopesList)
  }, [scopesList])

  const parsePerimeters = (backCohortResponse: any) => {
    return backCohortResponse && backCohortResponse.data
      ? backCohortResponse.data.map((item: any) => {
          return {
            id: item.perimeter.id,
            name: item.perimeter.full_path,
            quantity: item.perimeter.cohort_size,
            access: item.right_read_patient_nominative ? 'Nominatif' : 'Pseudonymisé'
          }
        })
      : setIsEmpty(true)
  }

  /**
   * This function is called when a user click on chevron
   *
   */
  const _clickToDeploy = async (rowId: number) => {
    const expandResponse = await dispatch<any>(expandScopeElement({ rowId, selectedItems }))
    if (expandResponse && expandResponse.payload) {
      const _selectedItems = expandResponse.payload.selectedItems ?? []
      onChangeSelectedItem(_selectedItems)
    }
  }

  /**
   * This function is called when a user click on checkbox
   *
   */
  const _clickToSelect = (row: ScopeTreeRow) => {
    const savedSelectedItems: ScopeTreeRow[] = getSelectedScopes(row, selectedItems, scopesList)

    onChangeSelectedItem(savedSelectedItems)
    return savedSelectedItems
  }

  const _clickToSelectAll = () => {
    let results: any[] = []
    if (
      scopesList.filter((row) => selectedItems.find(({ id }) => id === row.id) !== undefined).length ===
      scopesList.length
    ) {
      results = []
    } else {
      for (const rootRow of scopesList) {
        const rowsAndChildren = _clickToSelect(rootRow)
        results = [...results, ...rowsAndChildren]
      }
    }
    onChangeSelectedItem(results)
  }

  const _checkIfIndeterminated: (_row: any) => boolean | undefined = (_row) => {
    // Si que un loading => false
    if (_row.subItems && _row.subItems.length > 0 && _row.subItems[0].id === 'loading') {
      return false
    }
    const checkChild: (item: any) => boolean = (item) => {
      const numberOfSubItemsSelected = item.subItems?.filter((subItem: any) =>
        selectedItems.find(({ id }) => id === subItem.id)
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
            checked={
              scopesList.filter((row) => selectedItems.find(({ id }) => id === row.id) !== undefined).length ===
              scopesList.length
            }
            onClick={_clickToSelectAll}
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

                  const _displayLine = (_row: any, level: number, parentAccess: string) => (
                    <>
                      {_row.id === 'loading' ? (
                        <TableRow hover key={Math.random()}>
                          <TableCell colSpan={5}>
                            <Skeleton animation="wave" />
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow
                          hover
                          key={_row.id}
                          classes={{
                            root: level % 2 === 0 ? classes.mainRow : classes.secondRow
                          }}
                        >
                          <TableCell>
                            {_row.subItems && _row.subItems.length > 0 && (
                              <IconButton
                                onClick={() => _clickToDeploy(_row.id)}
                                style={{ marginLeft: level * 35, padding: 0, marginRight: -30 }}
                              >
                                {openPopulation.find((id) => _row.id === id) ? (
                                  <KeyboardArrowDownIcon />
                                ) : (
                                  <KeyboardArrowRightIcon />
                                )}
                              </IconButton>
                            )}
                          </TableCell>

                          <TableCell align="center" padding="checkbox">
                            <Checkbox
                              color="secondary"
                              onClick={() => _clickToSelect(_row)}
                              indeterminate={_checkIfIndeterminated(_row)}
                              checked={selectedItems.some(({ id }) => id === _row.id) ? true : false}
                              inputProps={{ 'aria-labelledby': labelId }}
                            />
                          </TableCell>

                          <TableCell>
                            {searchInput && _row.name ? (
                              <Breadcrumbs maxItems={2}>
                                {_row.name
                                  .split('/')
                                  .slice(1)
                                  .map((name: any, index: number) => (
                                    <Typography key={index} style={{ color: '#153D8A' }}>
                                      {name}
                                    </Typography>
                                  ))}
                              </Breadcrumbs>
                            ) : (
                              <Typography>{_row.name}</Typography>
                            )}
                          </TableCell>

                          <TableCell align="center" style={{ cursor: 'pointer' }} onClick={() => _clickToSelect(_row)}>
                            <Typography>{displayDigit(_row.quantity)}</Typography>
                          </TableCell>

                          <TableCell align="center" style={{ cursor: 'pointer' }} onClick={() => _clickToSelect(_row)}>
                            <Typography>{_row.access ?? parentAccess}</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )

                  const _displayChildren = (_row: any, level: number, parentAccess: string) => {
                    return (
                      <React.Fragment key={Math.random()}>
                        {_displayLine(_row, level, parentAccess)}
                        {openPopulation.find((id) => _row.id === id) &&
                          _row.subItems &&
                          _row.subItems.map((subItem: any) => _displayChildren(subItem, level + 1, parentAccess))}
                      </React.Fragment>
                    )
                  }

                  return (
                    <React.Fragment key={Math.random()}>
                      {_displayLine(row, 0, row.access)}
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
        </>
      )}
    </div>
  )
}

export default ScopeTree
