import { createStyles, makeStyles } from '@material-ui/core/styles'
import { smallDrawerWidth, largeDrawerWidth } from '../../components/LeftSideBar/LeftSideBar'

export const sidebarWidth = '350px'

export default makeStyles((theme) =>
  createStyles({
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
    },
    alert: {
      marginLeft: '50px'
    },
    openLeftBar: {
      backgroundColor: '#FFF',
      width: 30,
      height: 101,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0px 3px 6px #0000000A',
      borderRadius: '2px 0px 0px 2px',
      top: 72,
      right: 0,
      position: 'fixed'
    }
  })
)
