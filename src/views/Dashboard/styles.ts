import { makeStyles } from '@material-ui/core/styles'
import { smallDrawerWidth, largeDrawerWidth } from '../../components/LeftSideBar/LeftSideBar'

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
  tabs: {
    backgroundColor: '#153D8A'
  },
  tabTitle: {
    minWidth: 0,
    color: '#FFF',
    fontWeight: 400
  },
  indicator: {
    backgroundColor: '#5BC5F2',
    height: '5px'
  },
  selected: {
    backgroundColor: '#0063AF'
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
