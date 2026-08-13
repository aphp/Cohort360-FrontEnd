import { Box, Typography } from '@mui/material'
import React from 'react'

import useStyles from '../../styles'

const DataAccess = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        L'accès aux données de l'EDS
      </Typography>
      <Typography className={classes.sectionText}>
        Votre accès aux données via Cohort360 est déterminé par des <strong>droits d'habilitation</strong> appliqués à
        un <strong>périmètre de données</strong> accessibles.
      </Typography>
      <Typography className={classes.sectionText}>
        Votre périmètre d'accès dépend des unités fonctionnelles ou hôpitaux auxquelles vous avez été habilité.
      </Typography>
      <ul className={classes.list}>
        <li>
          <strong>Cas général :</strong> vous êtes rattaché à une ou plusieurs unités fonctionnelles, vous avez accès
          aux patients pris en charge par cette ou ces unités fonctionnelles.
        </li>
        <li>
          <strong>Recherche multicentrique :</strong> votre accès est limité aux unités fonctionnelles validées dans le
          cadre de votre projet de recherche.
        </li>
      </ul>
    </Box>
  )
}

export default DataAccess
