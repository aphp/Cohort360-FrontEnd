import { Box, Link, Typography } from '@mui/material'
import React from 'react'
import { MFA_HELP_URL, MFA_SUPPORT_MAIL } from './mfaNoticePhase'
import useStyles from './styles'

type MfaHelpTextProps = {
  bold?: boolean
  className?: string
}

export const MfaHelpText = ({ bold = false }: MfaHelpTextProps) => {
  const { classes, cx } = useStyles()
  return (
    <Typography id="mfa-help" className={cx(classes.mfaHelp, bold && classes.mfaHelpBold)}>
      Si vous rencontrez des difficultés à la connexion, vous trouverez le mode d'emploi étape par étape en suivant{' '}
      <Link href={MFA_HELP_URL} target="_blank" rel="noopener noreferrer" color="inherit">
        ce lien
      </Link>{' '}
      ou contacter l'adresse de support{' '}
      <Link href={`mailto:${MFA_SUPPORT_MAIL}`} color="inherit">
        {MFA_SUPPORT_MAIL}
      </Link>{' '}
      le cas échéant.
    </Typography>
  )
}

type MfaBannerProps = {
  withHelp?: boolean
}

export const MfaBanner = ({ withHelp = false }: MfaBannerProps) => {
  const { classes } = useStyles()
  return (
    <Box id="mfa-banner" className={classes.mfaBanner}>
      <Typography className={classes.mfaBannerTitle}>A partir du 29 octobre 2026 : double authentification</Typography>
      <Typography className={classes.mfaBannerBody}>
        Les applications de l'Entrepôt de données de santé donnent accès à des données sensibles.
        <br />
        Pour mieux protéger votre compte, vous devrez confirmer votre identité en plus de votre mot de passe, via
        Microsoft Authenticator, Pro Sante Connect ou email.
      </Typography>
      {withHelp && <MfaHelpText bold />}
    </Box>
  )
}
