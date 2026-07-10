import { Box, Link, Typography } from '@mui/material'
import { getConfig } from 'config'
import React from 'react'

import IllustrationPlaceholder from '../../IllustrationPlaceholder'
import useStyles from '../../styles'

const ActionsLogging = () => {
  const { classes } = useStyles()
  const { mailDataProtection } = getConfig().system

  return (
    <Box>
      <Typography variant="h6" className={classes.titleChip}>
        L'enregistrement de vos actions
      </Typography>
      <Typography className={classes.sectionText}>
        Chacune de vos actions dans Cohort360 est <strong>enregistrée et conservée</strong> : les requêtes que vous
        lancez, les cohortes que vous créez et les données que vous exportez.
      </Typography>
      <Typography className={classes.sectionText}>
        Ces enregistrements permettent de vérifier que les données de santé sont utilisées conformément aux finalités
        autorisées. Pour toute question sur ces traitements, écrivez à{' '}
        <Link className={classes.link} href={`mailto:${mailDataProtection}`}>
          {mailDataProtection}
        </Link>
        .
      </Typography>
      <IllustrationPlaceholder label="Illustration : enregistrement et conservation des actions" />
    </Box>
  )
}

export default ActionsLogging
