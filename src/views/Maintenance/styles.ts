import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const pageBackground = '#ECF3FF'
const primaryBlue = '#2456AA'
const deepBlue = '#163A71'
const bodyColor = '#1F3663'
const cardBorder = 'rgba(29, 71, 140, 0.28)'
const cardBackground = 'rgba(232, 242, 255, 0.8)'

const useStyles = makeStyles()((theme: Theme) => ({
  page: {
    minHeight: '100vh',
    backgroundColor: pageBackground,
    padding: 0
  },
  header: {
    height: 90,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid rgba(31, 54, 99, 0.08)'
  },
  logo: {
    marginLeft: 'clamp(16px, 8vw, 170px)',
    display: 'inline-flex',
    alignItems: 'center'
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 740,
    marginLeft: 'clamp(0px, 8vw, 160px)',
    marginTop: 'clamp(72px, 14vh, 130px)',
    padding: theme.spacing(0, 3, 8),
    [theme.breakpoints.down('md')]: {
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: theme.spacing(8)
    }
  },
  title: {
    color: primaryBlue,
    fontSize: 'clamp(2rem, 4vw, 3.8rem)',
    lineHeight: 1.04,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    marginBottom: theme.spacing(4)
  },
  subtitle: {
    color: deepBlue,
    fontSize: 'clamp(1.15rem, 1.8vw, 1.55rem)',
    lineHeight: 1.3,
    fontWeight: 700,
    marginBottom: theme.spacing(1)
  },
  bodyText: {
    color: bodyColor,
    fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
    lineHeight: 1.55,
    marginBottom: theme.spacing(0.5)
  },
  list: {
    margin: theme.spacing(1, 0, 2.5),
    paddingLeft: theme.spacing(2.8),
    color: bodyColor,
    fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
    lineHeight: 1.55,
    '& li': {
      marginBottom: theme.spacing(0.5)
    }
  },
  supportLink: {
    color: primaryBlue,
    fontWeight: 700,
    fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
    textDecorationColor: primaryBlue,
    '&:hover': {
      color: deepBlue
    }
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(5),
    width: 'fit-content',
    maxWidth: '100%',
    border: `1px solid ${cardBorder}`,
    borderRadius: 4,
    backgroundColor: cardBackground,
    color: primaryBlue,
    padding: theme.spacing(1.25, 1.6)
  },
  infoBannerText: {
    fontSize: 'clamp(0.82rem, 1.1vw, 0.95rem)',
    lineHeight: 1.35,
    fontWeight: 700
  }
}))

export default useStyles
