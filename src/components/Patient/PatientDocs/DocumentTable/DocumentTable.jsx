import React from 'react'
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
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'

import { ReactComponent as PdfIcon } from '../../../../assets/icones/file-pdf.svg'
import { ReactComponent as CheckIcon } from '../../../../assets/icones/check.svg'
import { ReactComponent as CancelIcon } from '../../../../assets/icones/times.svg'

import { FHIR_API_URL } from '../../../../constants'

import useStyles from './style'
import { Typography } from '@material-ui/core'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const DocumentRow = ({ row }) => {
  const classes = useStyles()

  const [documentDialogOpen, setDocumentDialogOpen] = React.useState(false)

  const handleOpenPdf = () => {
    setDocumentDialogOpen(true)
  }

  const handleClosePdf = () => {
    setDocumentDialogOpen(false)
  }

  const getStatusShip = (type) => {
    if (type === 'final' || type === 'current') {
      return (
        <Chip
          className={classes.validChip}
          icon={<CheckIcon height="15px" fill="#FFF" />}
          label={type}
        />
      )
    } else {
      return (
        <Chip
          className={classes.cancelledChip}
          icon={<CancelIcon height="15px" fill="#FFF" />}
          label={type}
        />
      )
    }
  }

  return (
    <React.Fragment>
      <TableRow key={row.id} className={classes.tableBodyRows}>
        <TableCell align="left">{row.NDA}</TableCell>
        <TableCell align="left">
          {new Date(row.date).toLocaleDateString('fr-FR')}
        </TableCell>
        <TableCell align="left">{row.type.coding[0].display}</TableCell>
        <TableCell align="left" className={classes.description}>
          {row.title}
        </TableCell>
        <TableCell align="center">{row.serviceProvider}</TableCell>
        <TableCell align="center">{getStatusShip(row.status)}</TableCell>
        <TableCell align="center">
          <IconButton onClick={() => handleOpenPdf()}>
            <PdfIcon height="30px" fill="#ED6D91" />
          </IconButton>
        </TableCell>
      </TableRow>
      <Dialog
        open={documentDialogOpen}
        onClose={() => setDocumentDialogOpen(false)}
        maxWidth="lg"
      >
        <DialogContent>
          <Document
            file={{
              url: `${FHIR_API_URL}/Binary/${row.id}`,
              httpHeaders: {
                Accept: 'application/pdf',
                Authorization: `Bearer ${localStorage.getItem('access')}`
              }
            }}
          >
            <Page pageNumber={1} />
          </Document>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              handleClosePdf()
            }}
            color="primary"
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}

DocumentRow.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.string,
    securityLabel: PropTypes.array,
    date: PropTypes.string,
    type: PropTypes.object,
    title: PropTypes.string,
    status: PropTypes.string,
    content: PropTypes.array,
    NDA: PropTypes.string,
    serviceProvider: PropTypes.string
  })
}

const DocumentTable = (props) => {
  const classes = useStyles()

  return (
    <>
      {props.documents ? (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell align="left" className={classes.tableHeadCell}>
                  NDA
                </TableCell>
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
                  Unité exécutrice
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  Statut
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  PDF
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.documents
                .slice(
                  (props.page - 1) * props.documentLines,
                  props.page * props.documentLines
                )
                .map((row) => (
                  <DocumentRow
                    key={row.id}
                    row={row}
                    showText={props.searchMode}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography> Aucun document à afficher </Typography>
      )}
    </>
  )
}

DocumentTable.propTypes = {
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string,
      type: PropTypes.object,
      description: PropTypes.string,
      status: PropTypes.string,
      docStatus: PropTypes.string,
      securityLabel: PropTypes.array,
      content: PropTypes.arrayOf(
        PropTypes.shape({
          attachment: PropTypes.shape({ url: PropTypes.string.isRequired })
        })
      )
    })
  ).isRequired,
  page: PropTypes.number.isRequired,
  documentLines: PropTypes.number.isRequired,
  searchMode: PropTypes.bool
}

export default DocumentTable
