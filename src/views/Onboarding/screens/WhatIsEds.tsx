import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined'
import ContactPageOutlinedIcon from '@mui/icons-material/ContactPageOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Box, Divider, Link, Typography } from '@mui/material'
import type { SvgIconProps } from '@mui/material'
import InfoBadge from 'components/ui/InfoBadge'
import type { ComponentType } from 'react'
import React from 'react'

import useStyles from '../styles'

const EDS_URL = 'https://eds.aphp.fr/'

type DataFamily = {
  label: string
  description: string
  icon: ComponentType<SvgIconProps>
}

const DATA_FAMILIES: DataFamily[] = [
  {
    label: 'Socio-démographie des patients',
    description: 'Date de naissance, sexe, zone de résidence, statut vital…',
    icon: ContactPageOutlinedIcon
  },
  {
    label: 'Médico-administratif',
    description: 'Diagnostics, actes, séjours des patients…',
    icon: AssignmentOutlinedIcon
  },
  {
    label: 'Médicaments',
    description: 'Prescriptions, administrations',
    icon: MedicationOutlinedIcon
  },
  {
    label: "Résultats d'examen",
    description: 'Biologie, imagerie',
    icon: BiotechOutlinedIcon
  },
  {
    label: 'Documents médicaux',
    description: "Comptes rendus d'examen, d'hospitalisation, de consultation, lettres de liaison…",
    icon: DescriptionOutlinedIcon
  }
]

const WhatIsEds = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Qu'est-ce que l'EDS ?
      </Typography>
      <Typography className={classes.sectionText}>
        Cohort360 permet d'accéder à de nombreux{' '}
        <strong>jeux de données, issues de l'Entrepôt de Données de Santé de l'AP-HP (EDS)</strong>. L'EDS centralise
        toutes les données collectées dans les 38 hôpitaux de l'AP-HP.
      </Typography>
      <Box className={classes.linkRow}>
        <Link className={classes.link} href={EDS_URL} target="_blank" rel="noopener noreferrer">
          En savoir plus sur l'EDS
          <OpenInNewIcon className={classes.linkIcon} fontSize="inherit" />
        </Link>
      </Box>

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

      <Divider className={classes.divider} />
      <Box className={classes.infoRow}>
        <InfoBadge className={classes.infoBadge} />
        <Typography className={classes.infoText}>
          Selon votre profil d'habilitation, vous accédez à des données nominatives (identité des patients visible) ou
          pseudonymisées (identité masquée).
        </Typography>
      </Box>
    </Box>
  )
}

export default WhatIsEds
