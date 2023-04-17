import React, { useState, useEffect } from 'react'
import { Buffer } from 'buffer'
import ReactHtmlParser from 'react-html-parser'

import { IDocumentReference } from '@ahryman40k/ts-fhir-types/lib/R4'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { Document, Page, pdfjs } from 'react-pdf'
import { FHIR_API_URL } from '../../constants'
import services from 'services/aphp'

import Watermark from 'assets/images/watermark_pseudo.svg'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

type DocumentViewerProps = {
  deidentified?: boolean
  open: boolean
  handleClose: () => void
  documentId: string
  list?: string[]
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ deidentified, open, handleClose, documentId }) => {
  const [documentContent, setDocumentContent] = useState<IDocumentReference | null>(null)
  const [numPages, setNumPages] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const _fetchDocumentContent = async () => {
      setLoading(true)
      if (loading || !documentId || !open) return setLoading(false)

      const documentContent = await services.cohorts.fetchDocumentContent(documentId)
      if (documentContent) {
        setDocumentContent(documentContent)
      }
      setLoading(false)
    }

    if (deidentified) {
      _fetchDocumentContent()
    }

    return () => {
      setDocumentContent(null)
      setNumPages(1)
    }
  }, [open, documentId])

  const pdfViewerContainerStyle = {
    width: '75%',
    zoom: 0.75,
    margin: 'auto'
  }

  const documentContentDecode = documentContent?.content?.[1].attachment?.data
    ? Buffer.from(documentContent.content[1].attachment.data, 'base64').toString('utf-8')
    : ''

  return (
    <Dialog open={open} fullWidth maxWidth="xl" onClose={handleClose}>
      <DialogTitle id="document-viewer-dialog-title"></DialogTitle>
      <DialogContent id="document-viewer-dialog-content">
        {deidentified ? (
          loading ? (
            <DialogContent id="document-viewer-dialog-content">
              <CircularProgress />
            </DialogContent>
          ) : (
            <div style={{ backgroundImage: `url(${Watermark})` }}>
              {documentContentDecode ? (
                <Typography>{ReactHtmlParser(documentContentDecode)}</Typography>
              ) : (
                <Typography>Le contenu du document est introuvable.</Typography>
              )}
            </div>
          )
        ) : (
          <Grid style={pdfViewerContainerStyle}>
            <Document
              error={'Le document est introuvable.'}
              loading={'PDF en cours de chargement...'}
              file={{
                url: `${FHIR_API_URL}/Binary/${documentId}`,
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
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DocumentViewer
