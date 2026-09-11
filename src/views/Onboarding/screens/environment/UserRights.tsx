import CheckIcon from '@mui/icons-material/Check'
import { Box, CircularProgress, Link, Typography } from '@mui/material'
import CircleBadge from 'components/ui/CircleBadge'
import moment from 'moment'
import React from 'react'

import { useAppSelector } from 'state'

import useStyles from '../../styles'
import { onboardingTokens } from '../../tokens'
import { useUserAccesses } from './useUserAccesses'

const SUPPORT_MAIL = 'id.recherche.support.dsn@aphp.fr'

const UserRights = () => {
  const { classes } = useStyles()
  const displayName = useAppSelector((state) => state.me?.displayName)
  const userName = useAppSelector((state) => state.me?.userName)
  const { loading, hasError, accesses } = useUserAccesses()

  const title = (label: string) => (
    <Typography variant="h4" className={classes.title}>
      {label}
    </Typography>
  )

  if (loading) {
    return (
      <Box>
        {title('Comprendre votre habilitation')}
        <Box className={classes.loadingRow}>
          <CircularProgress size={24} />
        </Box>
      </Box>
    )
  }

  // Un appel en échec comme un périmètre vide laissent l'écran sans rien à montrer : même message,
  // et le parcours reste franchissable.
  if (hasError || accesses.length === 0) {
    return (
      <Box>
        {title('Comprendre votre accès')}
        <Typography role="status" className={classes.sectionText}>
          Le détail de votre accès à Cohort360 n'est pas disponible pour le moment.
        </Typography>
        <Typography className={classes.sectionText}>
          Pour en savoir plus sur vos droits et votre périmètre accessible dans l'application, contactez le support :{' '}
          <Link className={classes.inlineLink} href={`mailto:${SUPPORT_MAIL}`}>
            {SUPPORT_MAIL}
          </Link>
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {title(accesses.length > 1 ? 'Comprendre vos habilitations' : 'Comprendre votre habilitation')}

      <Box className={classes.tileGrid}>
        {accesses.map((access) => (
          <Box key={access.id} className={classes.tile}>
            <Typography className={classes.tileTitle}>{access.profile}</Typography>

            <Box className={classes.fieldBlock}>
              <Typography className={classes.fieldLabel}>NOM Prénom de l'utilisateur :</Typography>
              <Typography className={classes.fieldValue}>{displayName}</Typography>
            </Box>

            <Box className={classes.fieldBlock}>
              <Typography className={classes.fieldLabel}>APH de l'utilisateur :</Typography>
              <Typography className={classes.fieldValue}>{userName}</Typography>
            </Box>

            <Box className={classes.fieldBlock}>
              <Typography className={classes.fieldLabel}>Vos droits :</Typography>
              {access.rights.map((right) => (
                <Box key={right} className={classes.rightItem}>
                  <CircleBadge
                    className={classes.rightBadge}
                    color={onboardingTokens.rightBadgeBg}
                    variant="filled"
                    size={24}
                  >
                    <CheckIcon className={classes.rightCheck} fontSize="inherit" />
                  </CircleBadge>
                  <Typography className={classes.rightLabel}>{right}</Typography>
                </Box>
              ))}
            </Box>

            <Box className={classes.fieldBlock}>
              <Typography className={classes.fieldLabel}>Votre périmètre de données accessibles :</Typography>
              <Typography className={classes.fieldValue}>{access.perimeter}</Typography>
            </Box>

            <Box className={classes.fieldBlock}>
              <Typography className={classes.fieldLabel}>
                Date d'expiration de votre habilitation à Cohort360 :
              </Typography>
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
