import React from 'react'
import { CellType, ColumnKey, Row, Link } from 'types/table'
import { Grid, IconButton, SxProps, TableCell, TableRow as TableRowMui, Theme } from '@mui/material'
import GenderIcon from '../GenderIcon'
import { GenderStatus } from 'types/searchCriterias'
import StatusChip, { ChipStyles } from '../StatusChip'
import { VitalStatusLabel } from 'types/requestCriterias'
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
          {cell.type == CellType.ICON && cell.key === ColumnKey.GENDER && (
            <Grid container>
              <GenderIcon key={cell.id} gender={cell.value as GenderStatus} />
            </Grid>
          )}
          {cell.type == CellType.TEXT && <p>{cell.value as string}</p>}
          {cell.type == CellType.CHIP && cell.key === ColumnKey.VITAL_STATUS && (
            <StatusChip
              label={cell.value as string}
              status={cell.value === VitalStatusLabel.DECEASED ? ChipStyles.CANCELLED : ChipStyles.VALID}
            />
          )}
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
