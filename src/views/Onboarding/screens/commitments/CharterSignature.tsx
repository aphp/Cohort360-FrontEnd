import { Box, Link, Typography } from '@mui/material'
import React from 'react'

import useStyles from '../../styles'

const CHARTER_PDF_URL = '/documents/charte-engagement-cohort360.pdf'
const CHARTER_PDF_EMBED_URL = `${CHARTER_PDF_URL}#navpanes=0&toolbar=0&statusbar=0&view=FitH`

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
          data={CHARTER_PDF_EMBED_URL}
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
