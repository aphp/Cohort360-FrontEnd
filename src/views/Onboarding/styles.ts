import type { Theme } from '@mui/material/styles'
import { eds } from 'styles/palette'
import { makeStyles } from 'tss-react/mui'

import { onboardingTokens as T } from './tokens'

const FONT = "'Rubik', sans-serif"

const useStyles = makeStyles()((theme: Theme) => ({
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: T.pageBg,
    fontFamily: FONT,
    '& .MuiTypography-root, & .MuiButton-root': {
      fontFamily: FONT
    }
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
    gap: theme.spacing(1.5),
    padding: theme.spacing(0.5, 1),
    borderRadius: 6,
    '&:hover': {
      backgroundColor: eds.blue[50]
    }
  },
  userMenu: {
    marginTop: theme.spacing(1),
    borderRadius: 6
  },
  userMenuItem: {
    fontFamily: FONT,
    color: T.ink,
    padding: theme.spacing(1.5, 3)
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
    // Anchored to the top rather than centred: the rail must not drift when a card grows.
    alignItems: 'flex-start',
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
    width: 220,
    flexShrink: 0
  },
  rail: {
    listStyle: 'none',
    margin: 0,
    padding: 0
  },
  railItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  railHead: {
    display: 'flex',
    // Centres the label on the circle, however many lines the label takes.
    alignItems: 'center',
    gap: theme.spacing(2)
  },
  railTail: {
    // As wide as the circle, so the segment hangs from its centre.
    width: 28,
    display: 'flex',
    justifyContent: 'center'
  },
  railSegment: {
    width: 2,
    height: 40,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    backgroundColor: T.railTodo
  },
  railSegmentFill: {
    display: 'block',
    width: '100%',
    backgroundColor: T.railDone
  },
  stepCircle: {
    flexShrink: 0,
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: T.surface,
    color: T.railDone,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700
  },
  stepCircleActive: {
    backgroundColor: T.railDone,
    color: T.surface
  },
  stepCircleCompleted: {
    color: T.railDone
  },
  stepLabel: {
    color: T.railInactiveFg,
    lineHeight: 1.35
  },
  stepLabelActive: {
    color: T.ink,
    fontWeight: 600
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
    display: 'flex',
    flexDirection: 'column'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(3)
  },
  backButton: {
    // Pushed to the opposite edge from the primary action, which stays right-aligned when alone.
    marginRight: 'auto',
    color: eds.blue[400],
    borderColor: eds.blue[400],
    backgroundColor: T.surface,
    '&:hover': {
      borderColor: eds.blue[400],
      backgroundColor: T.surface
    }
  },
  nextButton: {
    backgroundColor: eds.blue[400],
    color: T.surface,
    '&:hover': {
      backgroundColor: eds.blue[600]
    }
  },
  title: {
    color: T.ink,
    fontWeight: 700
  },
  intro: {
    color: T.muted,
    fontSize: 16,
    marginTop: theme.spacing(2)
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: 700
  },
  stepDesc: {
    color: T.muted,
    fontSize: 16
  },
  error: {
    marginTop: theme.spacing(2),
    color: theme.palette.error.main
  },
  sectionText: {
    color: T.ink,
    fontSize: 16,
    marginTop: theme.spacing(2),
    lineHeight: 1.6
  },
  subTitle: {
    color: T.ink,
    fontSize: 22,
    fontWeight: 700,
    marginTop: theme.spacing(3)
  },
  sectionLead: {
    color: T.ink,
    fontSize: 16,
    fontWeight: 700,
    marginTop: theme.spacing(3)
  },
  rowLabel: {
    color: T.ink,
    fontSize: 16
  },
  list: {
    color: T.ink,
    fontSize: 16,
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
    color: eds.blue[400],
    fontSize: 16,
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
    marginTop: theme.spacing(3),
    borderColor: eds.blue[200]
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3)
  },
  infoBadge: {
    flexShrink: 0
  },
  infoText: {
    color: eds.blue[800],
    fontSize: 16,
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
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3)
  },
  warningBadge: {
    flexShrink: 0
  },
  warningText: {
    color: T.warning,
    fontWeight: 600,
    lineHeight: 1.5
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
    backgroundColor: T.deepBlue
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
    display: 'block',
    margin: '0 auto',
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
