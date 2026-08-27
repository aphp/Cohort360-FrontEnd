import type { Theme } from '@mui/material/styles'
import { eds } from 'styles/palette'
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
    padding: theme.spacing(3, 5),
    backgroundColor: T.surface
  },
  logo: {
    height: 40
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.5, 1),
    borderRadius: 6,
    '&:hover': {
      backgroundColor: eds.blue[50]
    }
  },
  userMenu: {
    marginTop: theme.spacing(1),
    borderRadius: 5,
    border: `1px solid ${T.menuBorder}`,
    boxShadow: '0 4px 2px rgba(0, 0, 0, 0.25)'
  },
  userMenuItem: {
    fontFamily: FONT,
    fontSize: 14,
    lineHeight: '18px',
    color: T.ink,
    padding: theme.spacing(2)
  },
  avatar: {
    width: 30,
    height: 30,
    fontSize: 14,
    color: T.surface,
    backgroundColor: T.avatarBg
  },
  user: {
    fontSize: 14,
    lineHeight: '18px',
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
    gap: theme.spacing(1.5)
  },
  railTail: {
    // As wide as the circle, so the segment hangs from its centre.
    width: 28,
    display: 'flex',
    justifyContent: 'center'
  },
  railSegment: {
    width: 2,
    height: 24,
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
    fontSize: 14,
    fontWeight: 600
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
    lineHeight: '18px'
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
    padding: theme.spacing(5, 5, 4),
    borderRadius: 6,
    border: `1px solid ${T.cardBorder}`,
    backgroundColor: T.surface,
    display: 'flex',
    flexDirection: 'column',
    // L'emphase du corps de texte est un Medium, jamais un gras.
    '& strong': {
      fontWeight: 500
    }
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(7)
  },
  button: {
    padding: theme.spacing(1),
    borderRadius: 5,
    gap: theme.spacing(0.5),
    fontSize: 14,
    lineHeight: '18px',
    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
      margin: 0
    }
  },
  backButton: {
    // Pushed to the opposite edge from the primary action, which stays right-aligned when alone.
    marginRight: 'auto',
    color: T.bodyInk,
    borderColor: T.secondaryActionBorder,
    backgroundColor: T.surface,
    fontWeight: 400,
    '&:hover': {
      borderColor: T.secondaryActionBorder,
      backgroundColor: T.surface
    }
  },
  nextButton: {
    backgroundColor: T.primaryAction,
    color: T.surface,
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
    padding: theme.spacing(0.25, 1),
    borderRadius: 4,
    backgroundColor: eds.blue[50],
    color: T.tagInk,
    fontSize: 14,
    lineHeight: '18px'
  },
  title: {
    color: T.titleInk,
    fontWeight: 700
  },
  sectionTitle: {
    color: T.titleInk,
    fontSize: 28,
    lineHeight: '36px',
    fontWeight: 700
  },
  subTitle: {
    color: T.bodyInk,
    fontSize: 22,
    lineHeight: '28px',
    fontWeight: 500,
    marginTop: theme.spacing(3)
  },
  // Blocks are spaced by 24, but two paragraphs running on from one another only by 8.
  sectionText: {
    color: T.bodyInk,
    fontSize: 16,
    lineHeight: '24px',
    marginTop: theme.spacing(3),
    '& + &': {
      marginTop: theme.spacing(1)
    }
  },
  stepRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    marginTop: theme.spacing(3)
  },
  iconBox: {
    flexShrink: 0,
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.stepIconBg,
    color: T.stepIconFg
  },
  stepTitle: {
    color: T.bodyInk,
    fontSize: 16,
    lineHeight: '24px',
    fontWeight: 500
  },
  stepDesc: {
    color: T.secondaryInk,
    fontSize: 16,
    lineHeight: '24px',
    marginTop: theme.spacing(1)
  },
  error: {
    marginTop: theme.spacing(2),
    color: theme.palette.error.main
  },
  list: {
    color: T.bodyInk,
    fontSize: 16,
    marginTop: theme.spacing(1),
    paddingLeft: theme.spacing(3),
    lineHeight: '24px'
  },
  inlineLink: {
    color: eds.blue[400],
    textDecoration: 'underline'
  },
  downloadLink: {
    display: 'inline-block',
    marginTop: theme.spacing(3),
    color: eds.blue[400],
    fontSize: 16,
    lineHeight: '24px',
    textDecoration: 'underline'
  },
  // The legal references keep the colour of the running text: only the underline sets them apart.
  legalLink: {
    color: 'inherit',
    textDecoration: 'underline'
  },
  divider: {
    marginTop: theme.spacing(3),
    borderColor: eds.blue[200]
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3),
    padding: theme.spacing(1, 0)
  },
  infoBadge: {
    flexShrink: 0
  },
  infoText: {
    color: eds.blue[800],
    fontSize: 16,
    lineHeight: '24px'
  },
  featureSection: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(5),
    '& + &': {
      marginTop: theme.spacing(7)
    }
  },
  commitmentList: {
    marginTop: theme.spacing(3)
  },
  commitmentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginLeft: theme.spacing(2),
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
    color: T.secondaryInk,
    fontSize: 16,
    lineHeight: '24px'
  },
  fieldValue: {
    color: T.bodyInk,
    fontSize: 16,
    lineHeight: '24px',
    fontWeight: 500
  },
  rightItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginTop: theme.spacing(3)
  },
  checkIcon: {
    flexShrink: 0,
    fontSize: 16,
    color: T.commitmentCheck
  },
  rightBadge: {
    flexShrink: 0
  },
  rightCheck: {
    color: T.rightBadgeFg
  },
  rightLabel: {
    color: T.bodyInk,
    fontSize: 16,
    lineHeight: '24px',
    fontWeight: 500
  },
  tileGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    marginTop: theme.spacing(3)
  },
  tile: {
    border: `1px solid ${T.tileBorder}`,
    borderRadius: 4,
    padding: theme.spacing(3, 2),
    backgroundColor: T.tileBg
  },
  tileTitle: {
    color: T.titleInk,
    fontSize: 22,
    lineHeight: '28px',
    fontWeight: 500
  },
  consentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3),
    marginLeft: 0,
    marginRight: 0
  },
  consentCheckbox: {
    padding: 0,
    color: T.consentBorder,
    '& .MuiSvgIcon-root': {
      fontSize: 16
    },
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
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3),
    padding: theme.spacing(1, 0)
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
    aspectRatio: '16 / 9',
    marginTop: theme.spacing(3),
    border: 0,
    borderRadius: 6,
    backgroundColor: T.documentBg
  }
}))

export default useStyles
