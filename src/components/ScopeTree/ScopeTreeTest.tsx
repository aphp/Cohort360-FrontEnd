import React, { Fragment, useEffect, useState } from 'react'

import { Checkbox, ListItem, TableCell, TableRow, Typography } from '@mui/material'
import useStyles from './styles'
import { ScopeElement, SelectedStatus } from 'types'
import { Hierarchy } from 'types/hierarchy'
import { IndeterminateCheckBoxOutlined, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import displayDigit from 'utils/displayDigit'

type HierarchyItemProps = {
  item: Hierarchy<ScopeElement, string>
  path: number[]
  onSelect: (path: number[], toAdd: boolean, code: Hierarchy<ScopeElement, string>) => void
  onExpand: (children: string, path: string[], displayIndex: number) => void
}

const ScopeTreeItem = ({ item, path, onSelect, onExpand }: HierarchyItemProps) => {
  const { classes } = useStyles()
  const [open, setOpen] = useState(false)
  const { id, name, subItems, status, inferior_levels_ids, above_levels_ids, source_value, cohort_size } = item

  useEffect(() => {
    if (open === true && !subItems) {
      onExpand(inferior_levels_ids, [...above_levels_ids.split(','), id], path[0])
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
            {path.length && item.inferior_levels_ids && open ? (
              <KeyboardArrowDown onClick={() => setOpen(false)} />
            ) : (
              <Fragment />
            )}
            {path.length && item.inferior_levels_ids && !open ? (
              <KeyboardArrowRight onClick={() => setOpen(true)} />
            ) : (
              <Fragment />
            )}
          </ListItem>
        </TableCell>
        <TableCell width="42px" align="center" className={classes.checkbox}>
          <Checkbox
            checked={status === SelectedStatus.SELECTED}
            indeterminate={status === SelectedStatus.INDETERMINATE}
            color="secondary"
            indeterminateIcon={<IndeterminateCheckBoxOutlined />}
            onClick={() =>
              onSelect(path, status === SelectedStatus.SELECTED || status === SelectedStatus.INDETERMINATE, item)
            }
            inputProps={{ 'aria-labelledby': name }}
          />
        </TableCell>
        {/* <TableCell>
          {!isSearchMode ? (
            <>
              <Typography onClick={() => setOpen(!open)}>{`${source_value} - ${name}`}</Typography>
              <Typography onClick={() => setOpen(!open)}>{id}</Typography>
            </>
          ) : row.full_path ? (
            <Breadcrumbs maxItems={2}>
              {(row.full_path.split('/').length > 1
                ? row.full_path.split('/').slice(1)
                : row.full_path.split('/').slice(0)
              ).map((full_path: string, index: number) => (
                <Typography key={index} style={{ color: '#153D8A' }}>
                  {full_path}
                </Typography>
              ))}
            </Breadcrumbs>
          ) : (
            <>
              <Typography onClick={() => setOpen(!open)}>{`${source_value} - ${name}`}</Typography>
              <Typography onClick={() => setOpen(!open)}>{id}</Typography>
            </>
          )}
        </TableCell> */}
        <TableCell style={{ cursor: 'pointer' }}>
          <Typography onClick={() => setOpen(!open)}>{`${source_value} - ${name}`}</Typography>
          <Typography onClick={() => setOpen(!open)}>{id}</Typography>
        </TableCell>
        <TableCell align="center">
          <Typography onClick={() => setOpen(!open)}>{displayDigit(+cohort_size)}</Typography>
        </TableCell>
        <TableCell align="center">
          <Typography>{servicesPerimeters.getAccessFromScope(item)}</Typography>
        </TableCell>
      </TableRow>
      {open &&
        subItems &&
        subItems.map((subItem: Hierarchy<ScopeElement, string>, currentIndex: number) => {
          if (subItem.id === 'loading') {
            return <Fragment key={currentIndex}></Fragment>
          } else {
            subItem.status = status !== SelectedStatus.INDETERMINATE ? status : subItem.status
            return (
              <ScopeTreeItem
                path={[...path, currentIndex]}
                key={currentIndex}
                item={subItem}
                onSelect={onSelect}
                onExpand={onExpand}
              />
            )
          }
        })}
    </Fragment>
  )
}

type HierarchyProps = {
  hierarchy: Hierarchy<ScopeElement, string>[]
  onExpand: (children: string, path: string[], displayIndex: number) => void
  onSelect: (path: number[], toAdd: boolean, code: Hierarchy<ScopeElement, string>) => void
}

const ScopeTree = ({ hierarchy, onSelect, onExpand }: HierarchyProps) => {
  return (
    // <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
    <Fragment>
      {hierarchy
        /*.sort((a, b) => a.source_value.localeCompare(b.source_value))*/
        .map((item, index) => {
          return <ScopeTreeItem path={[index]} key={item.id} item={item} onExpand={onExpand} onSelect={onSelect} />
        })}
    </Fragment>
    // </List>
  )
}

export default ScopeTree
