import type { Theme } from '@mui/material/styles'
import { makeStyles } from 'tss-react/mui'

import { onboardingTokens as T } from './tokens'

const useStyles = makeStyles()((theme: Theme) => ({
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: T.pageBg
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 4),
    backgroundColor: T.surface
  },
  logo: {
    height: 40
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5)
  },
  avatar: {
    width: 36,
    height: 36,
    fontSize: 14,
    fontWeight: 700,
    color: T.surface,
    backgroundColor: T.avatarBg
  },
  user: {
    fontWeight: 600,
    color: T.ink
  },
  body: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6)
  },
  group: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(8)
  },
  stepper: {
    marginTop: theme.spacing(3),
    minWidth: 200
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: `2px solid ${T.stepCircleBorder}`,
    backgroundColor: T.surface,
    color: T.stepCircleInactive,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700
  },
  stepCircleActive: {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main
  },
  stepLabel: {
    color: T.muted
  },
  contentCol: {
    display: 'flex',
    flexDirection: 'column',
    width: 640,
    maxWidth: '100%'
  },
  card: {
    width: '100%',
    padding: theme.spacing(5),
    borderRadius: 6,
    border: `1px solid ${T.cardBorder}`,
    backgroundColor: T.surface,
    boxShadow: T.cardShadow,
    display: 'flex',
    flexDirection: 'column'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(3)
  },
  title: {
    color: T.ink,
    fontWeight: 700
  },
  intro: {
    color: T.muted,
    marginTop: theme.spacing(2)
  },
  stepRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    marginTop: theme.spacing(3)
  },
  iconBox: {
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.stepIconBg,
    color: T.stepIconFg
  },
  stepTitle: {
    color: T.ink,
    fontWeight: 700
  },
  stepDesc: {
    color: T.muted
  },
  error: {
    marginTop: theme.spacing(2),
    color: theme.palette.error.main
  }
}))

export default useStyles
