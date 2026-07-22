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
        Prendre en main Cohort360
      </Typography>

      <Typography variant="h5" className={classes.subTitle}>
        1 - Créer une cohorte grâce au requêteur
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
        2 - Explorer les données
      </Typography>
      <Typography className={classes.sectionText}>
        L'exploration de données vous permet d'accéder aux données associées à un patient ou à différents groupes de
        patients.
      </Typography>
      <FeatureVideo name="parcours_patient" label="Explorer les données" />

      {!deidentified && (
        <>
          <Typography variant="h5" className={classes.subTitle}>
            3 - Exporter des données (accès nominatif uniquement)
          </Typography>
          <Typography className={classes.sectionText}>
            La fonctionnalité d'export de cohortes en local est disponible uniquement :
          </Typography>
          <ul className={classes.list}>
            <li>pour les comptes avec un profil nominatif en périmètre équipe de soin</li>
            <li>pour les cohortes de moins de 20 000 patients</li>
          </ul>
          <FeatureVideo name="export_dataset" label="Exporter des données" />
        </>
      )}
    </Box>
  )
}

export default KeyFeatures
