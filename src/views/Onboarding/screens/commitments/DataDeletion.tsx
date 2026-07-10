import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Avatar, Box, Typography } from '@mui/material'
import React from 'react'

import useStyles from '../../styles'

const DataDeletion = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h5" component="h2" className={classes.titleChip}>
        La suppression de vos données
      </Typography>
      <Typography className={classes.accentText}>
        Vous devez <strong>détruire toutes données sur supports mobiles</strong> dès la fin de leur utilisation. Par
        ailleurs, vous vous engagez à demander la <strong>clôture des accès</strong>, si nécessaire de manière
        anticipée, dès que ces derniers ne sont plus requis.
      </Typography>
      <Box className={classes.illustrationRow}>
        <Avatar className={classes.deletionIcon}>
          <DeleteOutlineIcon />
        </Avatar>
      </Box>
    </Box>
  )
}

export default DataDeletion
