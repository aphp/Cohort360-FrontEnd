import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core'

import { ReactComponent as CancelIcon } from 'assets/icones/times.svg'
import { ReactComponent as CheckIcon } from 'assets/icones/check.svg'
import { ReactComponent as PdfIcon } from 'assets/icones/file-pdf.svg'

import { FHIR_API_URL } from '../../../../constants'

import useStyles from './styles'
import { CohortComposition } from 'types'
import {
  CompositionStatusKind,
  DocumentReferenceStatusKind,
  IDocumentReference
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { getDocumentStatus } from 'utils/documentsFormatter'
import services from 'services'
// import { fetchDocumentContent } from 'services/cohortInfos'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

type DocumentRowTypes = {
  deidentified: boolean
  document: CohortComposition | IDocumentReference
}
const DocumentRow: React.FC<DocumentRowTypes> = ({ deidentified, document }) => {
  const classes = useStyles()
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false)
  const [numPages, setNumPages] = useState<number>()
  const [loading, setLoading] = useState(false)
  const [documentContent, setDocumentContent] = useState<any>([])

  const openPdfDialog = async (documentId?: string) => {
    setDocumentDialogOpen(true)
    if (deidentified && documentId) {
      setLoading(true)
      const doc = await services.cohorts.fetchDocumentContent(documentId)
      if (doc) {
        setLoading(false)
        setDocumentContent(doc)
      } else {
        setLoading(false)
        setDocumentContent(null)
      }
    }
  }

  const row = {
    ...document,
    NDA:
      document.resourceType === 'Composition'
        ? document.NDA
        : document.securityLabel?.[0].coding?.[0].display ?? document.securityLabel?.[0].coding?.[0].code ?? '-',
    title: document.resourceType === 'Composition' ? document.title ?? '-' : document.description ?? '-',
    serviceProvider: document.resourceType === 'Composition' ? document.serviceProvider : '-',
    type: document.type?.coding?.[0].display ?? document.type?.coding?.[0].code ?? '-'
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
    } else {
      return (
        <Chip
          className={classes.cancelledChip}
          icon={<CancelIcon height="15px" fill="#FFF" />}
          label={getDocumentStatus(type)}
        />
      )
    }
  }

  return (
    <>
      <TableRow key={row.id} className={classes.tableBodyRows}>
        <TableCell align="left">{row.NDA}</TableCell>
        <TableCell align="left">
          {row.date ? new Date(row.date).toLocaleDateString('fr-FR') : 'Date inconnue'}
        </TableCell>
        <TableCell align="left">{row.type}</TableCell>
        <TableCell align="left" className={classes.description}>
          {row.title}
        </TableCell>
        <TableCell align="center">{row.serviceProvider}</TableCell>
        <TableCell align="center">{getStatusShip(row.status)}</TableCell>
        <TableCell align="center">
          <IconButton onClick={() => openPdfDialog(row.id)}>
            <PdfIcon height="30px" fill="#ED6D91" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Dialog open={documentDialogOpen} onClose={() => setDocumentDialogOpen(false)} maxWidth="xl">
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
                      <Typography key={section.title} dangerouslySetInnerHTML={{ __html: section.text?.div ?? '' }} />
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
          <Button onClick={() => setDocumentDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

type DocumentTableTypes = {
  deidentified: boolean
  documents?: (CohortComposition | IDocumentReference)[]
  page: number
  documentLines: number
}
const DocumentTable: React.FC<DocumentTableTypes> = ({ deidentified, documents, page, documentLines }) => {
  const classes = useStyles()
  return (
    <>
      {documents && documents.length > 0 ? (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell align="left" className={classes.tableHeadCell}>
                  {deidentified ? 'NDA chiffré' : 'NDA'}
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
              {documents.slice((page - 1) * documentLines, page * documentLines).map((document, index) => (
                <DocumentRow key={`docRow ${index}`} document={document} deidentified={deidentified} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container justify="center">
          <Typography variant="button"> Aucun document à afficher </Typography>
        </Grid>
      )}
    </>
  )
}

export default DocumentTable
