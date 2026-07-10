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
  },
  sectionText: {
    color: T.muted,
    marginTop: theme.spacing(2),
    lineHeight: 1.6
  },
  subTitle: {
    color: T.ink,
    fontWeight: 700,
    marginTop: theme.spacing(3)
  },
  list: {
    color: T.muted,
    marginTop: theme.spacing(1.5),
    paddingLeft: theme.spacing(3),
    lineHeight: 1.6,
    '& li': {
      marginTop: theme.spacing(0.5)
    }
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.primary.main,
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  linkIcon: {
    fontSize: 16
  },
  linkRow: {
    marginTop: theme.spacing(2)
  },
  divider: {
    marginTop: theme.spacing(3)
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3)
  },
  infoBadge: {
    marginTop: theme.spacing(0.25)
  },
  infoText: {
    color: theme.palette.primary.main,
    lineHeight: 1.6
  },
  loadingRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(4)
  },
  fieldBlock: {
    marginTop: theme.spacing(3)
  },
  fieldLabel: {
    color: T.muted
  },
  fieldValue: {
    color: T.ink,
    fontWeight: 700
  },
  rightItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(1.5)
  },
  checkIcon: {
    flexShrink: 0,
    color: theme.palette.success.main
  },
  rightLabel: {
    color: T.ink,
    fontWeight: 700
  },
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  tile: {
    border: `1px solid ${T.cardBorder}`,
    borderRadius: 6,
    padding: theme.spacing(1, 3, 3),
    backgroundColor: T.tileBg
  },
  warningNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5)
  },
  warningNoticeBoxed: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: 6,
    border: `1px solid ${T.warning}`,
    backgroundColor: T.surface
  },
  warningNoticeInline: {
    marginTop: theme.spacing(3)
  },
  warningIcon: {
    flexShrink: 0,
    color: T.warning
  },
  warningText: {
    color: T.warning,
    fontWeight: 600,
    lineHeight: 1.5
  },
  titleChip: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing(-6.5),
    marginLeft: theme.spacing(-2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1, 2),
    borderRadius: 6,
    backgroundColor: T.chipBg,
    color: T.surface,
    fontWeight: 700
  },
  bareTitle: {
    color: T.chipBg,
    fontWeight: 700,
    marginBottom: theme.spacing(4)
  },
  illustrationRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(4)
  },
  illustration: {
    // The exported artwork carries fixed width/height attributes: override them to scale down.
    width: '100%',
    height: 'auto',
    maxWidth: 552
  },
  deletionIcon: {
    width: 56,
    height: 56,
    backgroundColor: T.chipBg
  },
  documentViewer: {
    padding: theme.spacing(3),
    borderRadius: 6,
    backgroundColor: T.documentBg
  },
  documentFrame: {
    display: 'block',
    width: '100%',
    height: 420,
    border: 'none',
    backgroundColor: T.surface
  },
  documentFallback: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(6),
    backgroundColor: T.surface
  },
  confirmationIcon: {
    alignSelf: 'center',
    fontSize: 72,
    color: theme.palette.success.main
  },
  confirmationTitle: {
    marginTop: theme.spacing(3),
    color: T.ink,
    fontWeight: 700
  }
}))

export default useStyles
