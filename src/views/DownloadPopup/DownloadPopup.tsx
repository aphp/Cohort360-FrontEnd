import React, { useEffect, useState } from 'react'

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  Typography
} from '@mui/material'
import useStyles from './styles'
import apiBackend from '../../services/apiBackend'
import { useNavigate, useParams } from 'react-router-dom'

const DownloadPopup: React.FC = () => {
  const navigate = useNavigate()
  const { resource } = useParams<{ resource?: 'exports' | 'feasibility-studies' }>()
  const { itemId } = useParams<{ itemId?: string }>()
  const { classes } = useStyles()
  const [open, setOpen] = useState<boolean>(true)
  const [downloading, setDownloading] = useState<boolean | null>(false)

  const extractFilename = (contentDisposition: string): string => {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    const matches = filenameRegex.exec(contentDisposition)
    let default_filename = 'Download.zip'
    if (matches != null && matches[1]) {
      default_filename = matches[1].replace(/['"]/g, '')
    }
    return default_filename
  }

  const downloadItem = async (itemId: string) => {
    try {
      setDownloading(true)
      let path = `/${resource}/${itemId}/download/`
      if (resource === 'feasibility-studies') {
        path = `/cohort/${resource}/${itemId}/download/`
      }
      const downloadResponse = await apiBackend.get(path, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.progress === 1) setDownloading(null)
        }
      })

      if (downloadResponse.status !== 200) {
        setDownloading(false)
        return
      }

      const filename = extractFilename(downloadResponse.headers['content-disposition'])

      const blob = new Blob([downloadResponse.data], { type: 'application/zip' })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)

      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      setDownloading(false)
    }
  }

  useEffect(() => {
    if (itemId) downloadItem(itemId)
  }, [itemId])

  const _quit = () => {
    setOpen(false)
    navigate('/', { replace: true })
  }

  const _continueToHome = () => {
    setOpen(false)
    navigate('/home', { replace: true })
  }

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={'sm'}
      aria-describedby="alert-dialog-description"
      classes={{ paper: classes.exportDownloadDialog }}
    >
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <Grid className={classes.exportDownloadProgress}>
            {downloading !== null ? (
              downloading ? (
                <Typography variant="h2" color="primary">
                  Téléchargement en cours...
                </Typography>
              ) : (
                <Typography variant="h2" color="secondary">
                  Erreur lors du téléchargement
                </Typography>
              )
            ) : (
              <Typography variant="h2" color="primary">
                Téléchargement terminé!
              </Typography>
            )}
            {downloading ? <CircularProgress /> : null}
          </Grid>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={_quit} color="secondary">
          Quitter
        </Button>
        <Button onClick={_continueToHome} variant="contained">
          Continuer sur Cohort360
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DownloadPopup
