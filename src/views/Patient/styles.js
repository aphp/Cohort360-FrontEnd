import { createStyles, makeStyles } from 'tss-react/mui'
import { smallDrawerWidth, largeDrawerWidth } from 'components/Routes/LeftSideBar/LeftSideBar'

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
    tabTitle: {
      minWidth: 0,
      color: 'rgba(0, 99, 175, 0.4)',
      borderBottom: '#CFE4FD 2px inset',
      padding: '6px 12px'
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
