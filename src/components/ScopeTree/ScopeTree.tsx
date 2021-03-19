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

import EnhancedTable from '../EnhancedTable'

import { getScopePerimeters, getScopeSubItems } from '../../services/scopeService'
import { ScopeTreeRow } from 'types'
import { useAppSelector } from 'state'

import displayDigit from 'utils/displayDigit'

import useStyles from './styles'
import Lock from '@material-ui/icons/Lock'
import { CheckCircle } from '@material-ui/icons'
import { practitionerScopeSelector } from 'features/perimeters/perimetersSelector'

type ScopeTreeProps = {
  defaultSelectedItems: ScopeTreeRow[]
  onChangeSelectedItem: (selectedItems: ScopeTreeRow[]) => void
  restrictToPractitionerPerimeter?: boolean
}

const ScopeTree: React.FC<ScopeTreeProps> = ({
  defaultSelectedItems,
  onChangeSelectedItem,
  restrictToPractitionerPerimeter
}) => {
  const classes = useStyles()

  const practitionerScopeRows = useAppSelector(practitionerScopeSelector)
  const [openPopulation, onChangeOpenPopulations] = useState<string[]>([])
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>(practitionerScopeRows)
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItem] = useState(defaultSelectedItems)

  useEffect(() => {
    if (!restrictToPractitionerPerimeter) {
      setLoading(true)
      getScopePerimeters()
        .then((rootRows) => {
          setRootRows(rootRows)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [restrictToPractitionerPerimeter])

  useEffect(() => setSelectedItem(defaultSelectedItems), [defaultSelectedItems])

  /**
   * This function is called when a user click on chevron
   *
   */
  const _clickToDeploy = async (rowId: string) => {
    let savedSelectedItems = selectedItems ? [...selectedItems] : []
    let _openPopulation = openPopulation ? openPopulation : []
    let _rootRows = rootRows ? [...rootRows] : []
    const index = _openPopulation.indexOf(rowId)

    if (index !== -1) {
      _openPopulation = _openPopulation.filter((id) => id !== rowId)
      onChangeOpenPopulations(_openPopulation)
    } else {
      _openPopulation = [..._openPopulation, rowId]
      onChangeOpenPopulations(_openPopulation)

      const replaceSubItems = async (items: any) => {
        for (const item of items) {
          if (item.id === rowId) {
            const foundItem = item.subItems ? item.subItems.find((i: any) => i.id === 'loading') : true
            if (foundItem) {
              item.subItems = await getScopeSubItems(item)
              const isSelected = savedSelectedItems.indexOf(item)
              if (isSelected !== -1 && item.subItems && item.subItems.length > 0) {
                savedSelectedItems = [...savedSelectedItems, ...item.subItems]
                onChangeSelectedItem(savedSelectedItems)
              }
            }
          } else if (item.subItems && item.subItems.length !== 0) {
            item.subItems = [...(await replaceSubItems(item.subItems))]
          }
        }
        return items
      }

      _rootRows = await replaceSubItems(_rootRows)
      setRootRows(_rootRows)
    }
  }

  /**
   * This function is called when a user click on checkbox
   *
   */
  const _clickToSelect = (row: ScopeTreeRow) => {
    let savedSelectedItems = selectedItems ? [...selectedItems] : []

    const foundItem = savedSelectedItems.find(({ id }) => id === row.id)
    const index = foundItem ? savedSelectedItems.indexOf(foundItem) : -1

    const getAllChildren = (parent: ScopeTreeRow) => {
      const getChild: (subItem: ScopeTreeRow) => ScopeTreeRow[] = (subItem: ScopeTreeRow) => {
        if (subItem?.id === 'loading') return []

        return [
          subItem,
          ...(subItem.subItems ? subItem.subItems.map((subItem: ScopeTreeRow) => getChild(subItem)) : [])
        ].flat()
      }

      return [
        parent,
        ...(parent.subItems
          ? parent.id === 'loading'
            ? []
            : parent.subItems.map((subItem: ScopeTreeRow) => getChild(subItem))
          : [])
      ].flat()
    }

    const deleteRowAndChild = (parent: ScopeTreeRow) => {
      const elemToDelete = getAllChildren(parent)

      savedSelectedItems = savedSelectedItems.filter((row) => !elemToDelete.some(({ id }) => id === row.id))
      savedSelectedItems = savedSelectedItems.filter((row) => {
        // Remove if one child is not checked
        if (row.subItems && row.subItems.length > 0 && row.subItems[0].id === 'loading') {
          return true
        }
        const numberOfSubItemsSelected = row?.subItems?.filter((subItem: any) =>
          savedSelectedItems.find(({ id }) => id === subItem.id)
        )?.length
        if (numberOfSubItemsSelected && numberOfSubItemsSelected !== row?.subItems?.length) {
          return false
        }
        return true
      })

      return savedSelectedItems
    }

    if (index !== -1) {
      savedSelectedItems = deleteRowAndChild(row)
    } else {
      savedSelectedItems = [...savedSelectedItems, ...getAllChildren(row)]
    }
    onChangeSelectedItem(savedSelectedItems)
    // setSelectedItem(savedSelectedItems)
  }

  const _checkIfIndeterminated: (_row: ScopeTreeRow) => boolean | undefined = (_row) => {
    // Si que un loading => false
    if (_row.subItems && _row.subItems.length > 0 && _row.subItems[0].id === 'loading') {
      return false
    }
    // Si des sub elem && des sub elem qui sont check => true
    const numberOfSubItemsSelected = _row.subItems?.filter((subItem: any) =>
      selectedItems.find(({ id }) => id === subItem.id)
    )?.length
    if (numberOfSubItemsSelected && numberOfSubItemsSelected !== _row.subItems?.length) {
      return true
    }
    // sinon => false
    return false
  }

  const headCells = [
    { id: '', align: 'left', disablePadding: true, disableOrderBy: true, label: '' },
    { id: '', align: 'left', disablePadding: true, disableOrderBy: true, label: '' },
    { id: 'name', align: 'left', disablePadding: false, disableOrderBy: true, label: 'Nom' },
    { id: 'quantity', align: 'center', disablePadding: false, disableOrderBy: true, label: 'Nombre de patients' },
    { id: 'deidentified', align: 'center', disablePadding: false, disableOrderBy: true, label: 'Accès' }
  ]

  return (
    <div className={classes.container}>
      {loading ? (
        <Grid container justify="center">
          <CircularProgress size={50} />
        </Grid>
      ) : (
        <EnhancedTable noCheckbox noPagination rows={rootRows} headCells={headCells}>
          {(row: ScopeTreeRow, index: number) => {
            if (!row) return <></>
            const labelId = `enhanced-table-checkbox-${index}`
            const _displayLine = (_row: ScopeTreeRow, level: number) => (
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
                      <Typography>{_row.name}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography>{displayDigit(_row.quantity)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      {_row.access ? <CheckCircle className={classes.greenIcon} /> : <Lock />}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )

            const _displayChildren = (_row: any, level: number) => {
              return (
                <React.Fragment key={Math.random()}>
                  {_displayLine(_row, level)}
                  {openPopulation.find((id) => _row.id === id) &&
                    _row.subItems &&
                    _row.subItems.map((subItem: any) => _displayChildren(subItem, level + 1))}
                </React.Fragment>
              )
            }

            return (
              <React.Fragment key={Math.random()}>
                {_displayLine(row, 0)}
                {openPopulation.find((id) => row.id === id) &&
                  row.subItems &&
                  row.subItems.map((subItem: any) => _displayChildren(subItem, 1))}
              </React.Fragment>
            )
          }}
        </EnhancedTable>
      )}
    </div>
  )
}

export default ScopeTree
