import { ScopeTreeRow } from 'types'
import React from 'react'
import useStyles from '../../CareSiteCommons/styles'
import { Breadcrumbs, Checkbox, IconButton, Skeleton, TableCell, TableRow, Typography } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/ChevronRight'
import displayDigit from 'utils/displayDigit'
import { PmsiListType } from 'state/pmsi'

type CareSiteSearchResultRowProps = {
  row: ScopeTreeRow
  level: number
  parentAccess: string
  openPopulation: number[]
  labelId: string
  onExpand: (rowId: number) => Promise<void>
  onSelect: (row: ScopeTreeRow) => PmsiListType[]
  isIndeterminated: (row: ScopeTreeRow) => boolean | undefined
  isSelected: (row: ScopeTreeRow) => boolean
}

const CareSiteSearchResultRow: React.FC<CareSiteSearchResultRowProps> = (props: CareSiteSearchResultRowProps) => {
  const { row, level, parentAccess, openPopulation, labelId, onExpand, onSelect, isIndeterminated, isSelected } = props

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
              indeterminate={isIndeterminated(row)}
              checked={isSelected(row) ? true : false}
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </TableCell>
          <TableCell>
            {row.full_path ? (
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
          </TableCell>
          <TableCell align="center" style={{ cursor: 'pointer' }} onClick={() => onSelect(row)}>
            <Typography>{displayDigit(row.quantity)}</Typography>
          </TableCell>
          {
            <TableCell align="center" style={{ cursor: 'pointer' }} onClick={() => onSelect(row)}>
              <Typography>{row.access ?? parentAccess}</Typography>
            </TableCell>
          }
        </TableRow>
      )}
    </>
  )
}
export default CareSiteSearchResultRow
