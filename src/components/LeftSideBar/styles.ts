import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'

const drawerWidth = 260

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    hide: {
      display: 'none'
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap'
    },
    drawerOpen: {
      backgroundColor: '#232E6A',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    drawerClose: {
      backgroundColor: '#232E6A',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      overflowX: 'hidden',
      width: 52 // Pourquoi changer la taille ?
      // width: theme.spacing(7) + 1,
      // [theme.breakpoints.up('sm')]: {
      //   width: 52
      // }
    },
    closeDrawerButton: {
      marginRight: '-4px'
    },
    menuButton: {
      marginLeft: '-4px'
    },
    avatar: {
      color: 'white',
      backgroundColor: '#5BC5F2',
      height: '30px',
      width: '30px',
      fontSize: '1rem',
      marginLeft: '-5px',
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
      alignItems: 'center',
      flexShrink: 0,
      lineHeight: 1,
      borderRadius: '50%',
      justifyContent: 'center'
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar
    },
    logoutButton: {
      marginLeft: '6px'
    },
    searchButton: {
      border: '1px white solid;',
      borderRadius: 15,
      width: '100%',
      display: 'initial'
    },
    logoutIcon: {
      width: '15px',
      fill: '#5BC5F2'
    },
    userName: {
      color: '#FFF',
      fontWeight: 600
    },
    listIcon: {
      minWidth: '35px'
    },
    title: {
      color: '#FFF',
      fontSize: '15px',
      lineHeight: '35px'
    },
    nestedList: {
      marginLeft: '36px'
    },
    nestedTitle: {
      color: '#D0D7D8',
      fontSize: '12px',
      lineHeight: '25px'
    },
    button: {
      marginLeft: 7
    },
    plusButton: {
      marginTop: 10,
      marginLeft: -8
    },
    linkHover: {
      color: 'white !important',
      '&:hover': { cursor: 'pointer', textDecoration: 'None' }
    },
    newCohortButton: {
      backgroundColor: '#5BC5F2',
      borderRadius: '29px',
      border: 'none',
      height: '40px',
      '&:hover': {
        backgroundColor: '#499cbf',
        color: '#FFF'
      }
    },
    drawerFooter: {
      flex: 1,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingBottom: theme.spacing(2)
    }
  })
)

export default useStyles
