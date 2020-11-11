import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'
import Chip from '@material-ui/core/Chip'
import Dialog from '@material-ui/core/Dialog'
import PropTypes from 'prop-types'

import { ReactComponent as PdfIcon } from '../../../../assets/icones/file-pdf.svg'
import { ReactComponent as CheckIcon } from '../../../../assets/icones/check.svg'
import { ReactComponent as CancelIcon } from '../../../../assets/icones/times.svg'

import useStyles from './styles'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const DocumentRow = ({ row }) => {
  const classes = useStyles()

  const [documentDialogOpen, setDocumentDialogOpen] = useState(false)

  const getStatusShip = (type) => {
    if (type === 'final') {
      return <Chip className={classes.validChip} icon={<CheckIcon height="15px" fill="#FFF" />} label={type} />
    } else {
      return <Chip className={classes.cancelledChip} icon={<CancelIcon height="15px" fill="#FFF" />} label={type} />
    }
  }

  return (
    <TableRow key={row.id} className={classes.tableBodyRows}>
      <TableCell align="left">{row.date}</TableCell>
      <TableCell align="left">{row.type}</TableCell>
      <TableCell align="left" className={classes.description}>
        {row.description}
      </TableCell>
      <TableCell align="center">{row.securityLabel?.coding ? row.securityLabel?.coding[0].code : 'unknown'}</TableCell>
      <TableCell align="center">{getStatusShip(row.docStatus)}</TableCell>
      <TableCell align="center">
        <IconButton
          onClick={() => setDocumentDialogOpen(true)}
          disabled={row.type !== 'report' && row.type !== 'prescription'}
        >
          <PdfIcon height="25px" fill="#ED6D91" />
          <Dialog open={documentDialogOpen} onClose={() => setDocumentDialogOpen(false)}>
            <Document
              file={{
                url: `https://demo.arkhn.com/files/${row.content[0].attachment.url}`,
                httpHeaders: { Accept: 'application/pdf' }
              }}
            >
              <Page pageNumber={1} />
            </Document>
          </Dialog>
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

const DocumentTable = (props) => {
  const classes = useStyles()

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead className={classes.tableHead}>
          <TableRow>
            <TableCell align="left" className={classes.tableHeadCell}>
              Date
            </TableCell>
            <TableCell align="left" className={classes.tableHeadCell}>
              Type
            </TableCell>
            <TableCell align="left" className={classes.tableHeadCell}>
              Description
            </TableCell>
            <TableCell align="center" className={classes.tableHeadCell}>
              NDA
            </TableCell>
            <TableCell align="center" className={classes.tableHeadCell}>
              Statut
            </TableCell>
            <TableCell align="center" className={classes.tableHeadCell}>
              Document
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.documents
            .slice((props.page - 1) * props.documentLines, props.page * props.documentLines)
            .map((row, i) => (
              <DocumentRow row={row} key={i} />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

DocumentTable.propTypes = {
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string,
      type: PropTypes.string,
      description: PropTypes.string.isRequired,
      status: PropTypes.string,
      docStatus: PropTypes.string.isRequired,
      securityLabel: PropTypes.arrayOf(
        PropTypes.shape({
          coding: PropTypes.arrayOf({
            code: PropTypes.string
          })
        })
      ),
      content: PropTypes.arrayOf(
        PropTypes.shape({
          attachment: PropTypes.shape({ url: PropTypes.string.isRequired })
        })
      ).isRequired
    })
  ).isRequired,
  page: PropTypes.number.isRequired,
  documentLines: PropTypes.number.isRequired
}

export default DocumentTable
