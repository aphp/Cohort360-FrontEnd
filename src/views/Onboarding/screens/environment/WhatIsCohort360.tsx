import BiotechIcon from '@mui/icons-material/Biotech'
import ContactPageIcon from '@mui/icons-material/ContactPage'
import EditDocumentIcon from '@mui/icons-material/EditDocument'
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation'
import MedicationIcon from '@mui/icons-material/Medication'
import { Box, Link, Typography } from '@mui/material'
import type { SvgIconProps } from '@mui/material'
import type { ComponentType } from 'react'
import React from 'react'

import InfoCallout from '../../InfoCallout'
import useStyles from '../../styles'

const EDS_URL = 'https://panorama.eds.aphp.fr/explorer-les-donnees'

type DataFamily = {
  label: string
  description: string
  icon: ComponentType<SvgIconProps>
}

const DATA_FAMILIES: DataFamily[] = [
  {
    label: 'Socio-démographie des patients',
    description: 'Date de naissance, sexe, zone de résidence, statut vital…',
    icon: ContactPageIcon
  },
  {
    label: 'Médico-administratif',
    description: 'Diagnostics, actes, séjours des patients…',
    icon: MedicalInformationIcon
  },
  {
    label: 'Médicaments',
    description: 'Prescriptions et administrations.',
    icon: MedicationIcon
  },
  {
    label: "Résultats d'examen",
    description: 'Biologie, imagerie…',
    icon: BiotechIcon
  },
  {
    label: 'Documents médicaux',
    description: "Comptes rendus d'examen, d'hospitalisation, de consultation, lettres de liaison…",
    icon: EditDocumentIcon
  }
]

const WhatIsCohort360 = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Qu'est-ce que Cohort360 ?
      </Typography>
      <Typography className={classes.sectionText}>
        C'est un outil de datavisualisation visant à constituer des cohortes de patients. Il permet de dénombrer des
        patients, d'analyser des données de soin et de les extraire à des fins de recherche et d'analyse.
      </Typography>
      <Typography className={classes.sectionText}>
        Cohort360 permet d'accéder à de nombreux <strong>jeux de données, issus des 38 hôpitaux de l'AP-HP</strong> et
        centralisés dans{' '}
        <Link className={classes.inlineLink} href={EDS_URL} target="_blank" rel="noopener noreferrer">
          l'Entrepôt de Données de Santé (EDS)
        </Link>
        .
      </Typography>

      <Typography className={classes.subTitle}>Les données de l'EDS</Typography>
      {DATA_FAMILIES.map(({ label, description, icon: Icon }) => (
        <Box key={label} className={classes.stepRow}>
          <Box className={classes.iconBox}>
            <Icon fontSize="small" />
          </Box>
          <Box>
            <Typography className={classes.stepTitle}>{label}</Typography>
            <Typography className={classes.stepDesc}>{description}</Typography>
          </Box>
        </Box>
      ))}

      <InfoCallout>
        Selon votre profil d'habilitation, vous accédez à des données nominatives (identité des patients visible) ou
        pseudonymisées (identité masquée).
      </InfoCallout>
    </Box>
  )
}

export default WhatIsCohort360
