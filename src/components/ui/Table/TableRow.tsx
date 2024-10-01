import React, { useState } from 'react'
import { CellType, Row, Link, Document, Table as TableType, Line, Status } from 'types/table'
import { Collapse, Grid, IconButton, SxProps, TableCell, TableRow as TableRowMui, Theme } from '@mui/material'
import GenderIcon from '../GenderIcon'
import { GenderStatus } from 'types/searchCriterias'
import StatusChip from '../StatusChip'
import SearchIcon from 'assets/icones/search.svg?react'
import { Visibility, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material'
import DocumentViewer from 'components/DocumentViewer/DocumentViewer'
import Lines from '../Lines'
import DataTable from '.'
import Paragraphs, { Paragraph } from '../Paragraphs'
import Modal from '../Modal'
import { Comment } from '@mui/icons-material'

type RowProps = {
  row: Row
  sx?: SxProps<Theme>
}

const TableRow = ({ row, sx }: RowProps) => {
  const [subarrayIndex, setSubarrayIndex] = useState<number | null>(null)

  return (
    <>
      <TableRowMui sx={{ ...sx }}>
        {row.map((cell, index) => (
          <TableCell
            scope="row"
            align={cell.align ?? 'left'}
            sx={{
              padding: index === 0 ? '5px 5px 5px 20px' : index === row.length - 1 ? '5px 20px 5px 5px' : '5px',
              color: '#303030',
              fontWeight: 400,
              ...sx
            }}
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
            {cell.type === CellType.DOCUMENT_VIEWER &&
              (() => {
                const [isOpen, setIsOpen] = React.useState(false)
                return (
                  <>
                    <IconButton onClick={() => setIsOpen(true)} disabled={!(cell.value as Document).id}>
                      <Visibility height="30px" />
                    </IconButton>
                    <DocumentViewer
                      open={isOpen}
                      documentId={(cell.value as Document).id ?? ''}
                      deidentified={(cell.value as Document).deidentified}
                      handleClose={() => setIsOpen(false)}
                    />
                  </>
                )
              })()}
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
            {cell.type === CellType.SUBARRAY && (
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setSubarrayIndex(index === subarrayIndex ? null : index)}
              >
                {subarrayIndex === index ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            )}
          </TableCell>
        ))}
      </TableRowMui>
      {subarrayIndex !== null && (
        <TableRowMui>
          <TableCell colSpan={row.length} sx={{ padding: 0 }}>
            <Collapse in={subarrayIndex !== null} unmountOnExit>
              <DataTable
                value={row[subarrayIndex].value as TableType}
                sxColumn={{
                  backgroundColor: '#f8fcff',
                  borderBottom: '1px solid 1px solid rgb(224, 224, 224)',
                  fontSize: 11
                }}
                sxRow={{ backgroundColor: '#fff', borderBottom: '1px solid rgb(224, 224, 224)', fontSize: 12.5 }}
              />
            </Collapse>
          </TableCell>
        </TableRowMui>
      )}
    </>
  )
}

export default TableRow
