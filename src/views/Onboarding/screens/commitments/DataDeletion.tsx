import DataDeletionArtwork from 'assets/images/onboarding/data-deletion.svg?react'
import { Box, Typography } from '@mui/material'
import React from 'react'

import Illustration from '../../Illustration'
import InfoCallout from '../../InfoCallout'
import useStyles from '../../styles'

const DataDeletion = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Vous supprimez les données à l'issue de votre mission
      </Typography>
      <Typography className={classes.sectionText}>
        En cas de cessation de vos fonctions, ou à la fin de votre projet, vous vous engagez à : supprimer intégralement
        les données, fichiers et supports d'information relatifs à ces données, ainsi que les documents, codes ou moyens
        d'accès que vous détenez, <strong>sans en conserver de copie</strong>.
      </Typography>
      <Illustration image={DataDeletionArtwork} label="Les données sont supprimées en fin de mission" />
      <InfoCallout>
        À l'issue de votre mission, tout accès aux données, en ligne ou par un export conservé, devient illégitime.
      </InfoCallout>
    </Box>
  )
}

export default DataDeletion
