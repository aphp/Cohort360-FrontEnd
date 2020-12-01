import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import { Document, Page } from 'react-pdf'

import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Paper,
  Typography
} from '@material-ui/core'

import DescriptionIcon from '@material-ui/icons/Description'
import LocalHospitalIcon from '@material-ui/icons/LocalHospital'
import ContactsIcon from '@material-ui/icons/Contacts'
import { ReactComponent as PdfIcon } from '../../../../assets/icones/file-pdf.svg'
import { ReactComponent as CheckIcon } from '../../../../assets/icones/check.svg'
import { ReactComponent as CancelIcon } from '../../../../assets/icones/times.svg'
import { ReactComponent as UserIcon } from '../../../../assets/icones/user.svg'
import { ReactComponent as SearchIcon } from '../../../../assets/icones/search.svg'

import { FHIR_API_URL } from '../../../../constants'
import { CohortComposition } from 'types'
import {
  CompositionStatusKind,
  DocumentReferenceStatusKind,
  EncounterStatusKind,
  IEncounter,
  IDocumentReference
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { getDocumentStatus, getEncounterStatus } from 'utils/documentsFormatter'

import useStyles from './styles'

type DocumentRowTypes = {
  document: CohortComposition | IDocumentReference
  documentEncounter?: IEncounter
  showText: boolean
  showIpp: boolean
  deidentified: boolean
}
const DocumentRow: React.FC<DocumentRowTypes> = ({ document, documentEncounter, showText, showIpp, deidentified }) => {
  const history = useHistory()
  const classes = useStyles()
  const [pdfDialogOpen, setDocumentDialogOpen] = useState(false)
  const [noPdfDialogOpen, setNoPdfDocumentDialogOpen] = useState(false)
  const [numPages, setNumPages] = useState<number>()

  const openPdfDialog = () => {
    if (deidentified) {
      setNoPdfDocumentDialogOpen(true)
    } else {
      setDocumentDialogOpen(true)
    }
  }

  const handleClosePdfDialog = () => {
    if (deidentified) {
      setNoPdfDocumentDialogOpen(false)
    } else {
      setDocumentDialogOpen(false)
    }
  }

  const getStatusShip = (type?: CompositionStatusKind | DocumentReferenceStatusKind) => {
    if (type === 'final' || type === 'current') {
      return (
        <Chip
          className={classes.validChip}
          icon={<CheckIcon height="15px" fill="#FFF" />}
          label={getDocumentStatus(type)}
        />
      )
    } else if (type === 'entered-in-error') {
      return (
        <Chip
          className={classes.cancelledChip}
          icon={<CancelIcon height="15px" fill="#FFF" />}
          label={getDocumentStatus(type)}
        />
      )
    } else {
      return ''
    }
  }

  const row = {
    ...document,
    title: document.resourceType === 'Composition' ? document.title : document.description ?? '-',
    IPP:
      document.resourceType === 'Composition' ? document.IPP ?? 'inconnu' : document.subject?.identifier?.value ?? '-',
    idPatient:
      document.resourceType === 'Composition' ? document.idPatient : document.subject?.reference?.split('/')[1] ?? '-',
    NDA:
      document.resourceType === 'Composition'
        ? document.NDA ?? 'inconnu'
        : document.context?.encounter?.[0].identifier?.value ?? '-',
    serviceProvider:
      document.resourceType === 'Composition'
        ? document.serviceProvider ?? 'non renseigné'
        : documentEncounter?.serviceProvider?.display ?? '-',
    encounterStatus:
      document.resourceType === 'Composition'
        ? getEncounterStatus(document.encounterStatus as EncounterStatusKind)
        : getEncounterStatus(documentEncounter?.status) ?? '-',
    section: document.resourceType === 'Composition' ? document.section : []
  }
  const date = row.date ? new Date(row.date).toLocaleDateString('fr-FR') : ''
  const hour = row.date
    ? new Date(row.date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : ''

  return (
    <Grid container item direction="column" className={classes.row}>
      <Grid container item>
        <Grid container item direction="column" justify="center" xs={4}>
          <Typography variant="button">{row.title}</Typography>
          <Typography>
            {date} {hour}
          </Typography>
          {getStatusShip(row.status)}
        </Grid>
        <Grid container item xs={8} justify="space-around">
          {showIpp && (
            <Grid container item xs={3} alignItems="center" justify="center">
              <UserIcon height="25px" fill="#5BC5F2" />
              <Grid container item direction="column" xs={6} className={classes.textGrid}>
                <Typography variant="button">{deidentified ? 'ID Patient' : 'IPP'}</Typography>
                <Grid container item alignItems="center">
                  <Typography>{row.IPP}</Typography>
                  <IconButton onClick={() => history.push(`/patients/${row.idPatient}`)} className={classes.searchIcon}>
                    <SearchIcon height="15px" fill="#ED6D91" />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          )}
          <Grid container item xs={2} alignItems="center" justify="center">
            <DescriptionIcon htmlColor="#5BC5F2" className={classes.iconSize} />
            <Grid container item direction="column" xs={6} className={classes.textGrid}>
              <Typography variant="button">{deidentified ? 'ID Visite' : 'NDA'}</Typography>
              <Typography>{row.NDA}</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={4} alignItems="center" justify="center">
            <LocalHospitalIcon htmlColor="#5BC5F2" className={classes.iconSize} />
            <Grid container item direction="column" xs={6} className={classes.textGrid}>
              <Typography variant="button">Unité exécutrice</Typography>
              <Typography>{row.serviceProvider}</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={2} alignItems="center" justify="center">
            <ContactsIcon htmlColor="#5BC5F2" className={classes.iconSize} />
            <Grid container item direction="column" xs={6} className={classes.textGrid}>
              <Typography variant="button">Visite</Typography>
              <Typography>{row.encounterStatus}</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={1} justify="center">
            <IconButton onClick={openPdfDialog}>
              <PdfIcon height="30px" fill="#ED6D91" />
            </IconButton>
            <Dialog open={noPdfDialogOpen} onClose={() => handleClosePdfDialog()}>
              <DialogContent>Fonctionnalité désactivée en mode pseudonymisé.</DialogContent>
              <DialogActions>
                <Button onClick={() => handleClosePdfDialog()}>OK</Button>
              </DialogActions>
            </Dialog>

            <Dialog open={pdfDialogOpen} onClose={() => handleClosePdfDialog()} maxWidth="md">
              <DialogContent>
                <Document
                  file={{
                    url: `${FHIR_API_URL}/Binary/${row.id}`,
                    httpHeaders: {
                      Accept: 'application/pdf',
                      Authorization: `Bearer ${localStorage.getItem('access')}`
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
                <Button onClick={() => handleClosePdfDialog()} color="primary">
                  Fermer
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Grid>
      </Grid>

      {showText && (
        <Grid container item>
          {row.section?.map((section) => (
            <Grid key={section.title} container item direction="column">
              <Typography variant="h6">{section.title}</Typography>
              <Typography dangerouslySetInnerHTML={{ __html: section.text?.div ?? '' }} />
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  )
}

type DocumentTableTypes = {
  loading: boolean
  documents?: (CohortComposition | IDocumentReference)[]
  encounters?: IEncounter[]
  searchMode: boolean
  showIpp: boolean
  deidentified: boolean
}
const DocumentTable: React.FC<DocumentTableTypes> = React.memo(
  ({ loading, documents, searchMode, showIpp, encounters, deidentified }) => {
    const classes = useStyles()
    return loading ? (
      <CircularProgress className={classes.loadingSpinner} size={50} />
    ) : (
      <>
        {documents && documents.length > 0 ? (
          <Grid component={Paper} container direction="column" justify="center">
            {documents.map((row) => {
              let relatedEncounter: IEncounter | undefined = undefined
              if (row.resourceType === 'DocumentReference') {
                relatedEncounter = encounters
                  ? encounters.find(
                      (encounter) => encounter.id === row.context?.encounter?.[0].reference?.split('/')[1]
                    )
                  : undefined
              }
              return (
                <DocumentRow
                  key={row.id}
                  document={row}
                  showText={searchMode}
                  showIpp={showIpp}
                  documentEncounter={relatedEncounter}
                  deidentified={deidentified}
                />
              )
            })}
          </Grid>
        ) : (
          <Grid container justify="center">
            <Typography variant="button"> Aucun document à afficher </Typography>
          </Grid>
        )}
      </>
    )
  }
)

export default DocumentTable
