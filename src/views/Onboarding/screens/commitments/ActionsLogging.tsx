import ActionsLoggingArtwork from 'assets/images/onboarding/actions-logging.svg?react'
import { Box, Link, Typography } from '@mui/material'
import { getConfig } from 'config'
import React from 'react'

import Illustration from '../../Illustration'
import useStyles from '../../styles'

const ActionsLogging = () => {
  const { classes, cx } = useStyles()
  const { mailDataProtection } = getConfig().system

  return (
    <Box>
      <Typography variant="h6" className={classes.titleChip}>
        L'enregistrement de vos actions
      </Typography>
      <Typography className={classes.accentText}>
        <strong>
          À chaque connexion à Cohort360, vos actions sont enregistrées par la DSI et conservées pendant 3 ans.
        </strong>
      </Typography>
      <Typography className={classes.accentText}>
        Ces données sont utilisées pour assurer la sécurité du système, réaliser des statistiques d'usage et répondre
        aux demandes d'audit de la CNIL.
      </Typography>
      <Typography className={cx(classes.accentText, classes.accentTextTight)}>
        Vous pouvez accéder à vos données et les rectifier via{' '}
        <Link className={classes.accentLink} href={`mailto:${mailDataProtection}`}>
          {mailDataProtection}
        </Link>
        .
      </Typography>
      <Illustration image={ActionsLoggingArtwork} label="Vos actions sont enregistrées et conservées" />
    </Box>
  )
}

export default ActionsLogging
