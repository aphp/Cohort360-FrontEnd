import { Buffer } from 'buffer'
import Parse from 'html-react-parser'
import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { Document, Page, pdfjs } from 'react-pdf'
import services from 'services/aphp'
import { ACCESS_TOKEN } from '../../constants'

import { Tab, Tabs } from '@mui/material'
import Watermark from 'assets/images/watermark_pseudo.svg?react'
import { DocumentReference } from 'fhir/r4'
import { getAuthorizationMethod } from 'services/apiFhir'
import { getConfig } from 'config'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

type DocumentViewerProps = {
  deidentified?: boolean
  open: boolean
  handleClose: () => void
  documentId: string
  list?: string[]
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ deidentified, open, handleClose, documentId }) => {
  const [documentContent, setDocumentContent] = useState<DocumentReference | null>(null)
  const [numPages, setNumPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedValue] = useState<'pdf' | 'raw'>(!deidentified ? (documentId ? 'pdf' : 'raw') : 'raw')
  const gridRef: React.RefObject<HTMLDivElement> = useRef(null)
  const [gridWidth, setGridWidth] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'pdf' | 'raw') => {
    setSelectedValue(newValue)
  }

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

    _fetchDocumentContent()

    return () => {
      setDocumentContent(null)
      setNumPages(1)
    }
  }, [open, documentId])

  const handleResize = () => {
    if (gridRef.current) {
      setGridWidth(gridRef.current?.offsetWidth)
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useLayoutEffect(() => {
    handleResize()
  }, [gridRef.current])

  const pdfViewerContainerStyle = {
    width: '75%',
    zoom: 0.75,
    margin: 'auto'
  }

  const url = useMemo(() => {
    const apiUrl = getConfig().system.fhirUrl
    return { url: `${apiUrl}/Binary/${documentId}` }
  }, [documentId])

  const options = useMemo(() => {
    return {
      cMapUrl: '/cmaps/',
      standardFontDataUrl: '/standard_fonts/',
      httpHeaders: {
        Accept: 'application/pdf',
        Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        authorizationMethod: getAuthorizationMethod()
      }
    }
  }, [])

  const findContent = documentContent?.content?.find((content) => content.attachment?.contentType === 'text/plain')

  const documentContentDecode =
    findContent?.attachment.data != undefined
      ? Buffer.from(findContent.attachment.data, 'base64').toString('utf-8')
      : ''

  return (
    <Dialog open={open} fullWidth maxWidth="xl" onClose={handleClose}>
      <DialogContent id="document-viewer-dialog-content">
        {loading ? (
          <DialogContent id="document-viewer-dialog-content">
            <CircularProgress />
          </DialogContent>
        ) : (
          <>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              {!deidentified && <Tab label="PDF" value="pdf" />}
              <Tab label="Texte brut pseudonymisé" value="raw" />
            </Tabs>
            <>
              {selectedTab === 'raw' && (
                <div style={{ backgroundImage: `url(${Watermark})` }}>
                  {documentContentDecode ? (
                    <Typography>{Parse(documentContentDecode)}</Typography>
                  ) : (
                    <Typography>Le contenu du document est introuvable.</Typography>
                  )}
                </div>
              )}
            </>
            <>
              {selectedTab === 'pdf' && (
                <Grid ref={gridRef} style={pdfViewerContainerStyle}>
                  <Document
                    error={'Le document est introuvable.'}
                    loading={'PDF en cours de chargement...'}
                    file={url}
                    options={options}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  >
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page
                        width={gridWidth}
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        loading={'Pages en cours de chargement...'}
                      />
                    ))}
                  </Document>
                </Grid>
              )}
            </>
          </>
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
