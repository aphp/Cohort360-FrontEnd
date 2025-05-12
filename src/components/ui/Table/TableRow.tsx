import React, { Fragment, useState } from 'react'
import { CellType, Row, Link, Document, Table as TableType, Line, Status } from 'types/table'
import {
  Collapse,
  Grid,
  IconButton,
  SxProps,
  TableCell,
  TableRow as TableRowMui,
  Theme,
  Typography
} from '@mui/material'
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
import { TableCellWrapper } from './styles'
import Parse from 'html-react-parser'
import DOMPurify from 'dompurify'

type RowProps = {
  row: Row
  sx?: SxProps<Theme>
}

const TableRow = ({ row, sx }: RowProps) => {
  const [subitemIndex, setSubitemIndex] = useState<number | null>(null)
  const docContentIndex = row.findIndex((cell) => cell.type === CellType.DOCUMENT_CONTENT)

  return (
    <>
      <TableRowMui sx={{ ...sx }}>
        {row.map((cell, index) => {
          if (cell.isHidden) return <Fragment key={index} />
          return (
            <TableCellWrapper
              key={index}
              first={index === 0}
              last={index === row.length - 1}
              scope="row"
              align={cell.align ?? 'left'}
              sx={{ ...cell.sx }}
            >
              {cell.type == CellType.GENDER_ICON && (
                <Grid container>
                  <GenderIcon key={cell.id} gender={cell.value as GenderStatus} />
                </Grid>
              )}
              {cell.type == CellType.TEXT && <p>{cell.value as string}</p>}
              {cell.type == CellType.PARAGRAPHS && <Paragraphs value={cell.value as Paragraph[]} />}
              {cell.type == CellType.STATUS_CHIP &&
                (() => {
                  const IconComponent = (cell.value as Status).icon
                  const icon = IconComponent ? (
                    <IconComponent style={{ width: 15, height: 15, fill: 'white' }} />
                  ) : undefined
                  return (
                    <StatusChip
                      label={(cell.value as Status).label}
                      status={(cell.value as Status).status}
                      icon={icon}
                    />
                  )
                })()}
              {cell.type === CellType.LINK && (
                <div style={{ display: 'flex' }}>
                  {cell.value && <p>{(cell.value as Link).label}</p>}
                  <IconButton id="searchButton" onClick={() => window.open((cell.value as Link).url)}>
                    <SearchIcon height="15px" fill="#ED6D91" />
                  </IconButton>
                </div>
              )}
              {cell.type === CellType.DOCUMENT_VIEWER &&
                (() => {
                  const [isOpen, setIsOpen] = React.useState(false)
                  return (
                    <>
                      <IconButton
                        onClick={() => setIsOpen(true)}
                        disabled={!(cell.value as Document).id}
                        id={`docViewer-${(cell.value as Document).id}`}
                      >
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
              {cell.type === CellType.MODAL &&
                (() => {
                  const [open, setOpen] = useState(false)
                  return (
                    <>
                      <IconButton onClick={() => setOpen(true)}>
                        <Comment height="15px" fill="#ED6D91" />
                      </IconButton>
                      <Modal
                        open={open}
                        title="Commentaires"
                        onClose={() => setOpen(false)}
                        cancelText="Fermer"
                        readonly={true}
                      >
                        <Paragraphs value={cell.value as Paragraph[]} />
                      </Modal>
                    </>
                  )
                })()}
              {(cell.type === CellType.SUBARRAY || cell.type === CellType.LINES) && (
                <IconButton
                  aria-label="expand row"
                  size="small"
                  onClick={() => setSubitemIndex(index === subitemIndex ? null : index)}
                >
                  {subitemIndex === index ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
              )}
            </TableCellWrapper>
          )
        })}
      </TableRowMui>
      {subitemIndex !== null && row[subitemIndex].type === CellType.SUBARRAY && (
        <TableRowMui>
          <TableCell
            colSpan={row.length}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sx={{ padding: '0px 30px', backgroundColor: (sx as any)?.backgroundColor ?? '#fff' }}
          >
            <Collapse in={subitemIndex !== null} unmountOnExit>
              <DataTable
                value={row[subitemIndex].value as TableType}
                sxColumn={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  backgroundColor: (sx as any)?.backgroundColor ?? '#fff',
                  color: '153d8a',
                  borderBottom: '1px solid 1px solid rgb(224, 224, 224)',
                  fontSize: 13
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                sxRow={{ backgroundColor: (sx as any)?.backgroundColor ?? '#fff' }}
              />
            </Collapse>
          </TableCell>
        </TableRowMui>
      )}
      {subitemIndex !== null && row[subitemIndex].type === CellType.LINES && (
        <TableRowMui>
          <TableCell colSpan={row.length} sx={{ padding: 0 }}>
            <Collapse in={subitemIndex !== null} timeout="auto" unmountOnExit>
              {!row[subitemIndex].value || (row[subitemIndex].value as Line[])?.length === 0 ? (
                'Aucune donnée à afficher'
              ) : (
                <Lines value={row[subitemIndex].value as Line[]} />
              )}
            </Collapse>
          </TableCell>
        </TableRowMui>
      )}
      {docContentIndex > -1 && (
        <TableRowMui id={`docContent-${row[docContentIndex].id}`}>
          <TableCell colSpan={row.length} sx={{ padding: '20px' }}>
            <Typography>{Parse(DOMPurify.sanitize(row[docContentIndex].value as string))}</Typography>
          </TableCell>
        </TableRowMui>
      )}
    </>
  )
}

export default TableRow
