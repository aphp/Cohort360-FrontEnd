import { Box, Typography } from '@mui/material'
import React from 'react'

import FeatureVideo from '../../FeatureVideo'
import useStyles from '../../styles'
import ExportDeniedAlert from './ExportDeniedAlert'

// Positions des chapitres dans le tutoriel, en secondes.
const TUTORIALS = {
  query: 1,
  exploration: 314,
  export: 618
}

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
        <FeatureVideo startAt={TUTORIALS.query} label="Créer une cohorte grâce au requêteur" />
      </Box>

      <Box className={classes.featureSection}>
        <Typography variant="h5" className={classes.sectionTitle}>
          Comment explorer les données ?
        </Typography>
        <Typography className={classes.sectionText}>
          Cohort360 comprend un espace d'exploration de données en ligne pour explorer un patient ou un groupe de
          patient (périmètre).
        </Typography>
        <FeatureVideo startAt={TUTORIALS.exploration} label="Explorer les données d'un patient ou groupe de patients" />
      </Box>

      <Box className={classes.featureSection}>
        <Typography variant="h5" className={classes.sectionTitle}>
          Comment exporter des données ?
        </Typography>
        <ExportDeniedAlert />
        <Typography className={classes.sectionText}>
          Cohort360 permet d'exporter les données de jusqu’à 20 000 patients sur votre ordinateur (en .csv et en .xlsx).
        </Typography>
        <FeatureVideo startAt={TUTORIALS.export} label="Exporter des données" />
      </Box>
    </Box>
  )
}

export default KeyFeatures
