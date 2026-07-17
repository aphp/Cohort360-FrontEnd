import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import { Box, Typography } from '@mui/material'
import type { SvgIconProps } from '@mui/material'
import type { ComponentType } from 'react'
import React from 'react'

import useStyles from '../../styles'

type Purpose = {
  label: string
  icon: ComponentType<SvgIconProps>
}

const PURPOSES: Purpose[] = [
  { label: 'Innovation', icon: LightbulbOutlinedIcon },
  { label: 'Recherche', icon: QueryStatsIcon },
  { label: "Pilotage de l'activité hospitalière", icon: ShareOutlinedIcon }
]

const UsagePurposes = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Les finalités d'usage
      </Typography>
      <Typography className={classes.sectionText}>
        L'Entrepôt de Données de Santé (EDS) de l'AP-HP contient des données à caractère personnel sensibles.
      </Typography>
      <Typography className={classes.sectionLead}>
        Seules certaines finalités d'utilisation des données sont autorisées :
      </Typography>
      {PURPOSES.map(({ label, icon: Icon }) => (
        <Box key={label} className={classes.stepRow}>
          <Box className={classes.iconBox}>
            <Icon fontSize="small" />
          </Box>
          <Typography className={classes.rowLabel}>{label}</Typography>
        </Box>
      ))}
    </Box>
  )
}

export default UsagePurposes
