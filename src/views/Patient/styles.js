import { makeStyles } from '@material-ui/core/styles'
import {
  smallDrawerWidth,
  largeDrawerWidth
} from '../../components/LeftSideBar/LeftSideBar'

export const sidebarWidth = '350px'

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
  contentShift: {
    marginRight: sidebarWidth
  },
  sidebarButton: {
    position: 'fixed',
    top: '60px',
    right: 0
  },
  tabList: {
    '> span ': {
      backgroundColor: '#F9F8F8'
    }
  },
  tabTitle: {
    minWidth: 0,
    color: 'rgba(0, 99, 175, 0.4)',
    fontWeight: 'regular',
    borderBottom: '#CFE4FD 2px inset'
  },
  tabContainer: {
    paddingTop: theme.spacing(3),
    width: '100%'
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  }
}))
