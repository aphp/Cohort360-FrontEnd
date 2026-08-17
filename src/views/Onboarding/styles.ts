import type { Theme } from '@mui/material/styles'
import { aphp, eds } from 'styles/palette'
import { makeStyles } from 'tss-react/mui'

import { onboardingTokens as T } from './tokens'

const FONT = "'Rubik', sans-serif"

const RAIL_WIDTH = 200
const RAIL_GAP = 64
const CARD_WIDTH = 600

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
    padding: theme.spacing(3, 4),
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
    // 116px below the banner, where the mockups place the top of the card.
    padding: theme.spacing(14.5, 6, 6)
  },
  group: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: RAIL_GAP,
    marginLeft: -(RAIL_WIDTH + RAIL_GAP)
  },
  stepper: {
    marginTop: theme.spacing(5.5),
    width: RAIL_WIDTH,
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
    fontSize: 14,
    lineHeight: 1.35
  },
  stepLabelActive: {
    color: T.ink
  },
  contentCol: {
    display: 'flex',
    flexDirection: 'column',
    width: CARD_WIDTH,
    maxWidth: '100%'
  },
  card: {
    width: '100%',
    padding: theme.spacing(5, 3, 4),
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
    marginTop: theme.spacing(7)
  },
  backButton: {
    // Pushed to the opposite edge from the primary action, which stays right-aligned when alone.
    marginRight: 'auto',
    color: T.bodyInk,
    borderColor: T.secondaryActionBorder,
    backgroundColor: T.surface,
    fontSize: 14,
    fontWeight: 400,
    '&:hover': {
      borderColor: T.secondaryActionBorder,
      backgroundColor: T.surface
    }
  },
  nextButton: {
    backgroundColor: T.primaryAction,
    color: T.surface,
    fontSize: 14,
    fontWeight: 600,
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: T.primaryActionHover,
      boxShadow: 'none'
    },
    '&.Mui-disabled': {
      backgroundColor: eds.blue[100],
      color: T.surface
    }
  },
  screenTag: {
    display: 'inline-block',
    // Flex item of the card: without this the pill stretches to the full width.
    alignSelf: 'flex-start',
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(0.25, 1.5),
    borderRadius: 4,
    backgroundColor: eds.blue[50],
    color: eds.blue[800],
    fontSize: 14,
    lineHeight: '18px'
  },
  title: {
    color: T.titleInk,
    fontWeight: 700
  },
  welcomeTitle: {
    color: T.ink,
    fontWeight: 700
  },
  intro: {
    color: T.muted,
    fontSize: 16,
    lineHeight: '24px',
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
    fontSize: 16,
    lineHeight: '24px'
  },
  error: {
    marginTop: theme.spacing(2),
    color: theme.palette.error.main
  },
  sectionText: {
    color: T.bodyInk,
    fontSize: 16,
    marginTop: theme.spacing(2),
    lineHeight: '24px'
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
    fontSize: 16,
    lineHeight: '24px'
  },
  list: {
    color: T.bodyInk,
    fontSize: 16,
    marginTop: theme.spacing(1.5),
    paddingLeft: theme.spacing(3),
    lineHeight: '24px',
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
    textDecoration: 'underline'
  },
  inlineLink: {
    color: eds.blue[400],
    fontWeight: 600,
    textDecoration: 'underline'
  },
  // The legal references keep the colour of the running text: only the underline sets them apart.
  legalLink: {
    color: 'inherit',
    textDecoration: 'underline'
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
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3)
  },
  infoBadge: {
    flexShrink: 0
  },
  infoText: {
    color: eds.blue[800],
    fontSize: 16,
    lineHeight: '24px'
  },
  commitmentList: {
    marginTop: theme.spacing(5)
  },
  commitmentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginLeft: theme.spacing(3),
    minHeight: 40
  },
  commitmentLabel: {
    color: T.bodyInk,
    fontSize: 16,
    lineHeight: '24px'
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
    color: T.muted,
    fontSize: 16,
    lineHeight: '24px'
  },
  fieldValue: {
    color: T.ink,
    fontSize: 16,
    lineHeight: '24px',
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
    color: T.commitmentCheck
  },
  rightBadge: {
    flexShrink: 0,
    backgroundColor: aphp.vertClair[500],
    color: aphp.vert[600],
    '& svg': {
      color: aphp.vert[600]
    }
  },
  rightCheck: {
    color: aphp.vert[600]
  },
  rightLabel: {
    color: T.ink,
    fontSize: 16,
    lineHeight: '24px',
    fontWeight: 700
  },
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  tile: {
    border: `1px solid ${aphp.vert[100]}`,
    borderRadius: 6,
    padding: theme.spacing(1, 3, 3),
    backgroundColor: aphp.vert[25]
  },
  consentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(3),
    marginLeft: 0,
    marginRight: 0
  },
  consentCheckbox: {
    color: eds.blue[400],
    '&.Mui-checked': {
      color: eds.blue[400]
    }
  },
  consentText: {
    color: T.bodyInk,
    fontSize: 16,
    lineHeight: '24px'
  },
  warningNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3)
  },
  warningBadge: {
    flexShrink: 0
  },
  warningText: {
    color: T.warning,
    fontSize: 16,
    lineHeight: '24px'
  },
  illustrationRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(3)
  },
  illustration: {
    maxWidth: '100%',
    height: 'auto'
  },
  video: {
    display: 'block',
    width: '100%',
    marginTop: theme.spacing(3),
    borderRadius: 6,
    backgroundColor: T.documentBg
  }
}))

export default useStyles
