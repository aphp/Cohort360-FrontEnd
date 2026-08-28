import { Box, Link, Typography } from '@mui/material'
import { getConfig } from 'config'
import React from 'react'

import useStyles from '../../styles'

const ActionsLogging = () => {
  const { classes } = useStyles()
  const { mailDataProtection } = getConfig().system

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Vous acceptez que vos actions soient enregistrées
      </Typography>
      <Typography className={classes.sectionText}>
        À chaque connexion à Cohort360, vos actions sont enregistrées par la DSN et conservées pendant 3 ans.
      </Typography>
      <Typography className={classes.sectionText}>
        Vos données d'usage sont utilisées pour assurer la sécurité du système, réaliser des statistiques et répondre
        aux demandes d'audit de la CNIL.
      </Typography>
      <Typography className={classes.sectionText}>
        Vous pouvez accéder à vos données et les rectifier via{' '}
        <Link className={classes.inlineLink} href={`mailto:${mailDataProtection}`}>
          {mailDataProtection}
        </Link>
      </Typography>
    </Box>
  )
}

export default ActionsLogging
