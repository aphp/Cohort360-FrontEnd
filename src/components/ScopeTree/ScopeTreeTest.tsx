import React, { Fragment, useEffect, useState } from 'react'

import {
  Breadcrumbs,
  Checkbox,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { ScopeElement, ScopeType, SelectedStatus } from 'types'
import { Hierarchy } from 'types/hierarchy'
import { IndeterminateCheckBoxOutlined, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import displayDigit from 'utils/displayDigit'
import useStyles from './styles'

type HierarchyItemProps = {
  item: Hierarchy<ScopeElement, string>
  searchMode: boolean
  path: number[]
  onSelect: (path: string[], toAdd: boolean) => void
  onExpand: (path: string[], displayIndex: number) => void
}

const ScopeTreeItem = ({ item, searchMode, path, onSelect, onExpand }: HierarchyItemProps) => {
  const { classes } = useStyles()
  const [open, setOpen] = useState(false)
  const { id, name, subItems, status, above_levels_ids, source_value, cohort_size, full_path } = item

  useEffect(() => {
    if (open === true && !subItems) {
      onExpand([...above_levels_ids.split(','), id], path[0])
    }
  }, [open])

  return (
    <Fragment>
      <TableRow className={path.length % 2 === 0 ? classes.secondRow : classes.mainRow}>
        <TableCell
          width="42px"
          className={classes.expandCell}
          style={{ cursor: 'pointer', color: 'rgb(91, 197, 242)' }}
        >
          <ListItem
            className={classes.expandIcon}
            style={path.length > 1 ? { marginLeft: path.length * 24 - 24 + 'px' } : { margin: '0' }}
          >
            {path.length && item.inferior_levels_ids && (
              <>
                {open && <KeyboardArrowDown onClick={() => setOpen(false)} />}
                {!open && <KeyboardArrowRight onClick={() => setOpen(true)} />}
              </>
            )}
          </ListItem>
        </TableCell>
        <TableCell width="42px" align="center" className={classes.checkbox}>
          <Checkbox
            checked={status === SelectedStatus.SELECTED}
            indeterminate={status === SelectedStatus.INDETERMINATE}
            color="secondary"
            indeterminateIcon={<IndeterminateCheckBoxOutlined />}
            onChange={(event, checked) => {
              const ids = above_levels_ids ? [...above_levels_ids.split(','), id] : [id]
              onSelect(ids, checked)
            }}
            inputProps={{ 'aria-labelledby': name }}
          />
        </TableCell>
        {searchMode && full_path && (
          <TableCell>
            <Breadcrumbs maxItems={2}>
              {(item.full_path.split('/').length > 1
                ? item.full_path.split('/').slice(1)
                : item.full_path.split('/').slice(0)
              ).map((full_path: string, index: number) => (
                <Typography key={index} style={{ color: '#153D8A' }}>
                  {full_path}
                </Typography>
              ))}
            </Breadcrumbs>
          </TableCell>
        )}
        {!searchMode && (
          <TableCell style={{ cursor: 'pointer' }}>
            <Typography onClick={() => setOpen(!open)}>{`${source_value} - ${name}`}</Typography>
          </TableCell>
        )}
        <TableCell align="center">
          <Typography onClick={() => setOpen(!open)}>{displayDigit(+cohort_size)}</Typography>
        </TableCell>
        <TableCell align="center">
          <Typography>{servicesPerimeters.getAccessFromScope(item)}</Typography>
        </TableCell>
      </TableRow>
      {open &&
        subItems &&
        subItems.map((subItem: Hierarchy<ScopeElement, string>, currentIndex: number) => (
          <ScopeTreeItem
            path={[...path, currentIndex]}
            searchMode={searchMode}
            key={currentIndex}
            item={subItem}
            onSelect={onSelect}
            onExpand={onExpand}
          />
        ))}
    </Fragment>
  )
}

type HierarchyProps = {
  executiveUnitType?: ScopeType
  hierarchy: Hierarchy<ScopeElement, string>[]
  searchMode: boolean
  selectAllStatus: SelectedStatus
  onExpand: (path: string[], displayIndex: number) => void
  onSelect: (path: string[], toAdd: boolean) => void
  onSelectAll: (toAdd: boolean) => void
}

const ScopeTree = ({
  executiveUnitType,
  hierarchy,
  searchMode,
  selectAllStatus,
  onSelect,
  onSelectAll,
  onExpand
}: HierarchyProps) => {
  const { classes } = useStyles()

  return (
    <Table>
      <TableHead>
        <TableRow className={classes.tableHead}>
          <TableCell className={classes.emptyTableHeadCell}></TableCell>
          <TableCell align="center" className={classes.emptyTableHeadCell}>
            <Checkbox
              color="secondary"
              checked={selectAllStatus === SelectedStatus.SELECTED}
              indeterminate={selectAllStatus === SelectedStatus.INDETERMINATE}
              indeterminateIcon={<IndeterminateCheckBoxOutlined style={{ color: 'rgba(0,0,0,0.6)' }} />}
              onChange={(event, checked) => onSelectAll(checked)}
            />
          </TableCell>
          <TableCell align="left" className={classes.tableHeadCell}>
            Nom
          </TableCell>

          <TableCell align="center" className={classes.tableHeadCell}>
            Nombre de patients
          </TableCell>

          <TableCell align="center" className={classes.tableHeadCell}>
            {!!executiveUnitType ? 'Type' : 'Accès'}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody style={{ height: '100%' }}>
        {hierarchy.map((item, index) => {
          return (
            <ScopeTreeItem
              searchMode={searchMode}
              path={[index]}
              key={item.id}
              item={item}
              onExpand={onExpand}
              onSelect={onSelect}
            />
          )
        })}
      </TableBody>
    </Table>
  )
}

export default ScopeTree
