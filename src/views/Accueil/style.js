import { makeStyles } from '@material-ui/core/styles'
import {
  smallDrawerWidth,
  largeDrawerWidth
} from '../../components/LeftSideBar/LeftSideBar'

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh'
  },
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
  title: {
    flexGrow: 1
  },
  container: {
    paddingTop: theme.spacing(4),
    backgroundColor: theme.background
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column'
  },
  pt3: {
    paddingTop: theme.spacing(3)
  }
}))

export default useStyles
