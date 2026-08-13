import { Box, Typography } from '@mui/material'
import React from 'react'

import { useAppSelector } from 'state'

import FeatureVideo from '../../FeatureVideo'
import useStyles from '../../styles'

const KeyFeatures = () => {
  const { classes } = useStyles()
  // Unknown access falls back to the pseudonymised journey, which hides the export video (RG3310.02).
  const deidentified = useAppSelector((state) => state.me?.deidentified ?? true)

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Prendre en main l'outil
      </Typography>

      <Typography variant="h5" className={classes.subTitle}>
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
      <FeatureVideo name="constitution_cohorte" label="Créer une cohorte grâce au requêteur" />

      <Typography variant="h5" className={classes.subTitle}>
        Comment explorer les données ?
      </Typography>
      <Typography className={classes.sectionText}>
        Cohort360 comprend un espace d'exploration de données en ligne pour explorer un patient ou un groupe de patient
        (périmètre).
      </Typography>
      <FeatureVideo name="parcours_patient" label="Explorer les données" />

      {!deidentified && (
        <>
          <Typography variant="h5" className={classes.subTitle}>
            Comment exporter des données ?
          </Typography>
          <Typography className={classes.sectionText}>
            La fonctionnalité d'export de cohortes sur votre ordinateur (en .csv et en .xlsx) est disponible uniquement
            pour certaines habilitations et limité à 20 000 patients par export.
          </Typography>
          <FeatureVideo name="export_dataset" label="Exporter des données" />
        </>
      )}
    </Box>
  )
}

export default KeyFeatures
