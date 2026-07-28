import { Box, Checkbox, Divider, FormControlLabel, Link, Typography } from '@mui/material'
import React from 'react'

import { useOnboarding } from '../../OnboardingContext'
import useStyles from '../../styles'

const CHARTER_PDF_URL = '/documents/charte-engagement-cohort360.pdf'
const CHARTER_PDF_EMBED_URL = `${CHARTER_PDF_URL}#navpanes=0&toolbar=0&statusbar=0&view=FitH`

export const CHARTER_CONSENT_TEXT =
  'Je certifie avoir pris connaissance de mes responsabilités vis-à-vis de l’utilisation des données mises à disposition dans Cohort360 et je m’engage à les respecter.'

const CharterSignature = () => {
  const { classes } = useStyles()
  const { acknowledged, setAcknowledged } = useOnboarding()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
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
            <Typography className={classes.rowLabel}>
              Votre navigateur ne peut pas afficher la charte directement.
            </Typography>
            <Link className={classes.link} href={CHARTER_PDF_URL} target="_blank" rel="noopener noreferrer">
              Ouvrir la charte d'engagement
            </Link>
          </Box>
        </object>
      </Box>
      <Box className={classes.linkRow}>
        <Link className={classes.link} href={CHARTER_PDF_URL} download>
          Télécharger une copie de la charte d'engagement
        </Link>
      </Box>
      <Divider className={classes.divider} />
      <FormControlLabel
        className={classes.consentRow}
        control={
          <Checkbox
            className={classes.consentCheckbox}
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
        }
        label={<Typography className={classes.consentText}>{CHARTER_CONSENT_TEXT}</Typography>}
      />
    </Box>
  )
}

export default CharterSignature
