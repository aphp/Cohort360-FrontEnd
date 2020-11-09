import { makeStyles } from '@material-ui/core/styles'
import { smallDrawerWidth, largeDrawerWidth } from '../../components/LeftSideBar/LeftSideBar'

export default makeStyles((theme) => ({
  appBar: {
    marginLeft: smallDrawerWidth,
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
  tabTitle: {
    minWidth: 0,
    color: '#43425D',
    textTransform: 'none'
  },
  selectedTabTitle: {
    color: '#43425D',
    textDecoration: 'underline'
  },
  mainContainer: {
    width: '100%',
    height: 'calc(100vh - 72px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
    // paddingTop: theme.spacing(3),
    // paddingBottom: theme.spacing(3)
  }
}))
