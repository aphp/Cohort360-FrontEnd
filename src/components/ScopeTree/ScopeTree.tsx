import React, { useEffect, useState } from 'react'

import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import IconButton from '@material-ui/core/IconButton'
import Checkbox from '@material-ui/core/Checkbox'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import Skeleton from '@material-ui/lab/Skeleton'

import KeyboardArrowRightIcon from '@material-ui/icons/ChevronRight'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import EnhancedTable from 'components/ScopeTree/ScopeTreeTable'
import { ScopeTreeRow } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { ScopeState, fetchScopesList, expandScopeElement } from 'state/scope'

import displayDigit from 'utils/displayDigit'
import { getSelectedScopes } from 'utils/scopeTree'

import useStyles from './styles'

type ScopeTreeProps = {
  defaultSelectedItems: ScopeTreeRow[]
  onChangeSelectedItem: (selectedItems: ScopeTreeRow[]) => void
}

const ScopeTree: React.FC<ScopeTreeProps> = ({ defaultSelectedItems, onChangeSelectedItem }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const [selectedItems, setSelectedItem] = useState(defaultSelectedItems)

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))

  const { loading = false, openPopulation = [], scopesList = [] } = scopeState

  const fetchScopeTree = async () => {
    dispatch<any>(fetchScopesList())
  }

  useEffect(() => {
    fetchScopeTree()
  }, [])

  useEffect(() => setSelectedItem(defaultSelectedItems), [defaultSelectedItems])

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
      {loading && scopesList.length === 0 ? (
        <Grid container justifyContent="center">
          <CircularProgress size={50} />
        </Grid>
      ) : (
        <EnhancedTable noCheckbox noPagination rows={scopesList} headCells={headCells}>
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

                    <TableCell style={{ cursor: 'pointer' }} onClick={() => _clickToSelect(_row)}>
                      <Typography>{_row.name}</Typography>
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
                  row.subItems.map((subItem: any) => _displayChildren(subItem, 1, row.access))}
              </React.Fragment>
            )
          }}
        </EnhancedTable>
      )}
    </div>
  )
}

export default ScopeTree
