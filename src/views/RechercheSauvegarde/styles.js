import { makeStyles } from '@material-ui/core/styles'
import { smallDrawerWidth, largeDrawerWidth } from '../../components/LeftSideBar/LeftSideBar'

const useStyles = makeStyles((theme) => ({
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
    paddingTop: '80px',
    paddingBottom: '20px',
    width: '100%',
    borderBottom: '1px solid #D0D7D8'
  }
}))

export default useStyles
