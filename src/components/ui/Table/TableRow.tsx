import React, { useState } from 'react'
import { CellType, Row, Link, Line } from 'types/table'
import { Collapse, Grid, IconButton, SxProps, TableCell, TableRow as TableRowMui, Theme } from '@mui/material'
import GenderIcon from '../GenderIcon'
import { GenderStatus } from 'types/searchCriterias'
import StatusChip, { ChipStyles } from '../StatusChip'
import { VitalStatusLabel } from 'types/requestCriterias'
import SearchIcon from 'assets/icones/search.svg?react'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import Lines from '../Lines'

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
          {cell.type == CellType.VITALSTATUS_CHIP && (
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
          {cell.type === CellType.LINES &&
            (() => {
              const [open, setOpen] = useState(false)
              return (
                <>
                  <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                    {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                  <Collapse in={open} timeout="auto" unmountOnExit>
                    {(cell.value as Line[]).length === 0 ? (
                      'Aucune donnée à afficher'
                    ) : (
                      <Lines value={cell.value as Line[]} />
                    )}
                  </Collapse>
                </>
              )
            })()}
        </TableCell>
      ))}
    </TableRowMui>
  )
}

export default TableRow
