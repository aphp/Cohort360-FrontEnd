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
  Modal,
  Paper,
  Typography
} from '@material-ui/core'
import ImageIcon from '@material-ui/icons/Image'

import DescriptionIcon from '@material-ui/icons/Description'
import LocalHospitalIcon from '@material-ui/icons/LocalHospital'
import ContactsIcon from '@material-ui/icons/Contacts'
import { ReactComponent as PdfIcon } from '../../../../assets/icones/file-pdf.svg'
import { ReactComponent as CheckIcon } from '../../../../assets/icones/check.svg'
import { ReactComponent as CancelIcon } from '../../../../assets/icones/times.svg'
import { ReactComponent as UserIcon } from '../../../../assets/icones/user.svg'
import { ReactComponent as SearchIcon } from '../../../../assets/icones/search.svg'

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
import { FILES_SERVER_URL } from '../../../../constants'

type DocumentRowTypes = {
  groupId?: string
  document: CohortComposition | IDocumentReference
  documentEncounter?: IEncounter
  showText: boolean
  showIpp: boolean
  deidentified?: boolean
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
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false)

  const handleImageOpen = () => setIsImageOpen(true)
  const handleImageClose = () => setIsImageOpen(false)

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
    title: document.description ?? '-',
    IPP:
      document.resourceType === 'DocumentReference'
        ? (document as CohortComposition).IPP ?? 'inconnu'
        : document.subject?.identifier?.value ?? '-',
    idPatient:
      document.resourceType === 'DocumentReference'
        ? (document as CohortComposition).idPatient
        : document.subject?.reference?.split('/')[1] ?? '-',
    NDA:
      document.resourceType === 'DocumentReference'
        ? (document as CohortComposition).NDA ?? 'inconnu'
        : document.context?.encounter?.[0].identifier?.value ?? '-',
    serviceProvider:
      document.resourceType === 'DocumentReference'
        ? (document as CohortComposition).serviceProvider ?? 'non renseigné'
        : documentEncounter?.serviceProvider?.display ?? '-',
    encounterStatus:
      document.resourceType === 'DocumentReference'
        ? getEncounterStatus((document as CohortComposition).encounterStatus as EncounterStatusKind)
        : getEncounterStatus(documentEncounter?.status) ?? '-'
    // section: document.resourceType === 'DocumentReference' ? document.section : []
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
          <Typography variant="button">{row.title ?? 'Document sans titre'}</Typography>
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
                <Typography variant="button">{deidentified ? 'IPP chiffré' : 'IPP'}</Typography>
                <Grid container item alignItems="center">
                  <Typography>{row.IPP}</Typography>
                  <IconButton
                    onClick={() => history.push(`/patients/${row.idPatient}${groupId ? `?groupId=${groupId}` : ''}`)}
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
            <Grid container item direction="column" xs={6} className={classes.textGrid}>
              <Typography variant="button">{deidentified ? 'NDA chiffré' : 'NDA'}</Typography>
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
          {!deidentified && (
            <Grid container item xs={1} justify="center">
              {row.content && row.content[0] && row.content[0].attachment?.url?.endsWith('.pdf') ? (
                <IconButton onClick={() => openPdfDialog(row.id)}>
                  <PdfIcon height="30px" fill="#ED6D91" />
                </IconButton>
              ) : (
                row.content &&
                row.content[0] && (
                  <>
                    <IconButton type="button" onClick={handleImageOpen}>
                      <ImageIcon />
                    </IconButton>
                    <Modal open={isImageOpen} onClose={handleImageClose}>
                      <img
                        className={classes.img}
                        src={`${FILES_SERVER_URL}${row.content[0].attachment?.url?.replace(/^file:\/\//, '')}`}
                        alt={row.description}
                      />
                    </Modal>
                  </>
                )
              )}
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
                  {!deidentified && row.content && row.content[0].attachment?.url?.endsWith('.pdf') && (
                    <Document
                      error={'Le document est introuvable.'}
                      loading={'PDF en cours de chargement...'}
                      file={{
                        url: `${FILES_SERVER_URL}${row.content[0].attachment?.url?.replace(/^file:\/\//, '')}`,
                        httpHeaders: {
                          Accept: 'application/pdf'
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
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* FIXME: commented out because of typing incompatibility */}
      {/*{CONTEXT === 'aphp' && showText && (*/}
      {/*  <Grid container item>*/}
      {/*    {row.section?.map((section) => (*/}
      {/*      <Grid key={section.title} container item direction="column">*/}
      {/*        <Typography variant="h6">{section.title}</Typography>*/}
      {/*        <Typography dangerouslySetInnerHTML={{ __html: section.text?.div ?? '' }} />*/}
      {/*      </Grid>*/}
      {/*    ))}*/}
      {/*  </Grid>*/}
      {/*)}*/}
    </Grid>
  )
}

type DocumentTableTypes = {
  groupId?: string
  loading: boolean
  documents?: (CohortComposition | IDocumentReference)[]
  encounters?: IEncounter[]
  searchMode: boolean
  showIpp: boolean
  deidentified?: boolean
}
const DocumentTable: React.FC<DocumentTableTypes> = React.memo(
  ({ groupId, loading, documents, searchMode, showIpp, encounters, deidentified }) => {
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
                  groupId={groupId}
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
