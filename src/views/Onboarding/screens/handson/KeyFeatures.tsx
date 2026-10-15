import { Box, Typography } from '@mui/material'
import React from 'react'

import FeatureVideo from '../../FeatureVideo'
import useStyles from '../../styles'
import { TUTORIAL_VIDEOS } from '../../tutorials'
import ExportDeniedAlert from './ExportDeniedAlert'

const KeyFeatures = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Prendre en main l'outil
      </Typography>

      <Box className={classes.featureSection}>
        <Typography variant="h5" className={classes.sectionTitle}>
          Comment utiliser le requêteur ?
        </Typography>
        <Typography className={classes.sectionText}>
          Le requêteur vous permet de <strong>combiner plusieurs critères</strong> (âge, pathologie, période,
          traitements...) pour <strong>générer une cohorte de patients</strong>.
        </Typography>
        <Typography className={classes.sectionText}>
          Les données de l'EDS étant en mouvement, votre cohorte correspond à une{' '}
          <strong>« photographie » de vos critères à un instant T</strong> au sein de votre périmètre.
        </Typography>
        <FeatureVideo src={TUTORIAL_VIDEOS.query} label="Créer une cohorte grâce au requêteur" />
      </Box>

      <Box className={classes.featureSection}>
        <Typography variant="h5" className={classes.sectionTitle}>
          Comment explorer les données ?
        </Typography>
        <Typography className={classes.sectionText}>
          Cohort360 comprend un espace d'exploration de données en ligne pour explorer un patient ou un groupe de
          patient (périmètre).
        </Typography>
        <FeatureVideo
          src={TUTORIAL_VIDEOS.exploration}
          label="Explorer les données d'un patient ou groupe de patients"
        />
      </Box>

      <Box className={classes.featureSection}>
        <Typography variant="h5" className={classes.sectionTitle}>
          Comment exporter des données ?
        </Typography>
        <ExportDeniedAlert />
        <Typography className={classes.sectionText}>
          Cohort360 permet d'exporter les données de jusqu’à 20 000 patients sur votre ordinateur (en .csv et en .xlsx).
        </Typography>
        <FeatureVideo src={TUTORIAL_VIDEOS.export} label="Exporter des données" />
      </Box>
    </Box>
  )
}

export default KeyFeatures
