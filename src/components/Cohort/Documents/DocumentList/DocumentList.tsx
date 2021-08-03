import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import clsx from 'clsx'

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
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell
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
import { fetchDocumentContent } from 'services/cohortInfos'
import { getDocumentStatus, getEncounterStatus } from 'utils/documentsFormatter'

import useStyles from './styles'

type DocumentRowTypes = {
  groupId?: string
  document: CohortComposition | IDocumentReference
  documentEncounter?: IEncounter
  showText: boolean
  showIpp: boolean
  deidentified: boolean | null
}
const DocumentRow: React.FC<DocumentRowTypes> = ({
  groupId,
  document,
  documentEncounter,
  showText,
  showIpp,
  deidentified
}) => {
  const history = useHistory()
  const classes = useStyles()
  const [pdfDialogOpen, setDocumentDialogOpen] = useState(false)
  const [numPages, setNumPages] = useState<number>()
  const [loading, setLoading] = useState(false)
  const [documentContent, setDocumentContent] = useState<any>([])

  const openPdfDialog = (documentId?: string) => {
    setDocumentDialogOpen(true)
    if (deidentified && documentId) {
      setLoading(true)
      fetchDocumentContent(documentId)
        .then((doc) => {
          setLoading(false)
          setDocumentContent(doc)
        })
        .catch(() => {
          setLoading(false)
          setDocumentContent(null)
        })
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
    <>
      <TableRow className={classes.row}>
        <TableCell>
          <Typography variant="button">{row.title ?? 'Document sans titre'}</Typography>
          <Typography>
            {date} {hour}
          </Typography>
          {getStatusShip(row.status)}
        </TableCell>

        {showIpp && (
          <TableCell>
            <Grid container alignItems="center" wrap="nowrap">
              <UserIcon height="25px" fill="#5BC5F2" className={classes.iconMargin} />
              <Typography>{row.IPP}</Typography>
              <IconButton
                onClick={() => history.push(`/patients/${row.idPatient}${groupId ? `?groupId=${groupId}` : ''}`)}
                className={classes.searchIcon}
              >
                <SearchIcon height="15px" fill="#ED6D91" className={classes.iconMargin} />
              </IconButton>
            </Grid>
          </TableCell>
        )}

        <TableCell>
          <Grid container alignItems="center" wrap="nowrap">
            <DescriptionIcon htmlColor="#5BC5F2" className={clsx(classes.iconSize, classes.iconMargin)} />
            <Typography>{row.NDA}</Typography>
          </Grid>
        </TableCell>

        <TableCell>
          <Grid container alignItems="center" wrap="nowrap">
            <LocalHospitalIcon htmlColor="#5BC5F2" className={clsx(classes.iconSize, classes.iconMargin)} />
            <Typography>{row.serviceProvider}</Typography>
          </Grid>
        </TableCell>

        <TableCell>
          <Grid container alignItems="center" wrap="nowrap">
            <ContactsIcon htmlColor="#5BC5F2" className={clsx(classes.iconSize, classes.iconMargin)} />
            <Typography style={{ textTransform: 'capitalize' }}>{row.encounterStatus}</Typography>
          </Grid>
        </TableCell>

        <TableCell>
          <IconButton onClick={() => openPdfDialog(row.id)}>
            <PdfIcon height="30px" fill="#ED6D91" />
          </IconButton>

          <Dialog open={pdfDialogOpen} onClose={() => setDocumentDialogOpen(false)} maxWidth="xl">
            <DialogContent className={classes.dialogContent}>
              {deidentified &&
                (loading ? (
                  <CircularProgress className={classes.loadingDialog} />
                ) : (
                  <>
                    {documentContent &&
                      documentContent.map((section: any) => (
                        <>
                          <Typography variant="h6">{section.title}</Typography>
                          <Typography
                            key={section.title}
                            dangerouslySetInnerHTML={{ __html: section.text?.div ?? '' }}
                          />
                        </>
                      ))}
                    {!documentContent && <Typography>Le contenu du document est introuvable.</Typography>}
                  </>
                ))}
              {!deidentified && (
                <Document
                  error={'Le document est introuvable.'}
                  loading={'PDF en cours de chargement...'}
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
                    <Page
                      width={window.innerWidth * 0.9}
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      loading={'Pages en cours de chargement...'}
                    />
                  ))}
                </Document>
              )}
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={() => setDocumentDialogOpen(false)}>
                Fermer
              </Button>
            </DialogActions>
          </Dialog>
        </TableCell>
      </TableRow>

      {showText && (
        <TableRow>
          {row.section?.map((section) => (
            <TableCell key={section.title} colSpan={6}>
              <Typography variant="h6">{section.title}</Typography>
              <Typography dangerouslySetInnerHTML={{ __html: section.text?.div ?? '' }} />
            </TableCell>
          ))}
        </TableRow>
      )}
    </>
  )
}

type DocumentTableTypes = {
  groupId?: string
  loading: boolean
  documents?: (CohortComposition | IDocumentReference)[]
  encounters?: IEncounter[]
  searchMode: boolean
  showIpp: boolean
  deidentified: boolean | null
}
const DocumentTable: React.FC<DocumentTableTypes> = React.memo(
  ({ groupId, loading, documents, searchMode, showIpp, encounters, deidentified }) => {
    const classes = useStyles()
    return loading ? (
      <CircularProgress className={classes.loadingSpinner} size={50} />
    ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className={classes.tableHead}>
              <TableCell align="center" className={classes.tableHeadCell}>
                <Typography variant="button">Nom / date</Typography>
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                <Grid container alignItems="center" justify="center">
                  <Typography style={{ marginLeft: 4 }} variant="button">
                    {deidentified ? 'IPP chiffré' : 'IPP'}
                  </Typography>
                </Grid>
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                <Grid container alignItems="center" justify="center">
                  <Typography style={{ marginLeft: 4 }} variant="button">
                    {deidentified ? 'NDA chiffré' : 'NDA'}
                  </Typography>
                </Grid>
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                <Grid container alignItems="center" justify="center">
                  <Typography style={{ marginLeft: 4 }} variant="button">
                    Unité exécutrice
                  </Typography>
                </Grid>
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                <Grid container alignItems="center" justify="center">
                  <Typography style={{ marginLeft: 4 }} variant="button">
                    Visite
                  </Typography>
                </Grid>
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                <Grid container alignItems="center" justify="center">
                  <Typography style={{ marginLeft: 4 }} variant="button">
                    Aperçu
                  </Typography>
                </Grid>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents && documents.length > 0 ? (
              documents.map((row) => {
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
                    groupId={groupId}
                    document={row}
                    showText={searchMode}
                    showIpp={showIpp}
                    documentEncounter={relatedEncounter}
                    deidentified={deidentified}
                  />
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Grid container justify="center">
                    <Typography variant="button"> Aucun document à afficher </Typography>
                  </Grid>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
)

export default DocumentTable
