import { makeStyles } from '@material-ui/core/styles'
import { smallDrawerWidth, largeDrawerWidth } from '../../components/LeftSideBar/LeftSideBar'

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    width: `calc(100% - ${smallDrawerWidth}px)`,
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    paddingTop: theme.spacing(4),
    backgroundColor: theme.palette.background.default
  },
  appBarShift: {
    marginLeft: largeDrawerWidth,
    width: `calc(100% - ${largeDrawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  requestsContainer: {
    padding: theme.spacing(2)
  },
  requestList: {
    marginBlock: theme.spacing(2)
  },
  noRequest: {
    fontStyle: 'italic'
  }
}))

export default useStyles
