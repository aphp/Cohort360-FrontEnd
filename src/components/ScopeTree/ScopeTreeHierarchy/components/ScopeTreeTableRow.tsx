import { ScopeTreeRow, ScopeType } from 'types'
import React from 'react'
import useStyles from '../../utils/styles'
import { Breadcrumbs, Checkbox, IconButton, Skeleton, TableCell, TableRow, Typography } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/ChevronRight'
import displayDigit from 'utils/displayDigit'
import { LOADING } from '../../../../utils/scopeTree'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'

type ScopeTreeTableRowProps = {
  row: ScopeTreeRow
  level: number
  parentAccess: string
  openPopulation: number[]
  labelId: string
  onExpand: (rowId: number) => Promise<void>
  onSelect: (row: ScopeTreeRow) => Promise<ScopeTreeRow[]>
  isIndeterminate: (row: ScopeTreeRow) => boolean | undefined
  isSelected: (row: ScopeTreeRow) => boolean
  isSearchMode?: boolean
  executiveUnitType?: ScopeType
}

const ScopeTreeTableRow: React.FC<ScopeTreeTableRowProps> = (props: ScopeTreeTableRowProps) => {
  const {
    row,
    level,
    parentAccess,
    openPopulation,
    labelId,
    onExpand,
    onSelect,
    isIndeterminate,
    isSelected,
    isSearchMode,
    executiveUnitType
  } = props

  const { classes } = useStyles()

  const _isSelected = isSelected(row)
  const _isIndeterminate = !_isSelected && isIndeterminate(row)

  return (
    <>
      {row.id === LOADING.id ? (
        <TableRow hover key={Math.random()}>
          <TableCell colSpan={5}>
            <Skeleton animation="wave" />
          </TableCell>
        </TableRow>
      ) : (
        <TableRow hover key={row.id}>
          <TableCell>
            {(row.subItems?.length ?? 0) > 0 && (!isSearchMode || row.type !== executiveUnitType) && (
              <IconButton
                onClick={() => onExpand(Number(row.id))}
                style={{ marginLeft: level * 35, padding: 0, marginRight: -30 }}
              >
                {openPopulation.find((id: number) => Number(row.id) === id) ? (
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
              onClick={() => {
                onSelect(row)
              }}
              indeterminate={_isIndeterminate}
              indeterminateIcon={<IndeterminateCheckBoxOutlined />}
              checked={_isSelected}
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </TableCell>
          <TableCell>
            {!isSearchMode ? (
              <Typography>{row.name}</Typography>
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
              <Typography>{row.name}</Typography>
            )}
          </TableCell>
          <TableCell align="center" style={{ cursor: 'pointer' }} onClick={() => onSelect(row)}>
            <Typography>{displayDigit(row.quantity)}</Typography>
          </TableCell>
          <TableCell align="center" style={{ cursor: 'pointer' }} onClick={() => onSelect(row)}>
            <Typography>{executiveUnitType ? row.type ?? '-' : row.access ?? parentAccess}</Typography>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
export default ScopeTreeTableRow
