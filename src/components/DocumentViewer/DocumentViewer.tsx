import { Buffer } from 'buffer'
import Parse from 'html-react-parser'
import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Grid from '@mui/material/Grid'
import { TabsWrapper } from 'components/ui/Tabs'
import Typography from '@mui/material/Typography'

import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import services from 'services/aphp'
import { ACCESS_TOKEN } from '../../constants'

import { Tab } from '@mui/material'
import Watermark from 'assets/images/watermark_pseudo.svg?react'
import { DocumentReference } from 'fhir/r4'
import { getAuthorizationMethod } from 'services/apiFhir'
import { getConfig } from 'config'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type DocumentViewerProps = {
  deidentified?: boolean
  open: boolean
  handleClose: () => void
  documentId: string
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ deidentified, open, handleClose, documentId }) => {
  const [documentContent, setDocumentContent] = useState<DocumentReference | null>(null)
  const [numPages, setNumPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'pdf' | 'raw'>(!deidentified ? (documentId ? 'pdf' : 'raw') : 'raw')
  const gridRef: React.RefObject<HTMLDivElement | null> = useRef(null)
  const [gridWidth, setGridWidth] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'pdf' | 'raw') => {
    setSelectedTab(newValue)
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
            <TabsWrapper value={selectedTab} onChange={handleTabChange} customVariant={'secondary'}>
              {!deidentified && <Tab label="PDF" value="pdf" />}
              <Tab label="Texte brut pseudonymisé" value="raw" />
            </TabsWrapper>
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
                <Grid id="salut" ref={gridRef} style={pdfViewerContainerStyle}>
                  <div id="document">
                    <Document
                      error={'Le document est introuvable.'}
                      loading={'PDF en cours de chargement...'}
                      file={url}
                      options={options}
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    >
                      <div id="array">
                        {Array.from(new Array(numPages), (el, index) => (
                          <div id="page" key={index + 1}>
                            <Page
                              width={gridWidth}
                              key={`page_${index + 1}`}
                              pageNumber={index + 1}
                              loading={'Pages en cours de chargement...'}
                              renderAnnotationLayer={false}
                            />
                          </div>
                        ))}
                      </div>
                    </Document>
                  </div>
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
