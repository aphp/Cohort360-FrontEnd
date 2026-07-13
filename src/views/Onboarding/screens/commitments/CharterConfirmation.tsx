import CheckIcon from '@mui/icons-material/Check'
import { Box, Divider, Typography } from '@mui/material'
import InfoBadge from 'components/ui/InfoBadge'
import React from 'react'

import useStyles from '../../styles'

const CharterConfirmation = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <CheckIcon className={classes.confirmationIcon} />
      <Typography variant="h4" className={classes.confirmationTitle}>
        Votre charte d'engagement a bien été signée.
      </Typography>
      <Typography className={classes.sectionText}>
        Vous pouvez maintenant accéder à une présentation guidée de 3 fonctionnalités clés de Cohort360 ou bien accéder
        directement à l'outil.
      </Typography>

      <Divider className={classes.divider} />
      <Box className={classes.infoRow}>
        <InfoBadge className={classes.infoBadge} />
        <Typography className={classes.infoText}>
          Vous pourrez retrouver la prise en main guidée dans le centre d'aide de Cohort360, accessible à tout moment
          dans l'outil.
        </Typography>
      </Box>
    </Box>
  )
}

export default CharterConfirmation
