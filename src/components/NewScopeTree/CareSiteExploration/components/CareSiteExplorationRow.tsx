import { ScopeTreeRow, ScopeType } from 'types'
import React from 'react'
import useStyles from '../../commons/styles'
import { Checkbox, IconButton, Skeleton, TableCell, TableRow, Typography } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/ChevronRight'
import displayDigit from 'utils/displayDigit'

type CareSiteRowProps = {
  row: ScopeTreeRow
  level: number
  parentAccess: string
  openPopulation: number[]
  labelId: string
  onExpand: (rowId: number) => Promise<void>
  onSelect: (row: ScopeTreeRow) => Promise<ScopeTreeRow[]>
  isIndeterminated: (row: ScopeTreeRow) => boolean | undefined
  isSelected: (row: ScopeTreeRow) => boolean
  executiveUnitType?: ScopeType
}

const CareSiteExplorationRow: React.FC<CareSiteRowProps> = (props: CareSiteRowProps) => {
  const {
    row,
    level,
    parentAccess,
    openPopulation,
    labelId,
    onExpand,
    onSelect,
    isIndeterminated: isIndeterminate,
    isSelected,
    executiveUnitType
  } = props

  const { classes } = useStyles()

  const _isSelected = isSelected(row)
  const _isIndeterminate = !_isSelected && isIndeterminate(row)

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
                onClick={() => onExpand(+row.id)}
                style={{ marginLeft: level * 35, padding: 0, marginRight: -30 }}
              >
                {openPopulation.find((id) => +row.id === id) ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
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
              checked={_isSelected}
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </TableCell>
          <TableCell>{<Typography>{row.name}</Typography>}</TableCell>
          <TableCell align="center" style={{ cursor: 'pointer' }} onClick={() => onSelect(row)}>
            <Typography>{displayDigit(row.quantity)}</Typography>
          </TableCell>
          {executiveUnitType ? (
            <TableCell align="center" style={{ cursor: 'pointer' }} onClick={() => onSelect(row)}>
              <Typography>{row.type ?? '-'}</Typography>
            </TableCell>
          ) : (
            <TableCell align="center" style={{ cursor: 'pointer' }} onClick={() => onSelect(row)}>
              <Typography>{row.access ?? parentAccess}</Typography>
            </TableCell>
          )}
        </TableRow>
      )}
    </>
  )
}
export default CareSiteExplorationRow
