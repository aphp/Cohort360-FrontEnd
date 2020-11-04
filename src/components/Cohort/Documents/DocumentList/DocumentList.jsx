import React, { memo } from 'react'
import { useHistory } from 'react-router-dom'

import { Document, Page, pdfjs } from 'react-pdf'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Chip from '@material-ui/core/Chip'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'

import DescriptionIcon from '@material-ui/icons/Description'
import LocalHospitalIcon from '@material-ui/icons/LocalHospital'
import ContactsIcon from '@material-ui/icons/Contacts'
import { ReactComponent as PdfIcon } from '../../../../assets/icones/file-pdf.svg'
import { ReactComponent as CheckIcon } from '../../../../assets/icones/check.svg'
import { ReactComponent as CancelIcon } from '../../../../assets/icones/times.svg'
import { ReactComponent as UserIcon } from '../../../../assets/icones/user.svg'
import { ReactComponent as SearchIcon } from '../../../../assets/icones/search.svg'

import { FHIR_API_URL } from '../../../../constants'

import useStyles from './style'
import { Typography } from '@material-ui/core'

const DocumentRow = ({ row, showText, showIpp }) => {
  const history = useHistory()
  const classes = useStyles()

  const [documentDialogOpen, setDocumentDialogOpen] = React.useState(false)
  const [numPages, setNumPages] = React.useState(null)

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
    <Grid container item direction="column" className={classes.row}>
      <Grid container item>
        <Grid container item direction="column" justify="center" xs={4}>
          <Typography variant="button">{row.title}</Typography>
          <Typography>
            {new Date(row.date).toLocaleDateString('fr-FR')}{' '}
            {new Date(row.date).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
          {getStatusShip(row.status)}
        </Grid>
        <Grid container item xs={8} justify="space-around">
          {showIpp && (
            <Grid container item xs={3} alignItems="center" justify="center">
              <UserIcon height="25px" fill="#5BC5F2" />
              <Grid
                container
                item
                direction="column"
                xs={6}
                className={classes.textGrid}
              >
                <Typography variant="button">IPP</Typography>
                <Grid container item alignItems="center">
                  <Typography>{row.IPP}</Typography>
                  <IconButton
                    onClick={() => history.push(`/patients/${row.idPatient}`)}
                    className={classes.searchIcon}
                  >
                    <SearchIcon height="15px" fill="#ED6D91" />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          )}
          <Grid container item xs={2} alignItems="center" justify="center">
            <DescriptionIcon htmlColor="#5BC5F2" className={classes.iconSize} />
            <Grid
              container
              item
              direction="column"
              xs={6}
              className={classes.textGrid}
            >
              <Typography variant="button">NDA</Typography>
              <Typography>{row.NDA}</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={4} alignItems="center" justify="center">
            <LocalHospitalIcon
              htmlColor="#5BC5F2"
              className={classes.iconSize}
            />
            <Grid
              container
              item
              direction="column"
              xs={6}
              className={classes.textGrid}
            >
              <Typography variant="button">Unité exécutrice</Typography>
              <Typography>{row.serviceProvider}</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={2} alignItems="center" justify="center">
            <ContactsIcon htmlColor="#5BC5F2" className={classes.iconSize} />
            <Grid
              container
              item
              direction="column"
              xs={6}
              className={classes.textGrid}
            >
              <Typography variant="button">Visite</Typography>
              <Typography>{row.encounterStatus}</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={1} justify="center">
            <IconButton onClick={() => handleOpenPdf()}>
              <PdfIcon height="30px" fill="#ED6D91" />
              <Dialog
                open={documentDialogOpen}
                onClose={(e) => {
                  e.stopPropagation()
                  handleClosePdf()
                }}
                maxWidth="md"
              >
                <DialogContent>
                  <Document
                    file={{
                      url: `${FHIR_API_URL}/Binary/${row.id}`,
                      httpHeaders: {
                        Accept: 'application/pdf',
                        Authorization: `Bearer ${localStorage.getItem(
                          'access'
                        )}`
                      }
                    }}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  >
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                    ))}
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
            </IconButton>
          </Grid>
        </Grid>
      </Grid>

      {showText && (
        <Grid container item>
          {row.section.map((section) => (
            <Grid key={section.title} container item direction="column">
              <Typography variant="h6">{section.title}</Typography>
              <Typography
                dangerouslySetInnerHTML={{ __html: section.text.div }}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  )
}

DocumentRow.propTypes = {
  showText: PropTypes.bool,
  showIpp: PropTypes.bool,
  row: PropTypes.shape({
    id: PropTypes.string,
    idPatient: PropTypes.string,
    securityLabel: PropTypes.array,
    date: PropTypes.string,
    type: PropTypes.object,
    title: PropTypes.string,
    status: PropTypes.string,
    content: PropTypes.array,
    section: PropTypes.array,
    encounterStatus: PropTypes.string,
    NDA: PropTypes.string,
    IPP: PropTypes.string,
    serviceProvider: PropTypes.string
  })
}

const DocumentTable = memo((props) => {
  const classes = useStyles()

  return props.loading ? (
    <CircularProgress className={classes.loadingSpinner} size={50} />
  ) : (
    <>
      {props.documents ? (
        <Grid component={Paper} container direction="column" justify="center">
          {props.documents.map((row) => (
            <DocumentRow
              key={row.id}
              row={row}
              showText={props.searchMode}
              showIpp={props.showIpp}
            />
          ))}
        </Grid>
      ) : (
        <Grid container justify="center">
          <Typography variant="button"> Aucun document à afficher </Typography>
        </Grid>
      )}
    </>
  )
})

DocumentTable.displayName = DocumentTable

DocumentTable.propTypes = {
  loading: PropTypes.bool,
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
          attachment: PropTypes.shape({ url: PropTypes.string })
        })
      )
    })
  ).isRequired,
  page: PropTypes.number.isRequired,
  documentLines: PropTypes.number.isRequired,
  searchMode: PropTypes.bool,
  showIpp: PropTypes.bool
}

export default DocumentTable
