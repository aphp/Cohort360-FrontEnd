import { makeStyles, createStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

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
      width: 52
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
    listItem: {
      padding: 16,
      height: 56,
      '& svg': {
        height: 56
      }
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
      fontSize: 13,
      lineHeight: '25px'
    },
    button: {
      marginLeft: 7
    },
    miniButton: {
      borderRadius: 14,
      height: 23,
      width: 23,
      marginLeft: -2,
      backgroundColor: '#fff',
      color: '#153D8A',
      '& svg': {
        fontSize: 18
      },
      '&:hover': { backgroundColor: '#d5d5d5' }
    },
    linkHover: {
      color: 'white',
      '&:hover': { cursor: 'pointer', textDecoration: 'None' }
    },
    newCohortButton: {
      backgroundColor: '#5BC5F2',
      borderRadius: 25,
      border: 'none',
      height: 45,
      '&:hover': {
        backgroundColor: '#499cbf',
        color: '#FFF'
      }
    },
    editCohortButton: {
      backgroundColor: 'transparent',
      border: '2px solid currentColor',
      color: '#5BC5F2',
      borderRadius: 25,
      height: 50,
      '&:hover': {
        color: '#499cbf'
      }
    }
  })
)

export default useStyles
