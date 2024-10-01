import React, { useState } from 'react'
import { CellType, Row, Link, Document, Table as TableType } from 'types/table'
import { Collapse, Grid, IconButton, SxProps, TableCell, TableRow as TableRowMui, Theme } from '@mui/material'
import GenderIcon from '../GenderIcon'
import { GenderStatus } from 'types/searchCriterias'
import StatusChip, { ChipStyles } from '../StatusChip'
import { VitalStatusLabel } from 'types/requestCriterias'
import SearchIcon from 'assets/icones/search.svg?react'
import { Visibility, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material'
import DocumentViewer from 'components/DocumentViewer/DocumentViewer'
import DataTable from '.'

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
