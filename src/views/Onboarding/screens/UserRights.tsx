import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Box, CircularProgress, Typography } from '@mui/material'
import moment from 'moment'
import React from 'react'

import { useAppSelector } from 'state'

import useStyles from '../styles'
import { useUserAccesses } from './useUserAccesses'

const UserRights = () => {
  const { classes } = useStyles()
  const displayName = useAppSelector((state) => state.me?.displayName)
  const { loading, hasError, accesses } = useUserAccesses()

  const title = (
    <Typography variant="h4" className={classes.title}>
      Comprendre votre accès
    </Typography>
  )

  if (loading) {
    return (
      <Box>
        {title}
        <Box className={classes.loadingRow}>
          <CircularProgress size={24} />
        </Box>
      </Box>
    )
  }

  if (hasError) {
    return (
      <Box>
        {title}
        <Typography role="alert" className={classes.error}>
          Une erreur est survenue lors de la récupération de vos droits d'accès. Veuillez réessayer ultérieurement.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {title}
      <Box className={classes.fieldBlock}>
        <Typography className={classes.fieldLabel}>Utilisateur :</Typography>
        <Typography className={classes.fieldValue}>{displayName}</Typography>
      </Box>

      <Box className={classes.tileGrid}>
        {accesses.map((access) => (
          <Box key={access.id} className={classes.tile}>
            <Box className={classes.fieldBlock}>
              <Typography className={classes.fieldLabel}>Votre profil :</Typography>
              <Typography className={classes.fieldValue}>{access.profile}</Typography>
            </Box>

            <Box className={classes.fieldBlock}>
              <Typography className={classes.fieldLabel}>Vos droits :</Typography>
              {access.rights.map((right) => (
                <Box key={right} className={classes.rightItem}>
                  <CheckCircleIcon className={classes.checkIcon} fontSize="small" />
                  <Typography className={classes.rightLabel}>{right}</Typography>
                </Box>
              ))}
            </Box>

            <Box className={classes.fieldBlock}>
              <Typography className={classes.fieldLabel}>Votre périmètre des données accessibles :</Typography>
              <Typography className={classes.fieldValue}>{access.perimeter}</Typography>
            </Box>

            <Box className={classes.fieldBlock}>
              <Typography className={classes.fieldLabel}>Date d'expiration de votre accès à Cohort360 :</Typography>
              <Typography className={classes.fieldValue}>
                {access.expirationDate ? moment(access.expirationDate).format('DD/MM/YYYY') : 'Non renseignée'}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default UserRights
