import { makeStyles } from '@material-ui/core/styles'
import { smallDrawerWidth, largeDrawerWidth } from 'components/LeftSideBar/LeftSideBar'

export default makeStyles((theme) => ({
  appBar: {
    marginLeft: smallDrawerWidth,
    width: `calc(100% - ${smallDrawerWidth}px)`,
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: largeDrawerWidth,
    width: `calc(100% - ${largeDrawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  tabs: { margin: '8px 0' },
  tabTitle: {
    minWidth: 0,
    fontWeight: 900,
    color: '#5BC5F2',
    // border: `3px solid currentColor`,
    borderRadius: 4,
    marginRight: 12,
    padding: '4px 8px',
    '&:last-child': {
      marginRight: 0
    },
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  indicator: {
    height: 0,
    opacity: 0
  },
  selected: {
    color: '#0063AF'
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  },
  alert: {
    marginLeft: '50px'
  }
}))
