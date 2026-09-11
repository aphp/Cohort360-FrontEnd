import { Box, Link, Typography } from '@mui/material'
import React from 'react'

import useStyles from '../../styles'
import WarningNotice from '../../WarningNotice'

const EDS_ACCESS_RULES_URL = 'https://eds.aphp.fr/wp-content/uploads/2024/11/Regles-Acces_EDS-APHP_20210209.pdf'
const DATA_PROTECTION_ACT_URL = 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000886460/'

const UsageRules = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Les règles d'utilisation des données dans Cohort360
      </Typography>
      <Typography className={classes.sectionText}>
        En accédant à Cohort360, vous vous engagez à respecter plusieurs règles d'utilisation des données de santé de
        l'EDS.
      </Typography>
      <Typography className={classes.sectionText}>
        Les règles d'utilisation qui vont vous être présentées sont conformes :
      </Typography>
      <ul className={classes.list}>
        <li>
          <Link className={classes.legalLink} href={EDS_ACCESS_RULES_URL} target="_blank" rel="noopener noreferrer">
            aux règles d'accès à l'EDS de l'AP-HP à des fins de recherche
          </Link>
        </li>
        <li>
          aux dispositions réglementaires applicables, notamment issues du{' '}
          <Link className={classes.legalLink} href={DATA_PROTECTION_ACT_URL} target="_blank" rel="noopener noreferrer">
            Règlement général sur la protection des données, de la loi n° 78-17 du 6 janvier 1978 relative à
            l'informatique, aux fichiers et aux libertés modifiée, et du code pénal.
          </Link>
        </li>
      </ul>
      <WarningNotice />
    </Box>
  )
}

export default UsageRules
