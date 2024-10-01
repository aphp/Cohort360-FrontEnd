import React, { Fragment } from 'react'
import { CellType, Row, Link, Status } from 'types/table'
import { Grid, IconButton, SxProps, TableCell, TableRow as TableRowMui, Theme } from '@mui/material'
import GenderIcon from '../GenderIcon'
import { GenderStatus } from 'types/searchCriterias'
import StatusChip from '../StatusChip'
import SearchIcon from 'assets/icones/search.svg?react'

type RowProps = {
  row: Row
  sx?: SxProps<Theme>
}

const TableRow = ({ row, sx }: RowProps) => {
  return (
    <TableRowMui sx={{ ...sx }}>
      {row.map((cell, index) => (
        <TableCell
          scope="row"
          align={cell.align ?? 'left'}
          sx={{ padding: index === 0 ? '5px 5px 5px 20px' : '5px', color: '#303030', fontWeight: 400 }}
        >
          {cell.type == CellType.GENDER_ICON && (
            <Grid container>
              <GenderIcon key={cell.id} gender={cell.value as GenderStatus} />
            </Grid>
          )}
          {cell.type == CellType.TEXT && <p>{cell.value as string}</p>}
          {cell.type == CellType.STATUS_CHIP &&
            (() => {
              const IconComponent = (cell.value as Status).icon
              const icon = IconComponent ? (
                <IconComponent style={{ width: 15, height: 15, fill: 'white' }} />
              ) : undefined
              return (
                <StatusChip label={(cell.value as Status).label} status={(cell.value as Status).status} icon={icon} />
              )
            })()}
          {cell.type === CellType.LINK && (
            <div style={{ display: 'flex' }}>
              {cell.value && <p>{(cell.value as Link).label}</p>}
              <IconButton onClick={() => window.open((cell.value as Link).url)}>
                <SearchIcon height="15px" fill="#ED6D91" />
              </IconButton>
            </div>
          )}
        </TableCell>
      ))}
    </TableRowMui>
  )
}

export default TableRow
