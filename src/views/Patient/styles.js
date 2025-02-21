import { makeStyles } from 'tss-react/mui'
import { smallDrawerWidth, largeDrawerWidth } from 'components/Routes/LeftSideBar/LeftSideBar'

export const sidebarWidth = '350px'

export default makeStyles()((theme) => ({
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
  },
  tabs: { marginTop: 20},
  tabTitle: {
    padding: "4px 15px",
    marginRight: 12,
    minWidth: 0,
    fontWeight: 900,
    color: '#0063af',
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
    backgroundColor: '#fff',
    borderRadius: '50px',
    padding: '0px 25px'
  }
}))
