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
import { Comment, KeyboardArrowUp, KeyboardArrowDown, Visibility } from '@mui/icons-material'
import DocumentViewer from 'components/DocumentViewer/DocumentViewer'
import Lines from '../Lines'
import DataTable from '.'
import Paragraphs, { Paragraph } from '../Paragraphs'
import Modal from '../Modal'
import { TableCellWrapper } from './styles'
import DocumentContentDisplay from './DocumentContentDisplay'

type RowProps = {
  row: Row
  sx?: SxProps<Theme>
}

const TableRow = ({ row, sx }: RowProps) => {
  const [subitemIndex, setSubitemIndex] = useState<number | null>(null)
  const docContentIndex = row.findIndex((cell) => cell.type === CellType.DOCUMENT_CONTENT)
  const showSubContent =
    (subitemIndex !== null && row[subitemIndex].type === CellType.SUBARRAY) ||
    (subitemIndex !== null && row[subitemIndex].type === CellType.LINES) ||
    docContentIndex > -1

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
              sx={{ ...cell.sx, borderBottom: showSubContent ? 'none' : undefined }}
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
        <TableRowMui sx={{ backgroundColor: '#f5f9fe' }}>
          <TableCell
            colSpan={row.length}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sx={{ padding: '8px 16px 16px ', backgroundColor: (sx as any)?.backgroundColor ?? '#fff' }}
          >
            <Collapse in={subitemIndex !== null} unmountOnExit sx={{ border: '1px solid #ebebeb' }}>
              <DataTable
                value={row[subitemIndex].value as TableType}
                sxColumn={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  backgroundColor: (sx as any)?.backgroundColor ?? '#fafafa',
                  color: '153d8a',
                  fontSize: 10
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                sxRow={{ backgroundColor: (sx as any)?.backgroundColor ?? '#fff', fontSize: 12 }}
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
                <Typography align="center" p={2}>
                  Aucune donnée à afficher
                </Typography>
              ) : (
                <Lines value={row[subitemIndex].value as Line[]} />
              )}
            </Collapse>
          </TableCell>
        </TableRowMui>
      )}
      {docContentIndex > -1 && (
        <DocumentContentDisplay
          id={`docContent-${row[docContentIndex].id}`}
          length={row.length}
          docContent={row[docContentIndex].value as string}
        />
      )}
    </>
  )
}

export default TableRow
