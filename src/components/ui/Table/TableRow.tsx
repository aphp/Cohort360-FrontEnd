import React, { useState } from 'react'
import { CellType, Row, Link } from 'types/table'
import { Grid, IconButton, SxProps, TableCell, TableRow as TableRowMui, Theme } from '@mui/material'
import GenderIcon from '../GenderIcon'
import { GenderStatus } from 'types/searchCriterias'
import StatusChip, { ChipStyles } from '../StatusChip'
import { VitalStatusLabel } from 'types/requestCriterias'
import SearchIcon from 'assets/icones/search.svg?react'
import { Comment } from '@mui/icons-material'
import Modal from '../Modal'
import Paragraphs, { Paragraph } from '../Paragraphs'

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
          {cell.type === CellType.MODAL &&
            (() => {
              const [open, setOpen] = useState(false)
              return (
                <>
                  <div style={{ display: 'flex' }}>
                    <IconButton onClick={() => setOpen(true)}>
                      <Comment height="15px" fill="#ED6D91" />
                    </IconButton>
                  </div>
                  <Modal open={open} title="Commentaires" onClose={() => setOpen(false)} readonly={true}>
                    <Paragraphs value={cell.value as Paragraph[]} />
                  </Modal>
                </>
              )
            })()}
        </TableCell>
      ))}
    </TableRowMui>
  )
}

export default TableRow
