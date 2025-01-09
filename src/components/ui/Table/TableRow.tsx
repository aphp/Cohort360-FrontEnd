import React from 'react'
import { CellType, ColumnKey, Row } from 'types/table'
import TextCell from './Cells/TextCell'
import { SxProps, TableCell, TableRow as TableRowMui, Theme } from '@mui/material'
import GenderIcon from '../GenderIcon'
import { GenderStatus } from 'types/searchCriterias'
import StatusChip, { ChipStyles } from '../StatusChip'
import { VitalStatusLabel } from 'types/requestCriterias'

type RowProps = {
  row: Row
  sx?: SxProps<Theme>
}

const TableRow = ({ row, sx }: RowProps) => {
  return (
    <TableRowMui sx={{ ...sx, borderBottom: '1px solid grey' }}>
      {row.map((cell) => (
        <TableCell scope="row" align='center'>
          {cell.type == CellType.ICON && cell.key === ColumnKey.GENDER && (
            <GenderIcon key={cell.id} gender={cell.value as GenderStatus} />
          )}
          {cell.type == CellType.TEXT && <p dangerouslySetInnerHTML={{ __html: cell.value }} />}
          {cell.type == CellType.CHIP && cell.key === ColumnKey.VITAL_STATUS && (
            <StatusChip
              label={cell.value as string}
              status={cell.value === VitalStatusLabel.DECEASED ? ChipStyles.CANCELLED : ChipStyles.VALID}
            />
          )}
        </TableCell>
      ))}
    </TableRowMui>
  )
}

export default TableRow
