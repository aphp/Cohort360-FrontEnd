import { Box, Link, Typography } from '@mui/material'
import React from 'react'

import useStyles from '../../styles'

// Served from `public/` so the document can be swapped without rebuilding the app.
export const CHARTER_PDF_URL = '/documents/charte-engagement-cohort360.pdf'

const CharterSignature = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h3" className={classes.bareTitle}>
        Signer la charte d'engagement
      </Typography>
      <Box className={classes.documentViewer}>
        <object
          className={classes.documentFrame}
          data={CHARTER_PDF_URL}
          type="application/pdf"
          aria-label="Charte d'engagement Cohort360"
        >
          <Box className={classes.documentFallback}>
            <Typography>Votre navigateur ne peut pas afficher la charte directement.</Typography>
            <Link className={classes.link} href={CHARTER_PDF_URL} target="_blank" rel="noopener noreferrer">
              Ouvrir la charte d'engagement
            </Link>
          </Box>
        </object>
      </Box>
    </Box>
  )
}

export default CharterSignature
